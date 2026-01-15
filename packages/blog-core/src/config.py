from configs.base import BaseConfig
from configs.llm import LLMConfig


class Settings(BaseConfig, LLMConfig):
    """
    主应用配置聚合类
    包含：基础环境、GitHub、路径、LLM 配置
    不包含：存储/部署配置 (见 configs/storage.py)
    """

    class Config(BaseConfig.Config, LLMConfig.Config):
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
