import logging
from typing import Any, cast

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from schemas import SEOData
from services.cache import llm_cache
from services.llm import LLMService
from utils.cache import generate_cache_key
from workflow.state import ArticleState

logger = logging.getLogger(__name__)


# 定义 LLM 输出结构 (仅用于 LLM 解析)
class LLMSEOResult(BaseModel):
    description: str = Field(description="SEO 优化后的描述，最大 160 字符")
    keywords: list[str] = Field(description="5-8 个相关的关键词/标签")


async def generate_article_seo_node(state: ArticleState) -> dict[str, Any]:
    """
    节点: 为单篇文章生成 SEO 信息 (Description, Keywords)
    """
    from config import settings

    article = state["article"]

    # 使用 article.body
    content_snippet = (article.body or "")[:5000]

    # 0. 前置检查：如果内容过短，直接返回空 SEO，节省 Token 并避免幻觉
    if len(content_snippet.strip()) < 50:
        logger.info(f"文章内容过短({len(content_snippet)}chars)，跳过 SEO 生成: {article.title}")
        # 返回空的 SEO 数据
        seo_data = SEOData(description="", keywords=[])
        updated_article = article.model_copy(update={"seo": seo_data})
        return {"article": updated_article}

    # 1. 定义 Prompt (提前定义以用于缓存键计算)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                "你是一位 SEO 专家。
                "请为以下内容生成 SEO 描述 (Description) 和关键词 (Keywords)。"
                "输出必须是标准的 JSON 格式，"
                "不要包含 Markdown 代码块标记（如 ```json）。

                ## 规则：
                1. 描述 (Description) 应当具有吸引力，鼓励用户点击，而不仅仅是摘要。
                2. 确保输出语言与文章内容语言一致（如果文章是中文，SEO 也是中文）。
                3. 根据文章内容风格调整语气（技术文章专业严谨，生活文章轻松感性）。
                4. Description 长度控制在 160 字符以内。
                5. Keywords 必须是字符串列表 (Array of strings)。

                ## 输出 JSON 示例：
                {{
                    "description": "这是一篇关于 Python 异步编程的深度好文...",
                    "keywords": ["Python", "Asyncio", "并发编程"]
                }}

                ## 补充说明，必须遵守
                1. 如果内容过短或者内容不包含足够的信息，请留空返回。
                """,
            ),
            (
                "user",
                """
                标题: {title}

                内容:
                {content}
                """,
            ),
        ]
    )

    # 2. 计算缓存 Key (包含版本、Prompt、输入内容)
    prompt_str = str(prompt.messages)
    cache_key = generate_cache_key("seo", prompt_str, article.title, content_snippet)

    # 3. 检查缓存
    result: LLMSEOResult | None = None
    if settings.LLM_CACHE_ENABLED:
        cached_data = llm_cache.get(cache_key)
        if cached_data:
            logger.info(f"命中 SEO 缓存: {article.title}")
            try:
                result = LLMSEOResult(**cached_data)
            except Exception as e:
                logger.warning(f"SEO 缓存解析失败: {e}, 重新生成")
                result = None

    if not result:
        logger.info(f"正在生成 SEO: {article.title}")

        llm_service = LLMService()
        # 获取 LLM 实例
        llm = llm_service.get_llm(temperature=0)
        # 使用 json_mode 以兼容 DeepSeek
        structured_llm = llm.with_structured_output(LLMSEOResult, method="json_mode")

        try:
            # 分步执行：先生成 prompt，再调用 LLM
            messages = await prompt.ainvoke({"title": article.title, "content": content_snippet})
            # 显式忽略泛型类型推断错误
            result = cast(LLMSEOResult, await structured_llm.ainvoke(messages))

            # 存入缓存
            if settings.LLM_CACHE_ENABLED:
                llm_cache.set(cache_key, result.model_dump())
            logger.info(f"SEO 生成完成: {article.title}")

        except Exception as e:
            logger.error(f"SEO 生成失败 [{article.title}]: {e}")
            return {"article": article}

    # 构造 SEOData 对象
    seo_data = SEOData(description=result.description, keywords=result.keywords)

    # 更新文章对象，挂载 seo 字段
    updated_article = article.model_copy(update={"seo": seo_data})

    return {"article": updated_article}
