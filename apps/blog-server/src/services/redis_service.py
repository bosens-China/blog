import json
from typing import Any
from redis.asyncio import Redis
from src.core.config import settings

class RedisService:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        # 会话上下文 (对话历史) 过期时间 (秒), 1 个月
        self.SESSION_TTL = 2592000 
        # 文章内容缓存过期时间 (秒), 10 分钟
        # 既能减少 OSS 请求，又能确保文章更新后 AI 最多 10 分钟就能感知
        self.POST_CONTENT_TTL = 600

    async def get_chat_history(self, session_id: str, post_id: str) -> list[dict[str, Any]]:
        """
        获取对话历史
        """
        key = f"chat:history:{session_id}:{post_id}"
        data = await self.redis.get(key)
        if data:
            try:
                return json.loads(data)
            except Exception:
                return []
        return []

    async def save_chat_history(self, session_id: str, post_id: str, history: list[dict[str, Any]]):
        """
        保存对话历史 (全量覆盖，简单粗暴)
        """
        key = f"chat:history:{session_id}:{post_id}"
        # 限制历史长度，比如只保留最近 20 条
        if len(history) > 20:
            history = history[-20:]
            
        await self.redis.set(key, json.dumps(history), ex=self.SESSION_TTL)

    async def get_post_context(self, post_id: str) -> str | None:
        """
        获取缓存的文章上下文
        Key 改为仅与 post_id 相关，实现所有用户共享同一份文章缓存
        """
        key = f"cache:post:{post_id}"
        return await self.redis.get(key)

    async def save_post_context(self, post_id: str, context: str):
        """
        保存文章上下文 (全局缓存 10 分钟)
        """
        key = f"cache:post:{post_id}"
        await self.redis.set(key, context, ex=self.POST_CONTENT_TTL)

redis_service = RedisService()
