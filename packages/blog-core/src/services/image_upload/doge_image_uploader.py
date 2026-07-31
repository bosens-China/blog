import asyncio
import hashlib
import logging
import os
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

import boto3
import httpx
from botocore.config import Config
from configs.storage import storage_settings
from services.image_upload.image_compressor import compress_static_image, should_keep_animated_source_url
from services.image_upload.image_type import get_image_extension
from utils.dogecloud_storage import get_doge_token

logger = logging.getLogger(__name__)


@dataclass
class ImageUploadContext:
    http_client: httpx.AsyncClient
    s3_client: Any
    s3_bucket: str
    s3_endpoint: str


class DogeImageUploader:
    """负责下载、压缩并上传单个图片，不处理内容替换或图片缓存。"""

    def __init__(self, error_url: str) -> None:
        self.error_url = error_url
        self.semaphore = asyncio.Semaphore(storage_settings.MAX_IMAGE_CONCURRENCY)

    async def upload_urls(self, urls: list[str]) -> dict[str, str]:
        """并发上传图片，并返回原始 URL 到最终 URL 的映射。"""
        if not urls:
            return {}

        context = await self._create_upload_context()
        if not context:
            logger.error("无法初始化图片上传上下文，所有待上传图片将使用占位图")
            return {url: self.error_url for url in urls}

        async with context.http_client:
            results = await asyncio.gather(*(self._upload_single_image(url, context) for url in urls))

        return dict(results)

    async def _create_upload_context(self) -> ImageUploadContext | None:
        """初始化本轮上传复用的 HTTP/S3 客户端和临时凭证。"""
        bucket_name = str(storage_settings.DOGECLOUD_IMAGE_BUCKET)
        token_info = await asyncio.to_thread(get_doge_token, bucket_name, "OSS_UPLOAD")
        if not token_info or not token_info.get("credentials"):
            logger.error("DogeCloud Token: Missing credentials")
            return None

        credentials = token_info["credentials"]
        s3_endpoint = token_info.get("s3Endpoint")
        s3_bucket = token_info.get("s3Bucket")
        if not s3_endpoint or not s3_bucket:
            logger.error("DogeCloud Token: Missing s3Endpoint or s3Bucket")
            return None

        max_connections = max(10, storage_settings.MAX_IMAGE_CONCURRENCY)
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=credentials["accessKeyId"],
            aws_secret_access_key=credentials["secretAccessKey"],
            aws_session_token=credentials["sessionToken"],
            endpoint_url=s3_endpoint,
            config=Config(
                s3={"addressing_style": "virtual"},
                signature_version="s3v4",
                connect_timeout=storage_settings.IMAGE_UPLOAD_CONNECT_TIMEOUT_SECONDS,
                read_timeout=storage_settings.IMAGE_UPLOAD_READ_TIMEOUT_SECONDS,
                max_pool_connections=max_connections,
                retries={"mode": "standard", "total_max_attempts": storage_settings.IMAGE_UPLOAD_MAX_ATTEMPTS},
                tcp_keepalive=True,
                request_checksum_calculation="when_required",
                response_checksum_validation="when_required",
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
            s3_client=s3_client,
            s3_bucket=s3_bucket,
            s3_endpoint=s3_endpoint,
        )

    async def _upload_single_image(self, url: str, context: ImageUploadContext) -> tuple[str, str]:
        """下载、压缩并上传单张图片。"""
        async with self.semaphore:
            logger.debug("正在处理图片: %s", url)
            try:
                image_data, content_type = await self._download_image(url, context.http_client)
                if should_keep_animated_source_url(
                    image_data,
                    max_upload_bytes=storage_settings.IMAGE_MAX_ANIMATED_UPLOAD_BYTES,
                ):
                    logger.warning("大动图跳过转存，保留原始地址: %s", url)
                    return url, url

                image_data, content_type, extension = await self._compress_image(image_data, content_type)
                filename = self._build_filename(url, image_data, content_type, extension)
                uploaded_url = await self._upload_image(context, image_data, filename, content_type)
                return url, uploaded_url or self.error_url
            except Exception as error:
                logger.error("图片处理失败 [%s]: %s", url, error)
                return url, self.error_url

    async def _download_image(self, url: str, client: httpx.AsyncClient) -> tuple[bytes, str]:
        parsed_url = urlparse(url)
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            "Referer": f"{parsed_url.scheme}://{parsed_url.netloc}/",
        }
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.content, response.headers.get("content-type", "image/jpeg")

    async def _compress_image(self, image_data: bytes, content_type: str) -> tuple[bytes, str, str | None]:
        compressed_image = await asyncio.to_thread(
            compress_static_image,
            image_data,
            minimum_bytes=storage_settings.IMAGE_COMPRESSION_MIN_BYTES,
            max_dimension=storage_settings.IMAGE_COMPRESSION_MAX_DIMENSION,
            quality=storage_settings.IMAGE_COMPRESSION_WEBP_QUALITY,
            minimum_savings_ratio=storage_settings.IMAGE_COMPRESSION_MIN_SAVINGS_RATIO,
        )
        if not compressed_image:
            return image_data, content_type, None

        logger.info("图片压缩完成: %s -> %s 字节", len(image_data), len(compressed_image.data))
        return compressed_image.data, compressed_image.content_type, compressed_image.extension

    def _build_filename(
        self,
        url: str,
        image_data: bytes,
        content_type: str,
        compressed_extension: str | None,
    ) -> str:
        parsed_url = urlparse(url)
        name_part, extension = os.path.splitext(os.path.basename(parsed_url.path))
        if not extension or len(extension) > 5:
            extension = get_image_extension(image_data, content_type) or ""
        if compressed_extension:
            extension = compressed_extension

        safe_name = "".join(character for character in name_part if character.isalnum() or character in "-_ ")[:50]
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        return f"{safe_name or 'image'}_{url_hash}{extension}"

    async def _upload_image(
        self,
        context: ImageUploadContext,
        image_data: bytes,
        filename: str,
        content_type: str,
    ) -> str:
        """通过 S3 兼容接口上传图片。"""
        try:
            await asyncio.to_thread(
                context.s3_client.put_object,
                Bucket=context.s3_bucket,
                Key=filename,
                Body=image_data,
                ContentType=content_type,
            )
        except Exception as error:
            logger.error("上传失败: %s", error)
            return ""

        if storage_settings.DOGECLOUD_IMAGE_DOMAIN:
            domain = storage_settings.DOGECLOUD_IMAGE_DOMAIN.rstrip("/")
            return f"{domain}/{filename}"
        return f"{context.s3_endpoint}/{filename}"
