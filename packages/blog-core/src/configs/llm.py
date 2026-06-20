from pydantic import Field, ValidationInfo, field_validator
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
    MAX_LLM_CONCURRENCY: int = Field(
        default=100,
        description="LLM 调用的最大并发数（如专栏描述批量生成），防止瞬时打满接口。",
    )

    @field_validator("OPENAI_BASE_URL", "OPENAI_MODEL", mode="before")
    @classmethod
    def set_default_if_empty(cls, v: str | None, info: ValidationInfo) -> str:
        """如果环境变量为空字符串，则使用默认值"""
        if not v or not v.strip():
            field_name = info.field_name
            if field_name and field_name in cls.model_fields:
                # 获取字段的默认值
                field = cls.model_fields[field_name]
                return str(field.default)
        return v or ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


llm_settings = LLMConfig()
