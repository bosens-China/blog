import os
import tomllib
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class BaseConfig(BaseSettings):
    """基础通用配置"""

    # --- 环境配置 ---
    APP_ENV: str = Field(
        default_factory=lambda: "ci" if os.getenv("GITHUB_ACTIONS") == "true" else "development",
        description="应用运行环境: 'development' 或 'ci'。在 GitHub Actions 中自动识别。",
    )

    # --- GitHub 配置 ---
    GITHUB_TOKEN: str | None = Field(
        default=None,
        description="GitHub 令牌。可选。未配置时仅能访问公开仓库且受频率限制。",
    )
    GITHUB_REPO: str | None = Field(
        default=None,
        description="目标仓库，格式为 '用户名/仓库名'。在 GitHub Actions 中会自动获取。",
    )

    @property
    def effective_repo(self) -> str:
        """获取有效的仓库名称，优先使用配置，其次使用环境变量"""
        if self.GITHUB_REPO:
            return self.GITHUB_REPO

        repo = os.getenv("GITHUB_REPOSITORY")
        if repo:
            return repo

        raise ValueError("未配置 GITHUB_REPO 且未在 GitHub Actions 环境中")

    @property
    def project_version(self) -> str:
        """从 pyproject.toml 读取项目版本，用于缓存失效"""
        try:
            # 路径回溯: src/configs/base.py -> src -> blog-core -> packages -> root
            pyproject_path = Path(__file__).parent.parent.parent.parent.parent / "pyproject.toml"
            if pyproject_path.exists():
                with open(pyproject_path, "rb") as f:
                    data = tomllib.load(f)
                    return data.get("project", {}).get("version", "0.0.0")
        except Exception:
            pass
        return "0.0.0"

    # --- 路径配置 ---
    OUTPUT_DIR: str = Field(
        default=str(Path(__file__).parent.parent.parent.parent / "blog-data" / "data"),
        description="静态 JSON 数据输出目录。",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # 忽略其他模块的配置


base_settings = BaseConfig()
