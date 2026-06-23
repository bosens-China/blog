import asyncio
import json
import logging
import os
import sys
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse
from xml.etree import ElementTree

import httpx

# 将 src 目录添加到 sys.path，以便脚本可通过 uv 直接运行。
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from logging_config import setup_logging
from services.cache import image_cache
from services.global_image_processor import global_image_processor
from services.service_status import service_status
from utils.markdown_utils import markdown_utils

setup_logging(module_name="weekly_sync")
logger = logging.getLogger("weekly_sync")

DEFAULT_FEED_URL = "https://raw.githubusercontent.com/bosens-China/Weekly-trend/master/feed.xml"


def _text(parent: ElementTree.Element, tag: str) -> str:
    node = parent.find(tag)
    if node is None or node.text is None:
        return ""
    return node.text.strip()


def _parse_rss_datetime(value: str) -> datetime | None:
    if not value:
        return None

    try:
        dt = parsedate_to_datetime(value)
    except (TypeError, ValueError):
        return None

    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


def _format_iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.isoformat()


def _github_blob_to_raw(url: str) -> str:
    parsed = urlparse(url)
    if parsed.netloc != "github.com":
        return url

    parts = parsed.path.strip("/").split("/")
    if len(parts) < 5 or parts[2] != "blob":
        return url

    owner, repo, _, branch = parts[:4]
    file_path = "/".join(parts[4:])
    return f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{file_path}"


def _is_relative_url(url: str) -> bool:
    parsed = urlparse(url)
    return not parsed.scheme and not parsed.netloc and not url.startswith(("/", "#", "data:"))


def _rewrite_relative_images(content: str, markdown_url: str) -> str:
    image_urls = markdown_utils.extract_image_urls(content)
    if not image_urls:
        return content

    url_map = {url: urljoin(markdown_url, url) for url in image_urls if _is_relative_url(url)}
    return markdown_utils.replace_image_urls(content, url_map)


def _extract_markdown_title(content: str, fallback: str) -> str:
    """从 Markdown 一级标题提取周刊标题。"""
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith("# ") and len(stripped) > 2:
            return stripped[2:].strip()
    return fallback


class WeeklySyncer:
    def __init__(self, feed_url: str) -> None:
        self.feed_url = feed_url
        self.output_file = Path(settings.OUTPUT_DIR) / "weekly.json"

    async def sync(self) -> None:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            feed_xml = await self._fetch_text(client, self.feed_url)
            channel = ElementTree.fromstring(feed_xml).find("channel")
            if channel is None:
                raise ValueError("RSS 缺少 channel 节点")

            last_build_date = _parse_rss_datetime(_text(channel, "lastBuildDate"))
            items = await self._build_items(client, channel.findall("item"))

        payload: dict[str, Any] = {
            "generated_at": datetime.now(tz=UTC).isoformat(),
            "feed_url": self.feed_url,
            "last_build_date": _format_iso(last_build_date),
            "items": items,
        }

        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.output_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

        if service_status.is_storage_enabled():
            image_cache.save()

        logger.info(f"周刊数据已写入 {self.output_file}，共 {len(items)} 期")

    async def _fetch_text(self, client: httpx.AsyncClient, url: str) -> str:
        logger.info(f"正在读取: {url}")
        resp = await client.get(
            url,
            headers={"User-Agent": "bosens-blog-weekly-sync/1.0"},
        )
        resp.raise_for_status()
        return resp.text

    async def _build_items(
        self,
        client: httpx.AsyncClient,
        rss_items: list[ElementTree.Element],
    ) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        for item in rss_items:
            built = await self._build_item(client, item)
            if built:
                items.append(built)

        return sorted(items, key=lambda item: item["pub_date"] or "", reverse=True)

    async def _build_item(self, client: httpx.AsyncClient, item: ElementTree.Element) -> dict[str, Any] | None:
        source_title = _text(item, "title")
        source_url = _text(item, "link")
        description = _text(item, "description")
        pub_date = _parse_rss_datetime(_text(item, "pubDate"))
        raw_url = _github_blob_to_raw(source_url)

        if not raw_url:
            logger.warning(f"跳过缺少链接的周刊: {source_title}")
            return None

        markdown = await self._fetch_text(client, raw_url)
        markdown = _rewrite_relative_images(markdown, raw_url)
        markdown, images = await global_image_processor.process_markdown_images(markdown, use_error_placeholder=False)
        word_count, reading_time = markdown_utils.get_stats(markdown)

        date_slug = self._get_date_slug(pub_date, raw_url)
        title = _extract_markdown_title(markdown, source_title or f"{date_slug} 一周")
        return {
            "id": date_slug,
            "slug": date_slug,
            "title": title,
            "source_title": source_title,
            "description": description,
            "pub_date": _format_iso(pub_date),
            "source_url": source_url,
            "raw_url": raw_url,
            "body": markdown,
            "images": images,
            "word_count": word_count,
            "reading_time": reading_time,
        }

    def _get_date_slug(self, pub_date: datetime | None, raw_url: str) -> str:
        if pub_date is not None:
            return pub_date.strftime("%Y-%m-%d")

        parts = raw_url.split("/")
        for part in parts:
            if len(part) == 10 and part.count("_") == 2:
                return part.replace("_", "-")

        raise ValueError(f"无法从周刊条目解析日期: {raw_url}")


async def main() -> None:
    service_status.print_summary()
    feed_url = os.getenv("WEEKLY_TREND_FEED_URL", DEFAULT_FEED_URL)
    await WeeklySyncer(feed_url).sync()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        logger.error(f"周刊同步失败: {e}", exc_info=True)
        sys.exit(1)
