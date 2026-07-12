from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "Blog AI Server"
    DEBUG: bool = False

    # AI 限速
    ENABLE_RATE_LIMIT: bool = True
    AI_DAILY_LIMIT: int = 10
    COMMENT_HOURLY_LIMIT: int = 10
    COMMENT_MODERATION_INTERVAL_SECONDS: int = 3600

    # Chat 输入与上下文约束
    # 单条消息最大字符数
    MAX_MESSAGE_LENGTH: int = 10000
    # 注入给 LLM 的最近历史轮数（1 轮 = 用户 + 助手 2 条）
    MAX_HISTORY_ROUNDS: int = 10
    MAX_COMMENT_LENGTH: int = 2000

    # Security
    ALLOWED_ORIGINS: list[str] = ["http://localhost:4321", "http://127.0.0.1:4321"]
    FRONTEND_URL: str = "http://localhost:4321"
    SESSION_COOKIE_NAME: str = "blog_session"
    SESSION_COOKIE_SECURE: bool = True
    SESSION_TTL: int = 2592000

    # GitHub 仅作为身份提供方，不申请仓库权限
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_CALLBACK_URL: str = "http://localhost:8000/api/auth/github/callback"
    BLOG_AUTHOR_GITHUB_ID: int

    # PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://blog:blog@localhost:5432/blog"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # OSS Data Source (AI 专用)
    # 指向存储 posts/{id}.json 的基础路径，需以斜杠结尾
    BLOG_POSTS_BASE_URL: str = "https://static.your-blog.com/_posts/"

    LLM_API_KEY: str
    LLM_API_BASE: str = "https://api.deepseek.com"
    LLM_API_MODEL: str = "deepseek-v4-flash"
    LLM_MAX_CONCURRENCY: int = Field(default=200, ge=1)

    # Web Push
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_SUBJECT: str = "mailto:admin@example.com"


settings = Settings()  # type: ignore
