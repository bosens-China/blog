import re
from typing import Any

from services.weekly.markdown_assets import resolve_asset_url


def normalize_report_date(value: Any) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None

    normalized = value.strip().replace("_", "-")
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", normalized):
        return normalized
    return None


def extract_issue_number(title: str) -> int | None:
    match = re.search(r"第\s*(\d+)\s*期", title)
    if not match:
        return None
    return int(match.group(1))


def normalize_categories(raw_categories: Any, report_url: str) -> list[dict[str, Any]]:
    if not isinstance(raw_categories, list):
        return []

    categories: list[dict[str, Any]] = []

    for raw_category in raw_categories:
        if not isinstance(raw_category, dict):
            continue

        raw_items = raw_category.get("items")
        if not isinstance(raw_items, list):
            raw_items = []

        items: list[dict[str, Any]] = []
        for raw_item in raw_items:
            if not isinstance(raw_item, dict):
                continue

            image = raw_item.get("image")
            source_image = ""
            resolved_image = ""
            if isinstance(image, str) and image.strip():
                source_image = image.strip()
                resolved_image = resolve_asset_url(source_image, report_url)

            item = {
                "repo": raw_item.get("repo") if isinstance(raw_item.get("repo"), str) else "",
                "url": raw_item.get("url") if isinstance(raw_item.get("url"), str) else "",
                "description": raw_item.get("description") if isinstance(raw_item.get("description"), str) else "",
                "language": raw_item.get("language") if isinstance(raw_item.get("language"), str) else "",
                "total_stars": raw_item.get("total_stars") if isinstance(raw_item.get("total_stars"), str) else "",
                "period_stars": raw_item.get("period_stars") if isinstance(raw_item.get("period_stars"), str) else "",
                "homepage": raw_item.get("homepage") if isinstance(raw_item.get("homepage"), str) else "",
                "topics": raw_item.get("topics") if isinstance(raw_item.get("topics"), list) else [],
                "image": resolved_image,
                "source_image": source_image,
                "summary": raw_item.get("summary") if isinstance(raw_item.get("summary"), str) else "",
                "tags": raw_item.get("tags") if isinstance(raw_item.get("tags"), list) else [],
            }
            items.append(item)

        categories.append(
            {
                "name": raw_category.get("name") if isinstance(raw_category.get("name"), str) else "未分类",
                "items": items,
            }
        )

    return categories
