import logging

from services.image import ImageService
from workflow.state import ArticleState

logger = logging.getLogger(__name__)


async def process_images_node(state: ArticleState) -> dict:
    """
    节点: 处理文章中的图片 (提取、上传、替换)
    """
    article = state["article"]
    logger.debug(f"正在处理图片: {article.title}")

    service = ImageService()
    try:
        # 使用 article.body (GitHub 原生字段)，如果为 None 则处理为空字符串
        new_content = await service.process_content(article.body or "")

        # 创建新的 Article 对象
        updated_article = article.model_copy(update={"body": new_content})

        return {"article": updated_article}
    except Exception as e:
        logger.error(f"处理图片失败 [{article.title}]: {e}")
        # 出错时返回原文章，不中断流程
        return {"article": article}
