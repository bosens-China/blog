from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Blog AI Server"
    DEBUG: bool = False

    # Rate Limit
    ENABLE_RATE_LIMIT: bool = True
    # 每天请求次数重置时间 (秒), 默认 24 小时
    RATE_LIMIT_TTL: int = 86400

    # Security
    ALLOWED_ORIGINS: list[str] = ["http://localhost:4321", "http://127.0.0.1:4321"]
    SECURITY_TOKEN: str = "your-fallback-secret-token"

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
