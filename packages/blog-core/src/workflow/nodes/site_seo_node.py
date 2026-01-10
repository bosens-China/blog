import logging
from typing import cast

from langchain_core.prompts import ChatPromptTemplate
from schemas import SEOData
from services.cache import llm_cache
from services.llm import LLMService
from utils.cache import generate_cache_key
from workflow.state import OverallState

logger = logging.getLogger(__name__)


async def generate_site_seo_node(state: OverallState) -> dict:
    """
    节点: 生成站点级 SEO 信息 (Description, Keywords)
    """
    from config import settings

    articles = state["processed_articles"]
    if not articles:
        return {"site_seo": None}

    # 汇总所有关键词和标题
    all_tags = set()
    latest_titles = []

    for a in articles:
        # 从 article.seo.keywords 获取标签
        if a.seo and a.seo.keywords:
            all_tags.update(a.seo.keywords)

        latest_titles.append(a.title)

    context_tags = list(all_tags)[:50]
    context_titles = latest_titles[:20]

    titles_str = "\n".join(context_titles)
    tags_str = ", ".join(context_tags)

    # 1. 定义 Prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一位 SEO 专家。"
                "请为这个技术博客生成全局 SEO 元数据 (描述、关键词)。"
                "输出必须是标准的 JSON 格式，"
                "不要包含 Markdown 代码块标记（如 ```json）。",
            ),
            (
                "system",
                """
                    规则：
                    1. 基于提供的文章标题和标签，总结博客的整体主题和定位。
                    2. 描述 (Description) 应宏观、专业且具有包容性，
                       不要局限于某几篇具体文章。
                    3. 描述长度控制在 160-200 字符之间。
                    4. Keywords 必须是字符串列表 (Array of strings)。

                    输出 JSON 示例：
                    {{
                        "description": "本博客专注于前端开发、AI 探索及全栈技术分享...",
                        "keywords": ["前端", "AI", "全栈开发"]
                    }}
                    """,
            ),
            ("user", "最近文章标题:\n{titles}\n\n热门标签:\n{tags}"),
        ]
    )

    # 2. 计算缓存 Key
    prompt_str = str(prompt.messages)
    cache_key = generate_cache_key("site_seo", prompt_str, titles_str, tags_str)

    # 3. 检查缓存
    result = None
    if settings.LLM_CACHE_ENABLED:
        cached_data = llm_cache.get(cache_key)
        if cached_data:
            logger.info("命中站点 SEO 缓存")
            try:
                result = SEOData(**cached_data)
            except Exception as e:
                logger.warning(f"站点 SEO 缓存解析失败: {e}, 重新生成")
                result = None

    if not result:
        logger.info("开始生成站点 SEO...")

        llm_service = LLMService()
        # SEOData 只有 description 和 keywords
        llm = llm_service.get_llm(temperature=0)
        # 使用 json_mode 以兼容 DeepSeek
        structured_llm = llm.with_structured_output(SEOData, method="json_mode")

        try:
            # 分步执行：先生成 prompt，再调用 LLM
            messages = await prompt.ainvoke(
                {
                    "titles": titles_str,
                    "tags": tags_str,
                }
            )
            # 显式忽略泛型类型推断错误
            result = cast(SEOData, await structured_llm.ainvoke(messages))

            # 存入缓存
            if settings.LLM_CACHE_ENABLED:
                llm_cache.set(cache_key, result.model_dump())

            logger.info("站点 SEO 生成完成")
        except Exception as e:
            logger.error(f"站点 SEO 生成失败: {e}")
            return {"site_seo": None}

    return {"site_seo": result}
