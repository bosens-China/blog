from pydantic import Field
from pydantic_settings import BaseSettings


class StorageConfig(BaseSettings):
    """存储与部署配置 (DogeCloud)"""

    # --- 多吉云 (DogeCloud) OSS 配置 ---
    DOGECLOUD_ACCESS_KEY: str | None = Field(default=None, description="多吉云 AccessKey。")
    DOGECLOUD_SECRET_KEY: str | None = Field(default=None, description="多吉云 SecretKey。")

    # 图床配置
    DOGECLOUD_BUCKET: str | None = Field(default=None, description="图床存储空间名称。")
    DOGECLOUD_DOMAIN: str | None = Field(default=None, description="图床自定义域名。")

    # 静态网站配置
    DOGECLOUD_STATIC_BUCKET: str | None = Field(default=None, description="静态网站存储空间名称。")
    DOGECLOUD_STATIC_DOMAIN: str | None = Field(default=None, description="静态网站自定义域名。")

    # --- 并发控制 ---
    MAX_IMAGE_CONCURRENCY: int = Field(default=10, description="并行上传/处理的并发数。")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


storage_settings = StorageConfig()
