import logging
from typing import Any

from utils.markdown_utils import markdown_utils
from workflow.state import ArticleState

logger = logging.getLogger(__name__)


async def preprocess_article_node(state: ArticleState) -> dict[str, Any]:
    """
    节点: 预处理文章 (提取图片、字数统计、阅读时长)
    """
    article = state["article"]
    body = article.body or ""

    # 1. 提取图片
    images = markdown_utils.extract_image_urls(body)

    # 2. 统计字数和阅读时长
    word_count, reading_time = markdown_utils.get_stats(body)

    logger.info(
        f"预处理文章: {article.title} | 字数: {word_count} | 时长: {reading_time}min | 图片: {len(images)}"
    )

    # 更新文章对象
    updated_article = article.model_copy(
        update={
            "images": images,
            "word_count": word_count,
            "reading_time": reading_time,
        }
    )

    return {"article": updated_article}
