import logging

from services.github import GitHubService
from workflow.state import OverallState

logger = logging.getLogger(__name__)


async def fetch_issues_node(state: OverallState) -> dict:
    """
    节点: 从 GitHub 拉取 Issues
    """
    from config import settings

    logger.info(f"开始拉取 GitHub Issues [{settings.effective_repo}]...")
    service = GitHubService()
    try:
        # 拉取所有 open 状态的 issues
        articles = await service.fetch_issues(state="open")
        logger.info(f"成功拉取 {len(articles)} 篇 Issues")
        return {"issues": articles}
    except Exception as e:
        logger.error(f"拉取 Issues 失败: {e}")
        # 直接抛出异常，中断流程，避免假成功
        raise e
