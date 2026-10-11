import asyncio
import hashlib
import logging
from tempfile import SpooledTemporaryFile
from typing import TYPE_CHECKING
from urllib.parse import urlparse

from configs.storage import storage_settings
from services.cache import image_cache
from services.service_status import service_status
from utils.media_utils import MEDIA_TYPES, extract_media_urls, is_github_asset, is_media_url

if TYPE_CHECKING:
    from services.image_upload.doge_image_uploader import DogeImageUploader, ImageUploadContext

logger = logging.getLogger(__name__)


def _media_type(url: str, header: str) -> tuple[str, str]:
    content_type = header.split(";", 1)[0].strip().lower()
    content_type = {"audio/x-wav": "audio/wav", "audio/x-flac": "audio/flac", "audio/x-m4a": "audio/mp4"}.get(
        content_type, content_type
    )
    if content_type == "application/octet-stream":
        path = urlparse(url).path.lower()
        content_type = next((mime for extension, mime in MEDIA_TYPES.items() if path.endswith(extension)), "")
    extension = next((extension for extension, mime in MEDIA_TYPES.items() if mime == content_type), "")
    if not extension:
        raise ValueError(f"不支持的音视频类型: {content_type}")
    return content_type, extension


async def upload_media(
    url: str, context: "ImageUploadContext", semaphore: asyncio.Semaphore, media_urls: set[str]
) -> tuple[str, str]:
    """流式下载到临时文件，超过体积上限立即终止；失败时保留原链接。"""
    async with semaphore:
        try:
            with SpooledTemporaryFile(max_size=1024 * 1024) as media_file:
                async with context.http_client.stream("GET", url) as response:
                    response.raise_for_status()
                    # GitHub 图片与视频共用附件路径，图片交回原有图片流程处理。
                    if response.headers.get("content-type", "").lower().startswith("image/"):
                        media_urls.discard(url)
                        return url, url
                    content_type, extension = _media_type(url, response.headers.get("content-type", ""))
                    media_urls.add(url)
                    limit = storage_settings.MEDIA_MAX_UPLOAD_BYTES
                    if int(response.headers.get("content-length", "0")) > limit:
                        raise ValueError(f"音视频超过 {limit} 字节，跳过转存")
                    size = 0
                    async for chunk in response.aiter_bytes(chunk_size=64 * 1024):
                        size += len(chunk)
                        if size > limit:
                            raise ValueError(f"音视频超过 {limit} 字节，停止下载")
                        media_file.write(chunk)
                if not size:
                    raise ValueError("音视频文件为空")
                media_file.seek(0)
                filename = f"media/{hashlib.sha256(url.encode()).hexdigest()}{extension}"
                await asyncio.to_thread(
                    context.s3_client.upload_fileobj,
                    media_file,
                    context.s3_bucket,
                    filename,
                    ExtraArgs={"ContentType": content_type, "CacheControl": "max-age=31536000"},
                )
            domain = (storage_settings.DOGECLOUD_IMAGE_DOMAIN or context.s3_endpoint).rstrip("/")
            logger.info("音视频转存成功 (%s 字节): %s", size, url)
            return url, f"{domain}/{filename}"
        except Exception as error:
            logger.warning("音视频转存跳过，保留原链接 [%s]: %s", url, error)
            return url, url


async def process_media(contents: list[str], uploader: "DogeImageUploader") -> dict[str, str]:
    """复用图床缓存，统一去重处理文章或独立 Markdown 中的音视频。"""
    if not service_status.is_storage_enabled():
        return {}
    urls = {url for content in contents for url in extract_media_urls(content)}
    own_host = urlparse(storage_settings.DOGECLOUD_IMAGE_DOMAIN or "").hostname
    final_urls: dict[str, str] = {}
    pending: list[str] = []
    for url in sorted(urls):
        if urlparse(url).hostname == own_host:
            continue
        cached = image_cache.get_success(url)
        if cached and cached != uploader.error_url:
            final_urls[url] = cached
            if is_media_url(cached):
                uploader.media_urls.add(url)
            else:
                uploader.media_urls.discard(url)
        else:
            pending.append(url)
    uploaded = await uploader.upload_media_urls(pending)
    for original, uploaded_url in uploaded.items():
        if uploaded_url != original:
            image_cache.mark_success(original, uploaded_url)
        elif original in uploader.media_urls or not is_github_asset(original):
            image_cache.mark_failure(original)
        final_urls[original] = uploaded_url
    return final_urls
