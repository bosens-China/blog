from pydantic import Field
from pydantic_settings import BaseSettings


class LLMConfig(BaseSettings):
    """大模型相关配置"""

    OPENAI_API_KEY: str | None = Field(default=None, description="OpenAI API 密钥。")
    OPENAI_BASE_URL: str = Field(
        default="https://api.deepseek.com",
        description="API 基础地址。",
    )
    OPENAI_MODEL: str = Field(
        default="deepseek-chat",
        description="使用的模型名称。",
    )
    LLM_CACHE_ENABLED: bool = Field(default=True, description="是否启用 LLM 缓存。")

    # --- 并发控制 ---
    MAX_ARTICLE_CONCURRENCY: int = Field(default=5, description="同时处理的文章数量限制。")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


llm_settings = LLMConfig()
