from typing import Any

from config import settings
from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph
from workflow.nodes.column_node import generate_columns_node
from workflow.nodes.preprocess_node import preprocess_article_node
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
# 职责：处理单篇文章的 SEO 和格式化
article_builder = StateGraph(ArticleState)
article_builder.add_node("preprocess", preprocess_article_node)
article_builder.add_node("generate_seo", generate_article_seo_node)
article_builder.add_node("format_output", format_output_node)


# 子图流程: Start -> Preprocess -> Generate SEO / Format Output -> End
def determine_seo_step(state: ArticleState) -> str:
    """决定是否进行 SEO 处理"""
    if settings.OPENAI_API_KEY:
        return "generate_seo"
    return "format_output"


article_builder.add_edge(START, "preprocess")
article_builder.add_conditional_edges(
    "preprocess",
    determine_seo_step,
    {
        "generate_seo": "generate_seo",
        "format_output": "format_output",
    },
)

article_builder.add_edge("generate_seo", "format_output")
article_builder.add_edge("format_output", END)

article_graph = article_builder.compile()

# --- 2. 定义主图 (Main Workflow) ---
# 职责：接收已就绪的 Issues，分发处理，聚合结果，生成专栏和站点 SEO，保存
builder = StateGraph(OverallState)

# 注册节点
# 注意：Fetch 节点已被移除，数据由外部传入
builder.add_node("article_processor", article_graph)
builder.add_node("generate_columns", generate_columns_node)
builder.add_node("generate_site_seo", generate_site_seo_node)
builder.add_node("save_data", save_data_node)


# 定义 Map 逻辑: 将输入的 issues 分发给 article_processor
def map_articles(state: OverallState) -> list[Send]:
    if not state.get("issues"):
        return []
    return [Send("article_processor", {"article": issue}) for issue in state["issues"]]


# 主图流程编排
# START -> Map (分发给 article_processor)
builder.add_conditional_edges(START, map_articles, ["article_processor"])

# 聚合: article_processor 的结果会自动合并到 OverallState.processed_articles (Reducer生效)
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
