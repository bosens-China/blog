import asyncio
import logging
import re
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


class ColumnUpdate(BaseModel):
    id: str
    article_ids: list[int]


class SkeletonResult(BaseModel):
    existing_updates: list[ColumnUpdate]
    new_columns: list[ColumnSkeleton]


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

    registry = ColumnRegistry.load(settings.meta_json_path)
    final_columns = registry.existing_columns({article.id for article in articles})
    article_map = {article.id: article for article in articles}
    assigned = {article_id for column in final_columns for article_id in column.article_ids}
    unassigned = [article for article in articles if article.id not in assigned]

    if settings.BLOG_CORE_LLM_API_KEY and unassigned:
        result = await _cluster_titles(unassigned, final_columns, article_map, settings)
        if result is not None:
            new_skeletons = _apply_suggestions(result, final_columns, {article.id for article in unassigned})
            final_columns.extend(await _enrich_columns(new_skeletons, articles, settings))
        else:
            logger.warning("专栏生成不可用，沿用 %s 个历史专栏", len(final_columns))
    elif not settings.BLOG_CORE_LLM_API_KEY:
        logger.warning("未配置 LLM，沿用 %s 个历史专栏", len(final_columns))

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


def _apply_suggestions(result: SkeletonResult, columns: list[Column], unassigned_ids: set[int]) -> list[ColumnSkeleton]:
    """只接受有效且未重复归属的增量建议。"""
    available = set(unassigned_ids)
    by_id = {column.id: column for column in columns}
    names = {column.name.strip().casefold() for column in columns}
    new_columns: list[ColumnSkeleton] = []

    def valid_ids(ids: list[int], minimum: int) -> bool:
        return len(ids) >= minimum and len(ids) == len(set(ids)) and set(ids) <= available

    for update in result.existing_updates:
        column = by_id.get(update.id)
        if not column or not valid_ids(update.article_ids, 1):
            logger.warning("忽略无效的已有专栏建议: %s", update.id)
            continue
        column.article_ids.extend(update.article_ids)
        available.difference_update(update.article_ids)

    for column in result.new_columns:
        name = column.name.strip()
        if (
            not name
            or name.casefold() in names
            or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", column.id)
            or column.id in by_id
            or not valid_ids(column.article_ids, MIN_COLUMN_ARTICLES)
        ):
            logger.warning("忽略无效的新专栏建议: %s", column.id)
            continue
        column = column.model_copy(update={"name": name})
        new_columns.append(column)
        by_id[column.id] = Column(id=column.id, name=name, description="", article_ids=column.article_ids)
        names.add(name.casefold())
        available.difference_update(column.article_ids)
    return new_columns


async def _cluster_titles(
    articles: list[Article], columns: list[Column], article_map: dict[int, Article], settings: Any
) -> SkeletonResult | None:
    """向 LLM 请求未归组文章的增量建议。"""
    titles_text = "\n".join(f"{article.id}: {article.title}" for article in articles)
    existing_hint = (
        "\n".join(
            f"- id: {column.id}, name: {column.name}, 文章: "
            + "；".join(f"{article_id}: {article_map[article_id].title}" for article_id in column.article_ids)
            for column in columns
        )
        or "（无）"
    )
    prompt = COLUMN_SKELETON_PROMPT
    cache_key = generate_cache_key("columns_incremental", str(prompt.messages), existing_hint, titles_text)

    if settings.LLM_CACHE_ENABLED:
        cached_data = llm_cache.get(cache_key)
        if cached_data is not None:
            try:
                logger.info("命中专栏增量建议缓存")
                return SkeletonResult(**cached_data)
            except Exception as error:
                logger.warning("专栏缓存解析失败: %s", error)

    logger.info("开始生成专栏增量建议...")
    try:
        llm = LLMService().get_llm(temperature=0)
        structured_llm = llm.with_structured_output(SkeletonResult, method="json_mode")
        messages = await prompt.ainvoke({"existing": existing_hint, "titles": titles_text})
        result = cast(SkeletonResult, await structured_llm.ainvoke(messages))
        if settings.LLM_CACHE_ENABLED:
            llm_cache.set(cache_key, result.model_dump())
        logger.info("专栏建议：%s 个已有专栏更新，%s 个新专栏", len(result.existing_updates), len(result.new_columns))
        return result
    except Exception as error:
        logger.error("专栏增量建议生成失败: %s", error)
        return None


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
        try:
            llm_service = LLMService()
            llm = llm_service.get_llm(temperature=1.0)
            structured_llm = llm.with_structured_output(ColumnDescriptionResult, method="json_mode")
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
