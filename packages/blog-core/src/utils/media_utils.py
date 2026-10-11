import re
from collections.abc import Iterator
from html import unescape
from urllib.parse import urlparse

import marko
from marko.block import CodeBlock, FencedCode
from marko.element import Element
from marko.inline import CodeSpan

MEDIA_TYPES = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".m4v": "video/x-m4v",
    ".ogv": "video/ogg",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".ogg": "audio/ogg",
    ".oga": "audio/ogg",
    ".opus": "audio/opus",
}
PLATFORM_DOMAINS = ("bilibili.com", "bilibili.tv", "b23.tv", "bilivideo.com", "youtube.com", "youtu.be")
URL_PATTERN = re.compile(r"https?://[^\s<>\"'`\[\]]+", re.IGNORECASE)
MEDIA_SRC_PATTERN = re.compile(r"<(?:audio|video|source)\b[^>]*?\ssrc\s*=\s*[\"']([^\"']+)[\"']", re.IGNORECASE)
PROTECTED_HTML_PATTERN = re.compile(
    r"<!--.*?-->|<(iframe|pre|code|script)\b[^>]*>.*?</\1\s*>|<(?:iframe|pre|code|script)\b[^>]*>",
    re.IGNORECASE | re.DOTALL,
)


def is_media_source_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        host = parsed.hostname
        return bool(
            parsed.scheme in {"http", "https"}
            and host
            and not parsed.username
            and not any(host == domain or host.endswith(f".{domain}") for domain in PLATFORM_DOMAINS)
        )
    except ValueError:
        return False


def is_media_url(url: str) -> bool:
    try:
        path = urlparse(url).path.lower()
    except ValueError:
        return False
    return any(path.endswith(extension) for extension in MEDIA_TYPES)


def is_github_asset(url: str) -> bool:
    if not is_media_source_url(url):
        return False
    parsed = urlparse(url)
    return parsed.hostname == "github.com" and re.fullmatch(r"/user-attachments/assets/[\w-]+", parsed.path) is not None


def _code_spans(element: Element) -> Iterator[tuple[int, int]]:
    if isinstance(element, CodeBlock | FencedCode | CodeSpan):
        if element.source_span:
            yield element.source_span
        return
    children = getattr(element, "children", None)
    if isinstance(children, list):
        for child in children:
            if isinstance(child, Element):
                yield from _code_spans(child)


def _media_references(content: str) -> Iterator[tuple[int, int, str]]:
    # Marko 的位置基于规范化换行；映射回原文以保留 CRLF 和正文格式。
    offsets = [i for i in range(len(content)) if not (content[i] == "\n" and i > 0 and content[i - 1] == "\r")]
    offsets.append(len(content))
    masked = list(content)
    for start, end in _code_spans(marko.parse(content)):
        masked[offsets[start] : offsets[end]] = " " * (offsets[end] - offsets[start])
    searchable = PROTECTED_HTML_PATTERN.sub(lambda match: " " * len(match[0]), "".join(masked))
    references: dict[int, tuple[int, str]] = {}
    for match in URL_PATTERN.finditer(searchable):
        raw_url = match[0].rstrip(".,;!?")
        for opening, closing in (("(", ")"), ("[", "]"), ("{", "}")):
            while raw_url.endswith(closing) and raw_url.count(closing) > raw_url.count(opening):
                raw_url = raw_url[:-1]
        url = unescape(raw_url)
        if is_media_source_url(url) and (is_media_url(url) or is_github_asset(url)):
            references[match.start()] = (match.start() + len(raw_url), url)
    for match in MEDIA_SRC_PATTERN.finditer(searchable):
        url = unescape(match[1])
        if is_media_source_url(url):
            references[match.start(1)] = (match.end(1), url)
    for start, (end, url) in sorted(references.items()):
        yield start, end, url


def extract_media_urls(content: str) -> set[str]:
    return {url for _, _, url in _media_references(content)}


def replace_media_urls(content: str, url_map: dict[str, str]) -> str:
    if not url_map:
        return content
    for start, end, url in reversed(list(_media_references(content))):
        replacement = url_map.get(url)
        if replacement and replacement != url:
            content = content[:start] + replacement + content[end:]
    return content
