from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree


def text(parent: ElementTree.Element, tag: str) -> str:
    node = parent.find(tag)
    if node is None or node.text is None:
        return ""
    return node.text.strip()


def parse_rss_datetime(value: str) -> datetime | None:
    if not value:
        return None

    try:
        dt = parsedate_to_datetime(value)
    except (TypeError, ValueError):
        return None

    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


def format_iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.isoformat()
