import asyncio
import hashlib
import logging
import os
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

import boto3
import httpx
from botocore.config import Config
from configs.storage import storage_settings
from schemas import Article
from services.cache import image_cache
from services.image_upload.image_type import get_image_extension
from services.service_status import service_status
from utils.dogecloud_storage import get_doge_token
from utils.markdown_utils import markdown_utils

logger = logging.getLogger(__name__)


@dataclass
class ImageUploadContext:
    http_client: httpx.AsyncClient
    s3_client: Any
    s3_bucket: str
    s3_endpoint: str


class GlobalImageProcessor:
    semaphore: asyncio.Semaphore

    def __init__(self) -> None:
        self.semaphore = asyncio.Semaphore(storage_settings.MAX_IMAGE_CONCURRENCY)

    @property
    def error_url(self) -> str:
        """获取错误图片占位符地址"""
        return "/error.svg"

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

    async def process_markdown_images(
        self,
        content: str,
        *,
        use_error_placeholder: bool = True,
    ) -> tuple[str, list[str]]:
        """
        处理一段独立 Markdown 中的图片链接。

        周刊等非 Issue 内容也需要复用图床上传能力，但不应该伪装成文章进入 AI 流程。
        """
        if not content:
            return content, []

        urls = markdown_utils.extract_image_urls(content)
        if not urls:
            return content, []

        if not service_status.is_storage_enabled():
            logger.warning(f"跳过 Markdown 图片处理：{service_status.get_storage_summary()}")
            return content, urls

        unique_urls = set(urls)
        urls_to_upload, final_url_map = self._filter_urls_to_upload(unique_urls)
        logger.info(f"独立 Markdown 检测到 {len(unique_urls)} 个唯一图片链接，需要上传 {len(urls_to_upload)} 个")

        await self._upload_urls(urls_to_upload, final_url_map)

        if not use_error_placeholder:
            for url in unique_urls:
                if final_url_map.get(url) == self.error_url:
                    final_url_map[url] = url

        processed_content = markdown_utils.replace_image_urls(content, final_url_map)
        processed_images = [final_url_map.get(url, url) for url in urls]
        return processed_content, processed_images

    async def process_image_urls(
        self,
        urls: list[str],
        *,
        use_error_placeholder: bool = True,
    ) -> dict[str, str]:
        """处理一组独立图片 URL，并返回原始 URL 到最终图床 URL 的映射。"""
        if not urls:
            return {}

        unique_urls = set(urls)
        if not service_status.is_storage_enabled():
            logger.warning(f"跳过图片 URL 处理：{service_status.get_storage_summary()}")
            return {url: url for url in unique_urls}

        urls_to_upload, final_url_map = self._filter_urls_to_upload(unique_urls)
        logger.info(f"独立图片 URL 检测到 {len(unique_urls)} 个唯一链接，需要上传 {len(urls_to_upload)} 个")

        await self._upload_urls(urls_to_upload, final_url_map)

        if not use_error_placeholder:
            for url in unique_urls:
                if final_url_map.get(url) == self.error_url:
                    final_url_map[url] = url

        return {url: final_url_map.get(url, url) for url in unique_urls}

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
                # 失败过多的图片，直接替换为 error.svg，避免混合内容警告
                final_url_map[url] = self.error_url
                continue

            urls_to_upload.append(url)
        return urls_to_upload, final_url_map

    async def _upload_urls(self, urls_to_upload: list[str], final_url_map: dict[str, str]) -> None:
        """并发上传 URL 并更新 map"""
        if not urls_to_upload:
            return

        context = await self._create_upload_context()
        if not context:
            logger.error("无法初始化图片上传上下文，所有待上传图片将使用占位图")
            for url in urls_to_upload:
                image_cache.mark_failure(url)
                final_url_map[url] = self.error_url
            return

        async with context.http_client:
            tasks = [self._process_single_image(url, context) for url in urls_to_upload]
            results = await asyncio.gather(*tasks)

        for original, new_url in results:
            if new_url:
                final_url_map[original] = new_url
            else:
                # 理论上 _process_single_image 现在不会返回 None
                # 但为了类型安全兜底
                final_url_map[original] = self.error_url

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

    async def _create_upload_context(self) -> ImageUploadContext | None:
        """初始化本轮图片处理复用的 HTTP/S3 客户端和临时凭证。"""
        bucket_name = str(storage_settings.DOGECLOUD_BUCKET)
        token_info = await asyncio.to_thread(get_doge_token, bucket_name, "OSS_UPLOAD")
        if not token_info or not token_info.get("credentials"):
            logger.error("DogeCloud Token: Missing credentials")
            return None

        creds = token_info["credentials"]
        s3_endpoint = token_info.get("s3Endpoint")
        s3_bucket = token_info.get("s3Bucket")
        if not s3_endpoint or not s3_bucket:
            logger.error("DogeCloud Token: Missing s3Endpoint or s3Bucket")
            return None

        max_connections = max(10, storage_settings.MAX_IMAGE_CONCURRENCY)
        s3 = boto3.client(
            "s3",
            aws_access_key_id=creds["accessKeyId"],
            aws_secret_access_key=creds["secretAccessKey"],
            aws_session_token=creds["sessionToken"],
            endpoint_url=s3_endpoint,
            config=Config(
                s3={"addressing_style": "virtual"},
                signature_version="s3v4",
                max_pool_connections=max_connections,
            ),
        )
        http_client = httpx.AsyncClient(
            verify=False,
            timeout=30.0,
            follow_redirects=True,
            limits=httpx.Limits(max_connections=max_connections, max_keepalive_connections=max_connections),
        )

        return ImageUploadContext(
            http_client=http_client,
            s3_client=s3,
            s3_bucket=s3_bucket,
            s3_endpoint=s3_endpoint,
        )

    async def _process_single_image(self, url: str, context: ImageUploadContext) -> tuple[str, str | None]:
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

                resp = await context.http_client.get(url, headers=headers)
                resp.raise_for_status()
                image_data = resp.content
                content_type = resp.headers.get("content-type", "image/jpeg")

                # 2. 确定后缀
                filename = os.path.basename(parsed_url.path)
                name_part, ext_part = os.path.splitext(filename)

                # 策略：如果原后缀存在且看起来合法(<=5字符)，直接使用
                # 否则尝试检测内容
                if not ext_part or len(ext_part) > 5:
                    detected_ext = get_image_extension(image_data, content_type)
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
                new_url = await self.upload_image(context, image_data, filename, content_type)

                if new_url:
                    image_cache.mark_success(url, new_url)
                    return url, new_url
                else:
                    image_cache.mark_failure(url)
                    # 失败时返回 error_url
                    return url, self.error_url

            except Exception as e:
                logger.error(f"图片处理失败 [{url}]: {e}")
                image_cache.mark_failure(url)
                # 异常时也返回 error_url
                return url, self.error_url

    async def upload_image(
        self,
        context: ImageUploadContext,
        image_data: bytes,
        filename: str,
        content_type: str,
    ) -> str:
        """上传到 DogeCloud"""
        try:

            def _sync_upload():
                context.s3_client.put_object(
                    Bucket=context.s3_bucket,
                    Key=filename,
                    Body=image_data,
                    ContentType=content_type,
                )
                return filename

            await asyncio.to_thread(_sync_upload)

            if storage_settings.DOGECLOUD_DOMAIN:
                domain = storage_settings.DOGECLOUD_DOMAIN.rstrip("/")
                return f"{domain}/{filename}"
            return f"{context.s3_endpoint}/{filename}"

        except Exception as e:
            logger.error(f"上传失败: {e}")
            return ""


global_image_processor = GlobalImageProcessor()
