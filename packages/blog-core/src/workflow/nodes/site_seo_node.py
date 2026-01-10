import logging
from typing import Any, cast

from langchain_core.prompts import ChatPromptTemplate
from schemas import SEOData
from services.cache import llm_cache
from services.llm import LLMService
from utils.cache import generate_cache_key
from workflow.state import OverallState

logger = logging.getLogger(__name__)


async def generate_site_seo_node(state: OverallState) -> dict[str, Any]:
    """
    节点: 生成站点级 SEO 信息 (Description, Keywords)
    """
    from config import settings

    articles = state["processed_articles"]
    if not articles:
        return {"site_seo": None}

    # 汇总所有关键词和标题
    all_tags: set[str] = set()
    latest_titles: list[str] = []

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
                """
                    规则：
                    1. **核心任务**：完全基于提供的【最近文章标题】和【热门标签】来动态分析博客的主题定位。
                    2. **去偏见**：绝对不要预设博客的领域（不要默认是前端、AI或特定语言），输入什么就总结什么。
                    3. **包容性**：博客可能包含技术深究、职场经验、生活感悟、摄影绘画等任何内容。请识别出所有主要维度。
                    4. 描述 (Description) 需要逻辑通顺，将分析出的几个主要维度自然串联。
                    5. Description 长度控制在 160-200 字符之间。
                    6. Keywords 必须是字符串列表 (Array of strings)，选取最具代表性的 5-8 个词。

                    输出 JSON 示例（仅供格式参考，内容请根据实际输入生成）：
                    {{
                        "description": "本博客主要探讨[核心技术领域]的架构与实践，同时也记录了作者在[生活/其他兴趣领域]的思考与探索...",
                        "keywords": ["核心技术标签", "次要技术标签", "生活/兴趣标签"]
                    }}
                    """,
            ),
            (
                "user",
                """
                最近文章标题:
                {titles}

                热门标签:
                {tags}
                """,
            ),
        ]
    )

    # 2. 计算缓存 Key
    prompt_str = str(prompt.messages)
    cache_key = generate_cache_key("site_seo", prompt_str, titles_str, tags_str)

    # 3. 检查缓存
    result: SEOData | None = None
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
