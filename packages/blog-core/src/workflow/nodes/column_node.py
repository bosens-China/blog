import logging
from typing import cast

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from schemas import Column
from services.cache import llm_cache
from services.llm import LLMService
from utils.cache import generate_cache_key
from workflow.state import OverallState

logger = logging.getLogger(__name__)


class ColumnResult(BaseModel):
    columns: list[Column]


async def generate_columns_node(state: OverallState) -> dict:  # noqa: C901
    """
    节点: 根据文章列表生成专栏 (Series)
    """
    from config import settings

    articles = state["processed_articles"]
    if not articles:
        return {"columns": []}

    # 准备输入：ID 和 标题
    titles_list = [{"id": a.id, "title": a.title} for a in articles]
    titles_text = "\n".join([f"{item['id']}: {item['title']}" for item in titles_list])

    # 1. 定义 Prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一个专业的内容整理专家。"
                "请将以下博客文章标题分组整理成'专栏' (Series)。"
                "输出必须是标准的 JSON 格式，"
                "不要包含 Markdown 代码块标记（如 ```json）。",
            ),
            (
                "system",
                """
            规则：
            1. 一个专栏必须至少包含 2 篇文章。
            2. 同一专栏的文章通常共享相同的前缀或主题。
            3. 返回属于每个专栏的文章 ID 列表。
            4. 为每个专栏生成唯一的 ID (slug)、名称 (Name) 和描述 (Description)。
               - ID (slug) 必须仅包含小写字母、数字和连字符 (例如: `my-series-1`)。
            5. 不属于任何系列的独立文章应被忽略。

            输出 JSON 示例：
            {{
                "columns": [
                    {{
                        "id": "js-deep-dive",
                        "name": "深入理解 JS",
                        "description": "JavaScript 核心原理深度解析系列",
                        "article_ids": ["123", "124"]
                    }}
                ]
            }}
            请务必确保根字段名为 "columns"。
            """,
            ),
            ("user", "文章列表:\n{titles}"),
        ]
    )

    # 2. 计算缓存 Key
    prompt_str = str(prompt.messages)
    cache_key = generate_cache_key("columns", prompt_str, titles_text)

    # 3. 检查缓存
    result = None
    if settings.LLM_CACHE_ENABLED:
        cached_data = llm_cache.get(cache_key)
        if cached_data:
            logger.info("命中专栏缓存，跳过生成")
            try:
                result = ColumnResult(**cached_data)
            except Exception as e:
                logger.warning(f"缓存数据解析失败: {e}, 重新生成")
                result = None

    if not result:
        logger.info("开始生成专栏...")

        llm_service = LLMService()
        # 获取 LLM 实例
        llm = llm_service.get_llm(temperature=0)
        # 使用 json_mode 以兼容 DeepSeek
        structured_llm = llm.with_structured_output(ColumnResult, method="json_mode")

        try:
            # 分步执行：先生成 prompt，再调用 LLM
            messages = await prompt.ainvoke({"titles": titles_text})
            # 显式忽略泛型类型推断错误
            result = cast(ColumnResult, await structured_llm.ainvoke(messages))

            # 存入缓存
            if settings.LLM_CACHE_ENABLED:
                llm_cache.set(cache_key, result.model_dump())
            logger.info(f"生成了 {len(result.columns)} 个专栏")
        except Exception as e:
            logger.error(f"专栏生成失败: {e}")
            return {"columns": []}

    # 以下逻辑保持不变：回填 series 字段
    # 创建 ID -> Series Name 映射
    article_to_series = {}
    for col in result.columns:
        for art_id in col.article_ids:
            article_to_series[art_id] = col.name

    # 回填 series 字段 (注意：processed_articles 中的对象是可以修改的)
    for article in articles:
        if article.id in article_to_series:
            # 使用 object.__setattr__ 绕过 Pydantic (如果 frozen)
            # 或者直接赋值 (如果 ConfigDict allow mutation)
            article.series = article_to_series[article.id]

    return {"columns": result.columns}
