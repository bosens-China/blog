import logging
import math
import re
from typing import Any

import marko
from bs4 import BeautifulSoup, Tag
from marko.block import CodeBlock, FencedCode, HTMLBlock
from marko.inline import Image, InlineHTML, RawText
from marko.md_renderer import MarkdownRenderer

logger = logging.getLogger(__name__)


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
        except Exception as e:
            logger.warning(f"提取 Markdown 图片失败: {e}")
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
        except Exception as e:
            logger.warning(f"替换 Markdown 图片链接失败: {e}")
            return content

    def get_stats(self, content: str) -> tuple[int, int]:
        """
        计算字数和预计阅读时间 (分钟)
        返回: (字数, 阅读时间)
        """
        if not content:
            return 0, 0

        try:
            parsed = self.markdown.parse(content)
            text_parts: list[str] = []
            image_count = [0]  # 使用 list 以便在闭包中修改

            self._extract_text_and_count_images(parsed, text_parts, image_count)
            full_text = "".join(text_parts)

            # 字数统计：中文字符数 + 英文单词数
            # 匹配中文字符
            chinese_chars = len(re.findall(r"[\u4e00-\u9fa5]", full_text))
            # 匹配英文单词 (包含数字和连字符)
            english_words = len(re.findall(r"[a-zA-Z0-9-]+", full_text))

            total_word_count = chinese_chars + english_words

            # 阅读时长估算 (分钟)
            # 中文约 400 字/分钟，英文约 200 词/分钟
            reading_time_minutes = (chinese_chars / 400) + (english_words / 200)

            # 图片增加阅读时间：前几张图每张 12s, 之后每张 3s
            image_time_seconds = 0
            for i in range(image_count[0]):
                image_time_seconds += max(12 - i, 3)

            total_reading_time = math.ceil(reading_time_minutes + (image_time_seconds / 60))

            return total_word_count, max(1, total_reading_time)
        except Exception as e:
            logger.warning(f"统计 Markdown 内容失败: {e}")
            return 0, 0

    def _extract_text_and_count_images(self, element: Any, text_parts: list[str], image_count: list[int]) -> None:
        """
        从 AST 中提取纯文本并统计图片数量
        """
        if isinstance(element, RawText):
            text_parts.append(element.children)
        elif isinstance(element, CodeBlock | FencedCode):
            # 代码块也计入字数，但通常只取其内容
            text_parts.append(element.children[0].children if hasattr(element.children[0], "children") else "")  # type: ignore
        elif isinstance(element, Image):
            image_count[0] += 1
        elif isinstance(element, InlineHTML | HTMLBlock):
            # 处理 HTML 中的图片和文本
            is_block = isinstance(element, HTMLBlock)
            content = element.body if is_block else element.children
            if isinstance(content, str):
                soup = BeautifulSoup(content, "html.parser")
                image_count[0] += len(soup.find_all("img"))
                text_parts.append(soup.get_text())

        # 递归处理子节点
        self._traverse_children(
            element, lambda child: self._extract_text_and_count_images(child, text_parts, image_count)
        )

    def _find_image_nodes(self, element: Any, urls: list[str]) -> None:
        """递归查找图片节点并收集 URL"""
        # Markdown Image
        if isinstance(element, Image):
            if element.dest:
                urls.append(element.dest)

        # HTML Image
        elif isinstance(element, InlineHTML | HTMLBlock):
            is_block = isinstance(element, HTMLBlock)
            content = element.body if is_block else element.children

            if isinstance(content, str):
                soup = BeautifulSoup(content, "html.parser")
                for img_tag in soup.find_all("img"):
                    if not isinstance(img_tag, Tag):
                        continue
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
        elif isinstance(element, InlineHTML | HTMLBlock):
            is_block = isinstance(element, HTMLBlock)
            content_attr = "body" if is_block else "children"
            current_content = getattr(element, content_attr, "")

            if isinstance(current_content, str):
                soup = BeautifulSoup(current_content, "html.parser")
                replaced = False
                for img_tag in soup.find_all("img"):
                    if not isinstance(img_tag, Tag):
                        continue
                    src = img_tag.get("src")
                    if isinstance(src, str) and src in url_map:
                        img_tag["src"] = url_map[src]
                        replaced = True
                if replaced:
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
