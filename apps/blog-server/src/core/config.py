from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Blog AI Server"
    DEBUG: bool = False

    # Rate Limit（分层限流）
    ENABLE_RATE_LIMIT: bool = True
    # L2 单 IP 配额：每个滚动窗口内的免费提问次数
    RATE_LIMIT_FREE_TIER: int = 5
    # L2 配额窗口（秒），默认 1 小时 —— 即「每人每小时 N 次」
    RATE_LIMIT_WINDOW: int = 3600
    # L1 突发节流：两次提问的最小间隔（秒），0 表示关闭
    RATE_LIMIT_BURST_INTERVAL: int = 3
    # L3 全局熔断：全站每日提问总上限（兜底成本），0 表示关闭
    GLOBAL_DAILY_CAP: int = 2000

    # Chat 输入与上下文约束
    # 单条消息最大字符数
    MAX_MESSAGE_LENGTH: int = 10000
    # 注入给 LLM 的最近历史轮数（1 轮 = 用户 + 助手 2 条）
    MAX_HISTORY_ROUNDS: int = 10

    # Security
    ALLOWED_ORIGINS: list[str] = ["http://localhost:4321", "http://127.0.0.1:4321"]

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # OSS Data Source (AI 专用)
    # 指向存储 posts/{id}.json 的基础路径，需以斜杠结尾
    BLOG_POSTS_BASE_URL: str = "https://static.your-blog.com/_posts/"

    LLM_API_KEY: str
    LLM_API_BASE: str = "https://api.deepseek.com"
    LLM_API_MODEL: str = "deepseek-chat"

    class Config:
        env_file = ".env"


settings = Settings()  # type: ignore
