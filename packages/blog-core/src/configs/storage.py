from pydantic import Field
from pydantic_settings import BaseSettings


class StorageConfig(BaseSettings):
    """存储与部署配置 (DogeCloud)"""

    # --- 多吉云 (DogeCloud) OSS 配置 ---
    DOGECLOUD_ACCESS_KEY: str | None = Field(default=None, description="多吉云 AccessKey。")
    DOGECLOUD_SECRET_KEY: str | None = Field(default=None, description="多吉云 SecretKey。")

    # 图床配置
    DOGECLOUD_IMAGE_BUCKET: str | None = Field(default=None, description="图床存储空间名称。")
    DOGECLOUD_IMAGE_DOMAIN: str | None = Field(default=None, description="图床自定义域名。")

    # 静态网站配置
    DOGECLOUD_STATIC_BUCKET: str | None = Field(default=None, description="静态网站存储空间名称。")
    DOGECLOUD_STATIC_DOMAIN: str | None = Field(default=None, description="静态网站自定义域名。")

    # --- 并发控制 ---
    MAX_IMAGE_CONCURRENCY: int = Field(default=10, description="并行上传/处理的并发数。")

    # 建立到图床 S3 端点的连接最长等待时间，避免网络不可达时阻塞构建。
    IMAGE_UPLOAD_CONNECT_TIMEOUT_SECONDS: float = Field(default=10.0, description="图床上传连接超时秒数。")
    # 单次上传请求的最长读取等待时间；配合重试次数将整次上传控制在约三分钟内。
    IMAGE_UPLOAD_READ_TIMEOUT_SECONDS: float = Field(default=75.0, description="图床上传单次读取超时秒数。")
    # 单个对象的总尝试次数，包含首次上传，避免第三方存储持续重试。
    IMAGE_UPLOAD_MAX_ATTEMPTS: int = Field(default=2, description="图床上传单个请求最多总尝试次数。")

    # 小图压缩收益有限，低于此大小时保持原文件直接上传。
    IMAGE_COMPRESSION_MIN_BYTES: int = Field(default=512 * 1024, description="触发图片压缩的最小文件大小。")
    # 静态图转码时保留的最长边，覆盖正文图片当前最高 2400px 的响应式输出。
    IMAGE_COMPRESSION_MAX_DIMENSION: int = Field(default=2560, description="压缩图片的最长边像素。")
    # 非透明静态图转为 WebP 时的视觉质量；透明图改用无损 WebP。
    IMAGE_COMPRESSION_WEBP_QUALITY: int = Field(default=92, description="静态图片 WebP 压缩质量。")
    # 只有达到该体积收益时才替换原图，避免微小收益换来不必要的有损转码。
    IMAGE_COMPRESSION_MIN_SAVINGS_RATIO: float = Field(default=0.1, description="替换压缩图所需的最小体积节省比例。")
    # 大动图转码成本高且容易阻塞 CI，超过该大小时直接保留上游原始地址。
    IMAGE_MAX_ANIMATED_UPLOAD_BYTES: int = Field(default=10 * 1024 * 1024, description="允许转存的动图最大文件大小。")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


storage_settings = StorageConfig()
