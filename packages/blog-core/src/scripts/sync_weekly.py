import asyncio
import json
import logging
import os
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from xml.etree import ElementTree

import httpx

# 将 src 目录添加到 sys.path，以便脚本可通过 uv 直接运行。
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from logging_config import setup_logging
from services.cache import image_cache
from services.global_image_processor import global_image_processor
from services.service_status import service_status
from services.weekly.github_urls import github_blob_to_raw, github_readme_raw_to_report
from services.weekly.markdown_assets import rewrite_relative_images
from services.weekly.report_markdown_renderer import render_report_markdown
from services.weekly.report_normalizer import extract_issue_number, normalize_categories, normalize_report_date
from services.weekly.rss import format_iso, parse_rss_datetime, text
from utils.markdown_utils import markdown_utils

setup_logging(module_name="weekly_sync")
logger = logging.getLogger("weekly_sync")

DEFAULT_FEED_URL = "https://raw.githubusercontent.com/bosens-China/Weekly-trend/master/feed.xml"
DEFAULT_REPORT_FETCH_TIMEOUT_SECONDS = 6.0


def _get_report_fetch_timeout() -> float:
    value = os.getenv("WEEKLY_REPORT_TIMEOUT_SECONDS")
    if not value:
        return DEFAULT_REPORT_FETCH_TIMEOUT_SECONDS

    try:
        timeout = float(value)
    except ValueError:
        logger.warning(f"WEEKLY_REPORT_TIMEOUT_SECONDS 非法，将使用默认值: {value}")
        return DEFAULT_REPORT_FETCH_TIMEOUT_SECONDS

    return max(1.0, timeout)


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
        self.report_fetch_timeout = _get_report_fetch_timeout()

    async def sync(self) -> None:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            feed_xml = await self._fetch_text(client, self.feed_url)
            channel = ElementTree.fromstring(feed_xml).find("channel")
            if channel is None:
                raise ValueError("RSS 缺少 channel 节点")

            last_build_date = parse_rss_datetime(text(channel, "lastBuildDate"))
            items = await self._build_items(client, channel.findall("item"))

        content: dict[str, Any] = {
            "feed_url": self.feed_url,
            "last_build_date": format_iso(last_build_date),
            "items": items,
        }
        content_changed = self._write_payload_if_changed(content)

        if service_status.is_storage_enabled():
            image_cache.save()

        if content_changed:
            logger.info(f"周刊数据已写入 {self.output_file}，共 {len(items)} 期")
        else:
            logger.info(f"周刊内容无变化，保留原同步时间，共 {len(items)} 期")

    def _write_payload_if_changed(self, content: dict[str, Any]) -> bool:
        existing_payload = self._load_existing_payload()
        if existing_payload is not None and isinstance(existing_payload.get("generated_at"), str):
            content_unchanged = all(existing_payload.get(key) == value for key, value in content.items())
            if content_unchanged:
                return False

        payload = {
            "generated_at": datetime.now(tz=UTC).isoformat(),
            **content,
        }
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.output_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        return True

    def _load_existing_payload(self) -> dict[str, Any] | None:
        if not self.output_file.exists():
            return None

        try:
            with open(self.output_file, encoding="utf-8") as f:
                payload = json.load(f)
        except (OSError, json.JSONDecodeError) as error:
            logger.warning(f"读取现有周刊数据失败，将重新写入: {error}")
            return None

        return payload if isinstance(payload, dict) else None

    async def _fetch_text(self, client: httpx.AsyncClient, url: str) -> str:
        logger.info(f"正在读取: {url}")
        resp = await client.get(
            url,
            headers={"User-Agent": "bosens-blog-weekly-sync/1.0"},
        )
        resp.raise_for_status()
        return resp.text

    async def _fetch_json(self, client: httpx.AsyncClient, url: str) -> dict[str, Any]:
        text = await self._fetch_text(client, url)
        data = json.loads(text)
        if not isinstance(data, dict):
            raise ValueError("report.json 根节点必须是对象")
        return data

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
        source_title = text(item, "title")
        source_url = text(item, "link")
        description = text(item, "description")
        pub_date = parse_rss_datetime(text(item, "pubDate"))
        raw_url = github_blob_to_raw(source_url)
        report_url = github_readme_raw_to_report(raw_url)

        if not raw_url:
            logger.warning(f"跳过缺少链接的周刊: {source_title}")
            return None

        try:
            report = await asyncio.wait_for(
                self._fetch_json(client, report_url),
                timeout=self.report_fetch_timeout,
            )
            return await self._build_report_item(
                report=report,
                source_title=source_title,
                source_url=source_url,
                raw_url=raw_url,
                report_url=report_url,
                description=description,
                pub_date=pub_date,
            )
        except Exception as e:
            logger.warning(f"读取 report.json 失败，将降级使用 README: {report_url}, error={e}")

        return await self._build_markdown_item(
            client=client,
            source_title=source_title,
            source_url=source_url,
            raw_url=raw_url,
            description=description,
            pub_date=pub_date,
        )

    async def _build_report_item(
        self,
        *,
        report: dict[str, Any],
        source_title: str,
        source_url: str,
        raw_url: str,
        report_url: str,
        description: str,
        pub_date: datetime | None,
    ) -> dict[str, Any]:
        categories = normalize_categories(report.get("categories"), report_url)
        await self._upload_report_images(categories)
        project_count = sum(len(category["items"]) for category in categories)
        category_count = len(categories)
        date_slug = normalize_report_date(report.get("date")) or self._get_date_slug(pub_date, raw_url)

        issue_number = report.get("issue")
        if not isinstance(issue_number, int):
            issue_number = extract_issue_number(source_title)

        title = (
            f"GitHub 一周热点 · 第 {issue_number} 期"
            if issue_number
            else f"GitHub 一周热点 · {source_title or date_slug}"
        )
        markdown = render_report_markdown(report, categories, title, date_slug)
        word_count, reading_time = markdown_utils.get_stats(markdown)
        images = [
            item["image"]
            for category in categories
            for item in category["items"]
            if isinstance(item.get("image"), str) and item["image"]
        ]

        return {
            "id": date_slug,
            "slug": date_slug,
            "title": title,
            "source_title": source_title,
            "description": description
            or report.get("overview")
            or report.get("description")
            or report.get("summary")
            or f"本期收录 {project_count} 个项目",
            "pub_date": date_slug,
            "rss_pub_date": format_iso(pub_date),
            "source_url": source_url,
            "raw_url": raw_url,
            "report_url": report_url,
            "source": report.get("source") if isinstance(report.get("source"), str) else "",
            "issue": issue_number,
            "date": date_slug,
            "report_generated_at": report.get("generated_at") if isinstance(report.get("generated_at"), str) else None,
            "project_count": project_count,
            "category_count": category_count,
            "categories": categories,
            "images": images,
            "body": markdown,
            "word_count": word_count,
            "reading_time": reading_time,
        }

    async def _upload_report_images(self, categories: list[dict[str, Any]]) -> None:
        image_sources: list[str] = []
        image_pairs: list[tuple[dict[str, Any], str]] = []

        for category in categories:
            items = category.get("items")
            if not isinstance(items, list):
                continue

            for item in items:
                if not isinstance(item, dict):
                    continue

                image = item.get("image")
                if isinstance(image, str) and image:
                    image_sources.append(image)
                    image_pairs.append((item, image))

        if not image_sources:
            return

        url_map = await global_image_processor.process_image_urls(
            image_sources,
            use_error_placeholder=False,
            retry_failed_images=False,
        )
        for item, original_url in image_pairs:
            item["image"] = url_map.get(original_url, original_url)

    async def _build_markdown_item(
        self,
        *,
        client: httpx.AsyncClient,
        source_title: str,
        source_url: str,
        raw_url: str,
        description: str,
        pub_date: datetime | None,
    ) -> dict[str, Any]:
        markdown = await self._fetch_text(client, raw_url)
        markdown = rewrite_relative_images(markdown, raw_url)
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
            "pub_date": format_iso(pub_date),
            "source_url": source_url,
            "raw_url": raw_url,
            "body": markdown,
            "images": images,
            "word_count": word_count,
            "reading_time": reading_time,
        }

    def _get_date_slug(self, pub_date: datetime | None, raw_url: str) -> str:
        parts = raw_url.split("/")
        for part in parts:
            if len(part) == 10 and part.count("_") == 2:
                return part.replace("_", "-")

        if pub_date is not None:
            return pub_date.strftime("%Y-%m-%d")

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
