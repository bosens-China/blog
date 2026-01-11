from typing import Any

import marko
from bs4 import BeautifulSoup, Tag
from marko.block import HTMLBlock
from marko.inline import Image, InlineHTML
from marko.md_renderer import MarkdownRenderer


class MarkdownUtils:
    def __init__(self) -> None:
        self.markdown = marko.Markdown(renderer=MarkdownRenderer)

    def extract_image_urls(self, content: str) -> list[str]:
        """
        提取 Markdown 内容中的所有图片 URL
        """
        if not content:
            return []

        try:
            parsed = self.markdown.parse(content)
            urls: list[str] = []
            self._find_image_nodes(parsed, urls)
            return urls
        except Exception:
            return []

    def replace_image_urls(self, content: str, url_map: dict[str, str]) -> str:
        """
        使用 url_map 替换 Markdown 内容中的图片 URL
        """
        if not content or not url_map:
            return content

        try:
            parsed = self.markdown.parse(content)
            self._replace_image_nodes(parsed, url_map)
            return self.markdown.render(parsed)
        except Exception:
            return content

    def _find_image_nodes(self, element: Any, urls: list[str]) -> None:
        """递归查找图片节点并收集 URL"""
        # Markdown Image
        if isinstance(element, Image):
            if element.dest:
                urls.append(element.dest)

        # HTML Image
        elif isinstance(element, (InlineHTML, HTMLBlock)):
            is_block = isinstance(element, HTMLBlock)
            content = element.body if is_block else element.children

            if isinstance(content, str):
                soup = BeautifulSoup(content, "html.parser")
                img_tag = soup.find("img")
                if isinstance(img_tag, Tag):
                    src = img_tag.get("src")
                    if isinstance(src, str) and src:
                        urls.append(src)

        # 递归子节点
        self._traverse_children(element, lambda child: self._find_image_nodes(child, urls))

    def _replace_image_nodes(self, element: Any, url_map: dict[str, str]) -> None:
        """递归查找图片节点并替换 URL"""
        # Markdown Image
        if isinstance(element, Image):
            if element.dest in url_map:
                element.dest = url_map[element.dest]

        # HTML Image
        elif isinstance(element, (InlineHTML, HTMLBlock)):
            is_block = isinstance(element, HTMLBlock)
            content_attr = "body" if is_block else "children"
            current_content = getattr(element, content_attr, "")

            if isinstance(current_content, str):
                soup = BeautifulSoup(current_content, "html.parser")
                img_tag = soup.find("img")
                if isinstance(img_tag, Tag):
                    src = img_tag.get("src")
                    if isinstance(src, str) and src in url_map:
                        img_tag["src"] = url_map[src]
                        setattr(element, content_attr, str(soup))

        # 递归子节点
        self._traverse_children(element, lambda child: self._replace_image_nodes(child, url_map))

    def _traverse_children(self, element: Any, callback: Any) -> None:
        """Helper to traverse children"""
        if hasattr(element, "children"):
            children = element.children
            if isinstance(children, list):
                for child in children:
                    callback(child)
            elif hasattr(children, "children"):
                callback(children)


# 单例实例
markdown_utils = MarkdownUtils()
