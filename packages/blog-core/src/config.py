import os
import tomllib
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- 环境配置 ---
    APP_ENV: str = Field(
        default_factory=lambda: "ci"
        if os.getenv("GITHUB_ACTIONS") == "true"
        else "development",
        description="应用运行环境: 'development' 或 'ci'。在 GitHub Actions 中自动识别。",  # noqa: E501
    )

    # --- GitHub 配置 ---
    GITHUB_TOKEN: str | None = Field(
        default=None,
        description="GitHub 令牌。可选。未配置时仅能访问公开仓库且受频率限制。",
    )
    GITHUB_REPO: str | None = Field(
        default=None,
        description="目标仓库，格式为 '用户名/仓库名'。在 GitHub Actions 中会自动获取。",  # noqa: E501
    )

    @property
    def effective_repo(self) -> str:
        """获取有效的仓库名称，优先使用配置，其次使用环境变量"""
        if self.GITHUB_REPO:
            return self.GITHUB_REPO

        # 尝试从 GitHub Actions 环境变量获取
        import os

        repo = os.getenv("GITHUB_REPOSITORY")
        if repo:
            return repo

        raise ValueError("未配置 GITHUB_REPO 且未在 GitHub Actions 环境中")

    # --- LLM 配置 ---
    OPENAI_API_KEY: str | None = Field(
        default=None, description="OpenAI API 密钥。可选。未配置将跳过 SEO 和专栏生成。"
    )
    OPENAI_BASE_URL: str = Field(
        default="https://api.deepseek.com",
        description="API 基础地址。如使用代理或国产大模型，请修改此项。",
    )
    OPENAI_MODEL: str = Field(
        default="deepseek-chat",
        description="使用的模型名称。如: gpt-4o, gpt-4-turbo 等。",
    )
    LLM_CACHE_ENABLED: bool = Field(default=True, description="是否启用 LLM 缓存。")

    @property
    def project_version(self) -> str:
        """从 pyproject.toml 读取项目版本，用于缓存失效"""
        try:
            # src/config.py -> src -> blog-core -> packages -> root
            pyproject_path = (
                Path(__file__).parent.parent.parent.parent / "pyproject.toml"
            )  # noqa: E501
            if pyproject_path.exists():
                with open(pyproject_path, "rb") as f:
                    data = tomllib.load(f)
                    return data.get("project", {}).get("version", "0.0.0")
        except Exception:
            pass
        return "0.0.0"

    # --- 图片处理配置 ---
    IMAGE_UPLOAD_API: str | None = Field(
        default=None, description="通用图片上传接口地址。"
    )

    # --- 多吉云 (DogeCloud) OSS 配置 ---
    DOGECLOUD_ACCESS_KEY: str | None = Field(
        default=None, description="多吉云 AccessKey。"
    )
    DOGECLOUD_SECRET_KEY: str | None = Field(
        default=None, description="多吉云 SecretKey。"
    )
    DOGECLOUD_BUCKET: str | None = Field(
        default=None, description="多吉云存储空间名称。"
    )
    DOGECLOUD_REGION: int = Field(
        default=0, description="地域。0:上海, 1:北京, 2:广州, 3:成都。"
    )
    DOGECLOUD_DOMAIN: str | None = Field(
        default=None, description="自定义域名，例如 'https://img.example.com'。"
    )

    # --- 并发控制 ---
    MAX_ARTICLE_CONCURRENCY: int = Field(
        default=5, description="同时处理的文章数量限制。"
    )
    MAX_IMAGE_CONCURRENCY: int = Field(
        default=3, description="单篇文章内并行处理图片的数量限制。"
    )

    # --- 路径配置 ---
    OUTPUT_DIR: str = Field(
        default=str(Path(__file__).parent.parent.parent / "blog-data" / "data"),
        description="静态 JSON 数据输出目录。",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()  # type: ignore
