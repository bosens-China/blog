from urllib.parse import urljoin, urlparse

from utils.markdown_utils import markdown_utils


def is_relative_url(url: str) -> bool:
    parsed = urlparse(url)
    return not parsed.scheme and not parsed.netloc and not url.startswith(("/", "#", "data:"))


def resolve_asset_url(url: str, base_url: str) -> str:
    if not url or not is_relative_url(url):
        return url
    return urljoin(base_url, url)


def rewrite_relative_images(content: str, markdown_url: str) -> str:
    image_urls = markdown_utils.extract_image_urls(content)
    if not image_urls:
        return content

    url_map = {url: urljoin(markdown_url, url) for url in image_urls if is_relative_url(url)}
    return markdown_utils.replace_image_urls(content, url_map)
