import logging
from pathlib import Path
from typing import Any, cast

from pydantic import ValidationError
from schemas import SEOData, SiteSEOData
from services.llm import LLMService
from services.site_profile import PROFILE_SIZE, is_profile_stable, rank_tags
from utils.cache import generate_cache_key
from utils.json_file import read_json_object
from workflow.prompts import SITE_SEO_PROMPT
from workflow.state import OverallState

logger = logging.getLogger(__name__)

# 重新生成时传给 LLM 的上下文规模
MAX_CONTEXT_TITLES = 20
MAX_CONTEXT_TAGS = 30


async def generate_site_seo_node(state: OverallState) -> dict[str, Any]:
    """
    节点: 生成站点级 SEO 信息 (Description, Keywords)
    仅在 Prompt / 站点名变化，或博客主题画像明显漂移时才调用 LLM，否则沿用上一次的结果。
    """
    from config import settings

    articles = state["processed_articles"]
    if not articles:
        return {"site_seo": None}

    # 按 ID 倒序保证顺序稳定，近似为最新文章在前
    sorted_articles = sorted(articles, key=lambda x: x.id, reverse=True)
    context_titles = [a.title for a in sorted_articles[:MAX_CONTEXT_TITLES]]
    ranked_tags = rank_tags(sorted_articles)

    # 0. 前置检查：如果数据严重不足，直接跳过
    if not context_titles and not ranked_tags:
        logger.info("站点数据不足（无标题和标签），跳过站点 SEO 生成")
        return {"site_seo": None}

    # 1. 漂移检测：依据未变且画像稳定时沿用现有描述
    profile = ranked_tags[:PROFILE_SIZE]
    fingerprint = generate_cache_key("site_seo", str(SITE_SEO_PROMPT.messages), settings.SITE_NAME)
    previous = _load_previous_site_seo(settings.meta_json_path)

    if (
        previous
        and previous.description
        and previous.fingerprint == fingerprint
        and is_profile_stable(profile, previous.profile)
    ):
        logger.info("站点主题画像未明显变化，沿用现有站点描述")
        return {"site_seo": previous}

    # 2. 重新生成；失败时保留旧描述，避免首页描述被清空
    seo = await _generate_site_seo(
        site_name=settings.SITE_NAME,
        titles="\n".join(context_titles),
        tags=", ".join(ranked_tags[:MAX_CONTEXT_TAGS]),
    )
    if seo is None:
        return {"site_seo": previous}

    return {"site_seo": SiteSEOData(**seo.model_dump(), profile=profile, fingerprint=fingerprint)}


def _load_previous_site_seo(meta_path: Path) -> SiteSEOData | None:
    """读取上一次输出的站点 SEO"""
    payload = read_json_object(meta_path) or {}
    data = payload.get("site_seo")
    if not data:
        return None
    try:
        return SiteSEOData.model_validate(data)
    except ValidationError as e:
        logger.warning(f"历史站点 SEO 解析失败，将重新生成: {e}")
        return None


async def _generate_site_seo(site_name: str, titles: str, tags: str) -> SEOData | None:
    """调用 LLM 生成站点 SEO"""
    logger.info("开始生成站点 SEO...")
    llm = LLMService().get_llm(temperature=1.0)
    # 使用 json_mode 以兼容 DeepSeek
    structured_llm = llm.with_structured_output(SEOData, method="json_mode")

    try:
        messages = await SITE_SEO_PROMPT.ainvoke({"site_name": site_name, "titles": titles, "tags": tags})
        result = cast(SEOData, await structured_llm.ainvoke(messages))
        logger.info("站点 SEO 生成完成")
        return result
    except Exception as e:
        logger.error(f"站点 SEO 生成失败: {e}")
        return None
