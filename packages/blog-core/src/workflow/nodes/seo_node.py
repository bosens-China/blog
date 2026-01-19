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
                你是一位专注于技术深度的资深架构师。
                请为以下文章内容撰写一段 SEO 描述 (Description) 和提取关键词 (Keywords)。

                输出必须是标准的 JSON 格式，不要包含 Markdown 代码块标记。

                ## 核心目标：
                撰写一段**冷静、专业且有洞见**的摘要。你的受众是其他工程师，他们讨厌营销号式的标题党和夸张的承诺，他们更关心**技术实现细节、架构思考和底层机制**。

                ## 描述 (Description) 撰写指南：
                1. **风格要求**：
                   - **冷静克制**：使用陈述句。不要使用感叹号。
                   - **直击核心**：直接描述文章探讨了什么具体技术难题、采用了什么算法/模式，或者构建了什么系统。
                   - **有“人味”**：虽然要专业，但不要写成僵硬的大纲。可以像是技术周刊的推荐语，点出文章的独特价值。

                2. **严格禁止 (Kill List)**：
                   - ❌ 禁止使用“营销号问句”开场（例如：“还在为...头疼？”、“你是否遇到过...？”）。
                   - ❌ 禁止使用夸张形容词（例如：“完美”、“极致”、“神技”、“颠覆”）。
                   - ❌ 禁止承诺式语句（例如：“彻底解决”、“效率提升 100%”）。
                   - ❌ 禁止使用“本文介绍了...”、“学习如何...”这种被动的学生气开头。

                3. **长度控制**：120-160 字符。
                4. **语言一致性**：输出语言与文章正文语言保持一致。

                ## 关键词 (Keywords) 要求：
                - 提取 5-8 个核心概念、技术栈或话题标签。
                - 必须是字符串列表。

                ## 风格对比示例：
                ❌ **营销风 (不要)**：
                "还在为插件依赖头疼？本文教你用拓扑排序彻底搞定并发调度，效率提升100%！快来看看吧！"

                ✅ **专家风 (推荐)**：
                "面对插件系统复杂的依赖关系，简单的串行执行已成为性能瓶颈。本文探讨如何利用 Kahn 算法实现拓扑排序，重构调度逻辑，从而构建出支持高效并发执行的插件架构。"

                ## 边界处理：
                如果内容过短（少于 100 字）或无法提取有效信息，请将 description 和 keywords 留空。
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
        llm = llm_service.get_llm(temperature=1.0)
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
