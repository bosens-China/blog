from typing import Any

from config import settings
from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph
from workflow.nodes.column_node import generate_columns_node
from workflow.nodes.fetch_node import fetch_issues_node
from workflow.nodes.image_node import process_images_node
from workflow.nodes.save_node import save_data_node
from workflow.nodes.seo_node import generate_article_seo_node
from workflow.nodes.site_seo_node import generate_site_seo_node
from workflow.state import ArticleState, OverallState


def should_run_llm(state: OverallState | ArticleState) -> str:
    """检查是否配置了 LLM Key"""
    if settings.OPENAI_API_KEY:
        return "continue"
    return "skip"


def format_output_node(state: ArticleState) -> dict[str, Any]:
    """
    格式化输出节点：将当前的 article 包装到 processed_articles 中，
    以便主图能够将其合并。
    """
    return {"processed_articles": [state["article"]]}


# --- 1. 定义子图 (Article Processor) ---
article_builder = StateGraph(ArticleState)
article_builder.add_node("process_images", process_images_node)
article_builder.add_node("generate_seo", generate_article_seo_node)
article_builder.add_node("format_output", format_output_node)


# 流程: Start -> (Check Images) -> Process Images / Generate SEO / Format Output -> End
def determine_article_entry(state: ArticleState) -> str:
    """决定文章处理的入口"""
    # 检查是否配置了图片处理凭证
    has_images = all(
        [
            settings.DOGECLOUD_ACCESS_KEY,
            settings.DOGECLOUD_SECRET_KEY,
            settings.DOGECLOUD_BUCKET,
        ]
    )

    if has_images:
        return "process_images"

    # 如果没有配置图片，直接检查 LLM 配置
    if settings.OPENAI_API_KEY:
        return "generate_seo"

    # 都不需要，直接去格式化输出
    return "format_output"


article_builder.add_conditional_edges(
    START,
    determine_article_entry,
    {
        "process_images": "process_images",
        "generate_seo": "generate_seo",
        "format_output": "format_output",
    },
)

article_builder.add_conditional_edges(
    "process_images",
    should_run_llm,
    {"continue": "generate_seo", "skip": "format_output"},
)

article_builder.add_edge("generate_seo", "format_output")
article_builder.add_edge("format_output", END)

article_graph = article_builder.compile()

# --- 2. 定义主图 (Main Workflow) ---
builder = StateGraph(OverallState)

builder.add_node("fetch_issues", fetch_issues_node)
builder.add_node("article_processor", article_graph)  # 将子图作为一个节点
builder.add_node("generate_columns", generate_columns_node)
builder.add_node("generate_site_seo", generate_site_seo_node)
builder.add_node("save_data", save_data_node)


# 定义 Map 逻辑: 将 fetch 到的 issues 分发给 article_processor
def map_articles(state: OverallState) -> list[Send]:
    # 为每个 issue 创建一个 Send 对象，目标是 article_processor
    # 注意: article_processor 是一个 compiled graph，它作为节点时
    # 它的输入应该是它定义的 State (ArticleState)
    return [Send("article_processor", {"article": issue}) for issue in state["issues"]]


# 流程编排
builder.add_edge(START, "fetch_issues")

# 动态边: fetch_issues -> (Map) -> article_processor
builder.add_conditional_edges("fetch_issues", map_articles, ["article_processor"])

# 聚合: article_processor 的结果会自动合并到 OverallState.processed_articles
# (因为我们定义了 reducer)
# 之后检查是否运行 LLM 任务 (专栏 & 站点 SEO)
builder.add_conditional_edges(
    "article_processor",
    should_run_llm,
    {"continue": "generate_columns", "skip": "save_data"},
)

builder.add_edge("generate_columns", "generate_site_seo")
builder.add_edge("generate_site_seo", "save_data")
builder.add_edge("save_data", END)

# 编译主图
graph = builder.compile()
