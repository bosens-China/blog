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
        使用 url_map 替换 Markdown 内容中的图片 URL。

        采用「定向字符串替换」而非「AST 重渲染」：只替换命中的图片链接，
        其余原文逐字保留。避免 marko 重渲染把整篇正文规范化（列表序号、行尾硬换行等）。
        """
        if not content or not url_map:
            return content

        try:
            result = content
            # 长 URL 先替换，避免一个 URL 是另一个的前缀时被误伤
            for old_url in sorted(url_map, key=len, reverse=True):
                new_url = url_map[old_url]
                if not new_url or new_url == old_url:
                    continue
                old_esc = re.escape(old_url)

                # 1) Markdown 图片： ](url) / ](url "title") / ](<url>)
                #    前缀匹配 ](、可选空白、可选 <；URL 后须紧跟 ) 空白 或 >，确保只命中链接目标
                result = re.sub(
                    r"(\]\(\s*<?)" + old_esc + r"(?=[\s)>])",
                    lambda m, u=new_url: m.group(1) + u,
                    result,
                )
                # 2) HTML <img src="url"> / src='url'
                result = re.sub(
                    r"(src\s*=\s*[\"'])" + old_esc + r"(?=[\"'])",
                    lambda m, u=new_url: m.group(1) + u,
                    result,
                )
            return result
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
            # 注意先判空：空代码块的 children 可能为空列表，直接索引会 IndexError，
            # 进而被外层 except 吞掉导致整篇字数/阅读时长归零
            children = element.children
            if children and hasattr(children[0], "children"):
                code_text = children[0].children  # type: ignore
                if isinstance(code_text, str):
                    text_parts.append(code_text)
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
