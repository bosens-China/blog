import asyncio
import hashlib
import logging
import mimetypes
import os
import time
from urllib.parse import urlparse

import boto3
import httpx
from botocore.config import Config
from configs.storage import storage_settings
from schemas import Article
from services.cache import image_cache
from services.service_status import service_status
from utils.dogecloud_storage import get_doge_token
from utils.markdown_utils import markdown_utils

logger = logging.getLogger(__name__)


class GlobalImageProcessor:
    semaphore: asyncio.Semaphore

    def __init__(self) -> None:
        self.semaphore = asyncio.Semaphore(storage_settings.MAX_IMAGE_CONCURRENCY)

    async def process_articles(self, articles: list[Article]) -> list[Article]:
        """
        处理文章列表中的图片：
        1. 提取所有 URL
        2. 全局去重
        3. 并发上传
        4. 替换原文
        """
        if not articles:
            return []

        # 1. 提取所有 URL 并建立反向映射 (文章 -> URLs)
        all_urls, article_url_map = self._extract_and_map_urls(articles)

        # 即使不上传图床，也将提取到的原始图片 URL 填充到 article.images 字段中
        for article in articles:
            if article.id in article_url_map:
                article.images = article_url_map[article.id]

        # 检查配置
        if not service_status.is_storage_enabled():
            logger.warning(f"跳过图片处理：{service_status.get_storage_summary()}")
            return articles

        start_time = time.time()
        logger.info("🚀 开始全局图片处理流程...")

        if not all_urls:
            logger.info("没有检测到图片，跳过处理")
            return articles

        logger.info(f"共检测到 {len(all_urls)} 个唯一图片链接")

        # 2. 过滤掉不需要上传的 (跳过域名，命中缓存)
        urls_to_upload, final_url_map = self._filter_urls_to_upload(all_urls)

        logger.info(f"需要上传的图片数量: {len(urls_to_upload)}")

        # 3. 并发上传
        upload_start = time.time()
        await self._upload_urls(urls_to_upload, final_url_map)
        upload_duration = time.time() - upload_start
        logger.info(f"图片上传完成，耗时: {upload_duration:.2f} 秒")

        # 4. 替换文章内容
        processed_count = self._update_articles(articles, article_url_map, final_url_map)

        total_duration = time.time() - start_time
        logger.info(f"✅ 全局图片处理完成，更新了 {processed_count} 篇文章，总耗时: {total_duration:.2f} 秒")
        return articles

    def _extract_and_map_urls(self, articles: list[Article]) -> tuple[set[str], dict[int, list[str]]]:
        """提取 URL 并建立映射"""
        all_urls: set[str] = set()
        article_url_map: dict[int, list[str]] = {}

        for article in articles:
            if not article.body:
                continue
            urls = markdown_utils.extract_image_urls(article.body)
            if urls:
                article_url_map[article.id] = urls
                for url in urls:
                    all_urls.add(url)
        return all_urls, article_url_map

    def _filter_urls_to_upload(self, all_urls: set[str]) -> tuple[list[str], dict[str, str]]:
        """过滤不需要上传的 URL"""
        urls_to_upload: list[str] = []
        final_url_map: dict[str, str] = {}

        for url in all_urls:
            # 检查跳过域名
            if storage_settings.DOGECLOUD_DOMAIN and storage_settings.DOGECLOUD_DOMAIN in url:
                final_url_map[url] = url
                continue

            # 检查缓存
            cached = image_cache.get_success(url)
            if cached:
                final_url_map[url] = cached
                continue

            # 检查失败次数
            if image_cache.get_failure_count(url) > 3:
                logger.warning(f"跳过失败过多的图片: {url}")
                final_url_map[url] = url
                continue

            urls_to_upload.append(url)
        return urls_to_upload, final_url_map

    async def _upload_urls(self, urls_to_upload: list[str], final_url_map: dict[str, str]) -> None:
        """并发上传 URL 并更新 map"""
        if not urls_to_upload:
            return

        tasks = [self._process_single_image(url) for url in urls_to_upload]
        results = await asyncio.gather(*tasks)

        for original, new_url in results:
            if new_url:
                final_url_map[original] = new_url
            else:
                final_url_map[original] = original

    def _update_articles(
        self,
        articles: list[Article],
        article_url_map: dict[int, list[str]],
        final_url_map: dict[str, str],
    ) -> int:
        """更新文章内容"""
        processed_count = 0
        for article in articles:
            if article.id not in article_url_map or not article.body:
                continue

            new_body = markdown_utils.replace_image_urls(article.body, final_url_map)

            if new_body != article.body:
                article.body = new_body
                current_urls = article_url_map[article.id]
                article.images = [final_url_map.get(u, u) for u in current_urls if final_url_map.get(u, u)]
                processed_count += 1
        return processed_count

    async def _process_single_image(self, url: str) -> tuple[str, str | None]:
        """
        下载并上传单个图片
        Returns: (original_url, new_url)
        """
        async with self.semaphore:
            logger.debug(f"正在处理图片: {url}")
            try:
                # 1. 下载
                parsed_url = urlparse(url)
                origin_referer = f"{parsed_url.scheme}://{parsed_url.netloc}/"
                headers = {
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                    "Referer": origin_referer,
                }

                async with httpx.AsyncClient(verify=False, timeout=30.0, follow_redirects=True) as client:
                    resp = await client.get(url, headers=headers)
                    resp.raise_for_status()
                    image_data = resp.content
                    content_type = resp.headers.get("content-type", "image/jpeg")

                # 2. 确定后缀
                filename = os.path.basename(parsed_url.path)
                name_part, ext_part = os.path.splitext(filename)

                # 策略：如果原后缀存在且看起来合法(<=5字符)，直接使用
                # 否则尝试检测内容
                if not ext_part or len(ext_part) > 5:
                    detected_ext = self._get_extension(image_data, content_type)
                    if detected_ext:
                        ext_part = detected_ext

                # 3. 确定文件名 (Original Name + Hash + Ext)
                # 使用 URL 哈希作为唯一标识，确保同一 URL 始终生成同一文件名
                # 格式: {原名}_{URL哈希}{后缀}
                url_hash = hashlib.md5(url.encode()).hexdigest()[:8]

                # 清理原名中的特殊字符，防止 S3 路径问题
                safe_name = "".join([c for c in name_part if c.isalnum() or c in "-_ "])[:50]
                if not safe_name:
                    safe_name = "image"

                filename = f"{safe_name}_{url_hash}{ext_part}"

                # 4. 上传
                new_url = await self.upload_image(image_data, filename, content_type)

                if new_url:
                    image_cache.mark_success(url, new_url)
                    return url, new_url
                else:
                    image_cache.mark_failure(url)
                    return url, None

            except Exception as e:
                logger.error(f"图片处理失败 [{url}]: {e}")
                image_cache.mark_failure(url)
                return url, None

    def _get_extension(self, data: bytes, content_type: str) -> str | None:
        """检测扩展名"""
        magic_map = [
            (b"\xff\xd8\xff", ".jpg"),
            (b"\x89PNG\r\n\x1a\n", ".png"),
            (b"GIF87a", ".gif"),
            (b"GIF89a", ".gif"),
            (b"BM", ".bmp"),
            (b"\x00\x00\x01\x00", ".ico"),
            (b"II*\x00", ".tiff"),
            (b"MM\x00*", ".tiff"),
        ]

        for magic, ext in magic_map:
            if data.startswith(magic):
                return ext

        if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
            return ".webp"
        if len(data) > 12 and data[4:12] == b"ftypavif":
            return ".avif"

        start_bytes = data[:512].strip()
        if start_bytes.startswith(b"<svg") or b"<svg" in start_bytes:
            return ".svg"

        if content_type == "application/octet-stream":
            return None

        ext = mimetypes.guess_extension(content_type)
        if ext:
            if ext == ".bin":
                return None
            if ext == ".jpeg":
                return ".jpg"
            return ext
        return None

    async def upload_image(self, image_data: bytes, filename: str, content_type: str) -> str:
        """上传到 DogeCloud"""
        try:
            # 使用公共工具获取 Token
            # 此时 settings.DOGECLOUD_BUCKET 已经过检查，不为 None
            bucket_name = str(storage_settings.DOGECLOUD_BUCKET)
            credentials = await asyncio.to_thread(get_doge_token, bucket_name, "OSS_UPLOAD")
            if not credentials or not credentials.get("credentials"):
                return ""

            creds = credentials["credentials"]
            s3_endpoint = credentials.get("s3Endpoint")
            s3_bucket = credentials.get("s3Bucket")

            if not s3_endpoint or not s3_bucket:
                logger.error("DogeCloud Token: Missing s3Endpoint or s3Bucket")
                return ""

            def _sync_upload():
                s3 = boto3.client(
                    "s3",
                    aws_access_key_id=creds["accessKeyId"],
                    aws_secret_access_key=creds["secretAccessKey"],
                    aws_session_token=creds["sessionToken"],
                    endpoint_url=s3_endpoint,
                    config=Config(s3={"addressing_style": "virtual"}, signature_version="s3v4"),
                )
                s3.put_object(
                    Bucket=s3_bucket,
                    Key=filename,
                    Body=image_data,
                    ContentType=content_type,
                )
                return filename

            await asyncio.to_thread(_sync_upload)

            if storage_settings.DOGECLOUD_DOMAIN:
                domain = storage_settings.DOGECLOUD_DOMAIN.rstrip("/")
                return f"{domain}/{filename}"
            return f"{s3_endpoint}/{filename}"

        except Exception as e:
            logger.error(f"上传失败: {e}")
            return ""


global_image_processor = GlobalImageProcessor()
