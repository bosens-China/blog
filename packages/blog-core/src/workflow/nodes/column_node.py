import asyncio
import logging
from typing import Any, cast

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from schemas import Article, Column
from services.cache import llm_cache
from services.llm import LLMService
from utils.cache import generate_cache_key
from workflow.state import OverallState

logger = logging.getLogger(__name__)


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
    """第一阶段：根据标题生成专栏骨架"""
    titles_list: list[dict[str, Any]] = [{"id": a.id, "title": a.title} for a in articles]
    titles_text = "\n".join([f"{item['id']}: {item['title']}" for item in titles_list])

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                你是一个专业的内容整理专家。请将以下博客文章标题分组整理成"专栏" (Series)。
                输出必须是标准的 JSON 格式。

                ## 规则：
                1. **核心任务**：识别并提取具有**相同前缀**或**高度相似标题结构**的文章系列。
                2. **成组条件**：至少包含 **2** 篇文章。
                3. **判别标准（连贯性优先）**：
                   - ✅ **推荐**：标题具有明显的前缀模式。
                     - 例如："深入理解JS系列之闭包" 和 "深入理解JS系列之原型链" -> "深入理解JS" 专栏。
                   - ❌ **拒绝**：仅仅包含相同的关键词但标题结构松散。
                4. ID (slug) 必须仅包含小写字母、数字和连字符。

                ## 输出 JSON 示例：
                {{
                    "columns": [
                        {{
                            "id": "js-deep-dive",
                            "name": "深入理解 JS",
                            "article_ids": [123, 124]
                        }}
                    ]
                }}
                请务必确保根字段名为 "columns"。

                ## 补充说明，必须遵守
                1. 如果传递的文章列表为空，请留空返回。
                """,
            ),
            (
                "user",
                """
                文章列表:
                {titles}
                """,
            ),
        ]
    )

    prompt_str = str(prompt.messages)
    # 缓存键：只依赖标题列表
    cache_key = generate_cache_key("columns_skeleton", prompt_str, titles_text)

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
        messages = await prompt.ainvoke({"titles": titles_text})
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

    # 并行执行所有专栏的丰富任务
    tasks = [_process_single_column(s, article_map, settings) for s in skeletons]
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

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                你是一个专栏主编。请根据以下专栏名称和包含的文章摘要，
                为该专栏写一段吸引人的整体介绍 (Description)。
                请务必输出 JSON 格式。

                ## 规则：
                1. 总结专栏的核心主题和价值。
                2. 语气专业且富有连贯性。
                3. 长度控制在 100-200 字符。

                ## 补充说明，必须遵守
                1. 如果传递的内容不足以生成有意义的描述，请留空返回。
                """,
            ),
            (
                "user",
                """
                专栏名称: {name}

                文章摘要列表:
                {summaries}
                """,
            ),
        ]
    )

    prompt_str = str(prompt.messages)
    # 缓存键：依赖专栏名 + 文章摘要内容
    cache_key = generate_cache_key("column_desc", prompt_str, skeleton.name, summaries_text)

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
        llm_service = LLMService()
        llm = llm_service.get_llm(temperature=0)
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
