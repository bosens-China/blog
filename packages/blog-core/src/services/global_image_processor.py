import logging
import time

from configs.storage import storage_settings
from schemas import Article
from services.cache import image_cache
from services.image_upload.doge_image_uploader import DogeImageUploader
from services.service_status import service_status
from utils.markdown_utils import markdown_utils

logger = logging.getLogger(__name__)


class GlobalImageProcessor:
    def __init__(self) -> None:
        self.uploader = DogeImageUploader(self.error_url)

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
        retry_failed_images: bool = True,
    ) -> dict[str, str]:
        """处理一组独立图片 URL，并返回原始 URL 到最终图床 URL 的映射。"""
        if not urls:
            return {}

        unique_urls = set(urls)
        if not service_status.is_storage_enabled():
            logger.warning(f"跳过图片 URL 处理：{service_status.get_storage_summary()}")
            return {url: url for url in unique_urls}

        urls_to_upload, final_url_map = self._filter_urls_to_upload(
            unique_urls,
            retry_failed_images=retry_failed_images,
        )
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

    def _filter_urls_to_upload(
        self,
        all_urls: set[str],
        *,
        retry_failed_images: bool = True,
    ) -> tuple[list[str], dict[str, str]]:
        """过滤不需要上传的 URL"""
        urls_to_upload: list[str] = []
        final_url_map: dict[str, str] = {}

        for url in all_urls:
            # 检查跳过域名
            if storage_settings.DOGECLOUD_IMAGE_DOMAIN and storage_settings.DOGECLOUD_IMAGE_DOMAIN in url:
                final_url_map[url] = url
                continue

            # 检查缓存
            cached = image_cache.get_success(url)
            if cached:
                final_url_map[url] = cached
                continue

            # 检查失败次数
            if not retry_failed_images and image_cache.get_failure_count(url) > 0:
                logger.warning(f"跳过已失败的图片，保留原始地址: {url}")
                # 周刊内容保留原始图片地址，避免失败重试阻塞后续构建。
                final_url_map[url] = self.error_url
                continue

            urls_to_upload.append(url)
        return urls_to_upload, final_url_map

    async def _upload_urls(self, urls_to_upload: list[str], final_url_map: dict[str, str]) -> None:
        """并发上传 URL 并更新 map"""
        if not urls_to_upload:
            return

        uploaded_urls = await self.uploader.upload_urls(urls_to_upload)
        for original_url, final_url in uploaded_urls.items():
            final_url_map[original_url] = final_url
            if final_url == self.error_url:
                image_cache.mark_failure(original_url)
            elif final_url != original_url:
                image_cache.mark_success(original_url, final_url)

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


global_image_processor = GlobalImageProcessor()
