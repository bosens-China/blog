from config import settings
from langchain_openai import ChatOpenAI
from pydantic import SecretStr


class LLMService:
    # 类级缓存：按 temperature 复用 ChatOpenAI 实例，避免每次调用都新建客户端与连接池。
    # 各节点频繁 LLMService().get_llm(...)，共享同一份缓存即可复用。
    _clients: dict[float, ChatOpenAI] = {}

    def get_llm(self, temperature: float = 1.3) -> ChatOpenAI:
        """
        获取 LLM 实例（按 temperature 复用）
        """
        if not settings.BLOG_CORE_LLM_API_KEY:
            raise ValueError("BLOG_CORE_LLM_API_KEY 未配置")
        if temperature not in self._clients:
            self._clients[temperature] = ChatOpenAI(
                api_key=SecretStr(settings.BLOG_CORE_LLM_API_KEY),
                base_url=settings.BLOG_CORE_LLM_API_BASE,
                model=settings.BLOG_CORE_LLM_API_MODEL,
                temperature=temperature,
            )
        return self._clients[temperature]
