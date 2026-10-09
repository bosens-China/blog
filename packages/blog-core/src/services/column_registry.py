import logging
import re
from pathlib import Path

from pydantic import ValidationError
from schemas import Column
from utils.json_file import read_json_object

logger = logging.getLogger(__name__)

# 新专栏与已有专栏的文章重合比例达到该值时，视为同一系列并沿用旧 id
MIN_OVERLAP_RATIO = 0.5

_SLUG_INVALID_CHARS = re.compile(r"[^a-z0-9]+")


class ColumnRegistry:
    """
    专栏 id 登记表。
    专栏 id 是系列页的 URL slug，基于上一次生成的结果复用 id，避免 LLM 重新聚类后链接失效。
    """

    def __init__(self, previous: list[Column]) -> None:
        self._previous = previous
        self._reserved_ids = {c.id for c in previous}
        self._used_ids: set[str] = set()

    @classmethod
    def load(cls, meta_path: Path) -> "ColumnRegistry":
        """从上一次输出的 meta.json 中读取已有专栏"""
        payload = read_json_object(meta_path) or {}
        previous: list[Column] = []
        for item in payload.get("columns", []):
            try:
                previous.append(Column.model_validate(item))
            except ValidationError as e:
                logger.warning(f"忽略无法解析的历史专栏: {e}")
        return cls(previous)

    def prompt_hint(self) -> str:
        """提供给 LLM 的已有专栏列表，引导其沿用 id 与名称"""
        if not self._previous:
            return "（无）"
        return "\n".join(f"- id: {c.id}, name: {c.name}, article_ids: {c.article_ids}" for c in self._previous)

    def resolve_id(self, name: str, article_ids: list[int], proposed_id: str) -> str:
        """
        确定专栏的最终 id，优先级：
        1. 同名的已有专栏
        2. 文章重合度最高（且不低于阈值）的已有专栏
        3. LLM 给出的 id（规范化并避开所有已占用 id）
        """
        resolved = self._match_by_name(name) or self._match_by_articles(article_ids)
        if resolved is None:
            resolved = self._unique_slug(_slugify(proposed_id) or f"series-{min(article_ids, default=0)}")
        self._used_ids.add(resolved)
        return resolved

    def _match_by_name(self, name: str) -> str | None:
        for c in self._previous:
            if c.name == name and c.id not in self._used_ids:
                return c.id
        return None

    def _match_by_articles(self, article_ids: list[int]) -> str | None:
        current = set(article_ids)
        best_id: str | None = None
        best_ratio = 0.0
        for c in self._previous:
            if c.id in self._used_ids or not c.article_ids or not current:
                continue
            ratio = len(current & set(c.article_ids)) / min(len(current), len(c.article_ids))
            if ratio > best_ratio:
                best_id, best_ratio = c.id, ratio
        return best_id if best_ratio >= MIN_OVERLAP_RATIO else None

    def _unique_slug(self, slug: str) -> str:
        taken = self._reserved_ids | self._used_ids
        candidate, index = slug, 2
        while candidate in taken:
            candidate = f"{slug}-{index}"
            index += 1
        return candidate


def _slugify(value: str) -> str:
    return _SLUG_INVALID_CHARS.sub("-", value.lower()).strip("-")
