import logging
from typing import Any

import httpx
from config import settings
from schemas import Article

logger = logging.getLogger(__name__)


class GitHubService:
    base_url: str
    headers: dict[str, str]
    repo: str
    owner: str

    def __init__(self) -> None:
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

        self.repo = settings.effective_repo
        self.owner = self.repo.split("/")[0]

    async def fetch_issues(self, state: str = "open", labels: list[str] | None = None) -> list[Article]:
        """
        从 GitHub 仓库获取 Issues。
        仅获取由仓库所有者创建的 Issues。
        """
        url = f"{self.base_url}/repos/{self.repo}/issues"
        params: dict[str, Any] = {
            "state": state,
            "creator": self.owner,  # 仅获取仓库所有者创建的 Issue
            "per_page": 100,  # GitHub API 允许的最大值
            "page": 1,
        }

        if labels:
            params["labels"] = ",".join(labels)

        logger.info(f"GitHub Request: Repo={self.repo}, Owner={self.owner}, URL={url}, Params={params}")

        articles: list[Article] = []

        async with httpx.AsyncClient() as client:
            while True:
                try:
                    response = await client.get(url, headers=self.headers, params=params)
                    response.raise_for_status()
                    issues: list[dict[str, Any]] = response.json()

                    if not issues:
                        break

                    for issue in issues:
                        # 跳过 Pull Requests
                        if "pull_request" in issue:
                            continue

                        article = self._convert_to_article(issue)
                        articles.append(article)

                    # 检查下一页 (简单分页)
                    if len(issues) < int(params["per_page"]):
                        break

                    params["page"] = int(params["page"]) + 1

                except httpx.HTTPStatusError as e:
                    logger.error(f"GitHub API 错误: {e.response.status_code} - {e.response.text}")
                    raise
                except Exception as e:
                    logger.error(f"获取 Issues 失败: {str(e)}")
                    raise

        return articles

    def _convert_to_article(self, issue: dict[str, Any]) -> Article:
        """
        将 GitHub issue 转换为 Article 结构。
        """
        # 将原始 issue 字典解包传给 Article
        # 因为 model_config 设置了 extra='allow'，所有原始字段都会被保留
        issue_data: dict[str, Any] = issue.copy()

        # 确保 body 不为 None (如果为空字符串)
        if issue_data.get("body") is None:
            issue_data["body"] = ""

        return Article(**issue_data)

    async def fetch_file_content(self, repo: str, path: str = "README.md") -> str | None:
        """
        获取指定仓库文件的原始内容 (Raw Content)。
        通常用于获取 README.md 作为关于页面。
        """
        url = f"{self.base_url}/repos/{repo}/contents/{path}"
        headers = self.headers.copy()
        # 使用 raw header 直接获取文件内容
        headers["Accept"] = "application/vnd.github.raw"

        logger.info(f"GitHub Fetch File: Repo={repo}, Path={path}, URL={url}")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                if response.status_code == 404:
                    logger.warning(f"文件未找到: {repo}/{path}")
                    return None

                response.raise_for_status()
                return response.text

            except httpx.HTTPStatusError as e:
                logger.error(f"GitHub API 错误 (fetch_file): {e.response.status_code} - {e.response.text}")
                return None
            except Exception as e:
                logger.error(f"获取文件失败: {str(e)}")
                return None
