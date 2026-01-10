import operator
from typing import Annotated, TypedDict

from schemas import Article, Column, SEOData


class OverallState(TypedDict):
    # 输入：从 GitHub 拉取的原始文章列表
    issues: list[Article]

    # 输出：并行处理后收集的文章列表
    # 使用 operator.add 将各个子任务返回的列表合并
    processed_articles: Annotated[list[Article], operator.add]

    # 最终生成的站点数据
    columns: list[Column]
    site_seo: SEOData | None


class ArticleState(TypedDict):
    """
    单篇文章处理流程的状态
    """

    article: Article
    # 用于输出给主图合并，列表里通常只有一个元素
    processed_articles: list[Article]
