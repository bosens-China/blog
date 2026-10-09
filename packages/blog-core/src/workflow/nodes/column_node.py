import asyncio
import logging
from typing import Any, cast

from pydantic import BaseModel, Field
from schemas import Article, Column
from services.cache import llm_cache
from services.column_registry import ColumnRegistry
from services.llm import LLMService
from utils.cache import generate_cache_key
from workflow.prompts import COLUMN_DESCRIPTION_PROMPT, COLUMN_SKELETON_PROMPT
from workflow.state import OverallState

logger = logging.getLogger(__name__)

# 专栏至少包含的文章数，与 Prompt 中的成组条件保持一致
MIN_COLUMN_ARTICLES = 2


class ColumnSkeleton(BaseModel):
    """专栏骨架（不含描述）"""

    id: str
    name: str
    article_ids: list[int]


class SkeletonResult(BaseModel):
    columns: list[ColumnSkeleton]


class ColumnDescriptionResult(BaseModel):
    description: str = Field(description="专栏的整体介绍/描述")


async def generate_columns_node(state: OverallState) -> dict[str, Any]:
    """
    节点: 两阶段生成专栏 (Series)
    1. 聚类: 根据标题将文章分组 (Skeleton)。
    2. 丰富: 根据组内文章的 SEO 摘要生成专栏描述 (Description)。
    """
    from config import settings

    articles = state["processed_articles"]
    if not articles:
        return {"columns": []}

    # === Phase 1: 聚类 (Clustering) ===
    skeletons = await _generate_skeletons(articles, settings)
    if not skeletons:
        return {"columns": []}

    # === Phase 2: 丰富 (Enriching) ===
    final_columns = await _enrich_columns(skeletons, articles, settings)

    # === Phase 3: 回填 (Backfill) ===
    # 将 Series Name 回填到文章对象中，方便后续处理
    article_to_series: dict[int, str] = {}
    for col in final_columns:
        for art_id in col.article_ids:
            article_to_series[art_id] = col.name

    for article in articles:
        if article.id in article_to_series:
            # 绕过 Pydantic 冻结限制 (如果存在)
            article.series = article_to_series[article.id]

    return {"columns": final_columns}


async def _generate_skeletons(articles: list[Article], settings: Any) -> list[ColumnSkeleton]:
    """第一阶段：根据标题生成专栏骨架，并用历史专栏稳定 id"""
    registry = ColumnRegistry.load(settings.meta_json_path)
    skeletons = await _cluster_titles(articles, registry.prompt_hint(), settings)

    return [
        s.model_copy(update={"id": registry.resolve_id(s.name, s.article_ids, s.id)})
        for s in skeletons
        if len(s.article_ids) >= MIN_COLUMN_ARTICLES
    ]


async def _cluster_titles(articles: list[Article], existing_hint: str, settings: Any) -> list[ColumnSkeleton]:
    """调用 LLM 将文章标题聚类为专栏骨架"""
    titles_text = "\n".join(f"{a.id}: {a.title}" for a in articles)
    prompt = COLUMN_SKELETON_PROMPT

    prompt_str = str(prompt.messages)
    # 缓存键：依赖已有专栏与标题列表
    cache_key = generate_cache_key("columns_skeleton", prompt_str, existing_hint, titles_text)

    # 检查缓存
    if settings.LLM_CACHE_ENABLED:
        cached_data = llm_cache.get(cache_key)
        if cached_data:
            logger.info("命中专栏骨架缓存")
            try:
                result = SkeletonResult(**cached_data)
                return result.columns
            except Exception as e:
                logger.warning(f"骨架缓存解析失败: {e}")

    logger.info("开始生成专栏骨架...")
    llm_service = LLMService()
    llm = llm_service.get_llm(temperature=0)
    structured_llm = llm.with_structured_output(SkeletonResult, method="json_mode")

    try:
        messages = await prompt.ainvoke({"existing": existing_hint, "titles": titles_text})
        result = cast(SkeletonResult, await structured_llm.ainvoke(messages))

        if settings.LLM_CACHE_ENABLED:
            llm_cache.set(cache_key, result.model_dump())
        logger.info(f"生成了 {len(result.columns)} 个专栏骨架")
        return result.columns
    except Exception as e:
        logger.error(f"专栏骨架生成失败: {e}")
        return []


async def _enrich_columns(skeletons: list[ColumnSkeleton], articles: list[Article], settings: Any) -> list[Column]:
    """第二阶段：并行生成每个专栏的描述"""
    article_map: dict[int, Article] = {a.id: a for a in articles}

    # 用信号量限制 LLM 并发，避免专栏数量多时瞬时打满接口（默认 100，可经 MAX_LLM_CONCURRENCY 调整）
    semaphore = asyncio.Semaphore(settings.MAX_LLM_CONCURRENCY)

    async def _bounded(s: ColumnSkeleton) -> Column:
        async with semaphore:
            return await _process_single_column(s, article_map, settings)

    tasks = [_bounded(s) for s in skeletons]
    results = await asyncio.gather(*tasks)
    return list(results)


async def _process_single_column(skeleton: ColumnSkeleton, article_map: dict[int, Article], settings: Any) -> Column:
    """处理单个专栏的描述生成"""
    # 收集该专栏下文章的 SEO 描述
    seo_summaries: list[str] = []
    for aid in skeleton.article_ids:
        art = article_map.get(aid)
        if art and art.seo and art.seo.description:
            seo_summaries.append(f"- {art.title}: {art.seo.description}")
        elif art:
            seo_summaries.append(f"- {art.title}: (无描述)")

    summaries_text = "\n".join(seo_summaries)

    prompt = COLUMN_DESCRIPTION_PROMPT

    prompt_str = str(prompt.messages)
    # 缓存键只依赖专栏结构：成员与名称不变时，单篇文章内容修改不触发重新生成
    cache_key = generate_cache_key("column_desc", prompt_str, skeleton.id, skeleton.name, sorted(skeleton.article_ids))

    description = ""
    # 检查缓存
    if settings.LLM_CACHE_ENABLED:
        cached_data = llm_cache.get(cache_key)
        if cached_data:
            try:
                res = ColumnDescriptionResult(**cached_data)
                description = res.description
            except Exception:
                pass

    if not description:
        logger.info(f"正在生成专栏描述: {skeleton.name}")
        llm_service = LLMService()
        llm = llm_service.get_llm(temperature=1.0)
        structured_llm = llm.with_structured_output(ColumnDescriptionResult, method="json_mode")

        try:
            messages = await prompt.ainvoke({"name": skeleton.name, "summaries": summaries_text})
            res = cast(ColumnDescriptionResult, await structured_llm.ainvoke(messages))
            description = res.description

            if settings.LLM_CACHE_ENABLED:
                llm_cache.set(cache_key, res.model_dump())
        except Exception as e:
            logger.error(f"专栏[{skeleton.name}]描述生成失败: {e}")
            description = f"{skeleton.name} 系列文章。"

    return Column(
        id=skeleton.id,
        name=skeleton.name,
        description=description,
        article_ids=skeleton.article_ids,
    )
