from config import settings
from langchain_openai import ChatOpenAI
from pydantic import SecretStr


class LLMService:
    def get_llm(self, temperature: float = 0.7):
        """
        获取 LLM 实例
        """
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY 未配置")
        return ChatOpenAI(
            api_key=SecretStr(settings.OPENAI_API_KEY),
            base_url=settings.OPENAI_BASE_URL,
            model=settings.OPENAI_MODEL,
            temperature=temperature,
        )
