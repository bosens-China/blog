from datetime import datetime, time, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from src.core.config import settings
from src.services.redis_service import redis_service

CHECK_AND_RECORD_SCRIPT = """
local count = tonumber(redis.call("GET", KEYS[1])) or 0
local limit = tonumber(ARGV[1])
if count >= limit then
  return {1, count, redis.call("TTL", KEYS[1])}
end
local new_count = redis.call("INCR", KEYS[1])
if new_count == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2]))
end
return {0, new_count, redis.call("TTL", KEYS[1])}
"""


class RateLimiter:
    def __init__(self) -> None:
        self.redis = redis_service.redis
        self._script: Any = None

    @property
    def script(self) -> Any:
        if self._script is None:
            self._script = self.redis.register_script(CHECK_AND_RECORD_SCRIPT)
        return self._script

    def _day_and_ttl(self) -> tuple[str, int]:
        china_timezone = timezone(timedelta(hours=8))
        now = datetime.now(china_timezone)
        tomorrow = datetime.combine(
            now.date() + timedelta(days=1), time.min, china_timezone
        )
        return now.strftime("%Y-%m-%d"), max(1, int((tomorrow - now).total_seconds()))

    def _key(self, user_id: int, day: str) -> str:
        return f"rl:ai:{user_id}:{day}"

    def _comment_key(self, user_id: int, hour: str) -> str:
        return f"rl:comment:{user_id}:{hour}"

    def _status(self, user_id: int, count: int, ttl: int) -> dict[str, Any]:
        blocked = count >= settings.AI_DAILY_LIMIT_PER_USER
        return {
            "user_id": user_id,
            "request_count": count,
            "limit": settings.AI_DAILY_LIMIT_PER_USER,
            "remaining": max(0, settings.AI_DAILY_LIMIT_PER_USER - count),
            "remaining_wait_seconds": ttl if blocked else 0,
            "is_blocked": blocked,
            "next_level_wait": 0,
        }

    async def get_limit_status(self, user_id: int) -> dict[str, Any]:
        if not settings.ENABLE_AI_RATE_LIMIT:
            return self._status(user_id, 0, 0)
        day, default_ttl = self._day_and_ttl()
        key = self._key(user_id, day)
        count = int(await self.redis.get(key) or 0)
        ttl = await self.redis.ttl(key)
        return self._status(user_id, count, ttl if ttl > 0 else default_ttl)

    async def check_and_record(self, user_id: int) -> dict[str, Any]:
        if not settings.ENABLE_AI_RATE_LIMIT:
            return self._status(user_id, 0, 0)

        day, ttl = self._day_and_ttl()
        result = await self.script(
            keys=[self._key(user_id, day)],
            args=[settings.AI_DAILY_LIMIT_PER_USER, ttl],
        )
        blocked, count, remaining_ttl = map(int, result)
        if blocked:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": (
                        f"今天的 {settings.AI_DAILY_LIMIT_PER_USER} 次 AI 提问额度已用完，"
                        "请明天再来。"
                    ),
                    "reason": "daily_limit",
                    "wait_seconds": max(0, remaining_ttl),
                },
            )
        return self._status(user_id, count, remaining_ttl)

    async def check_and_record_comment(self, user_id: int) -> None:
        now = datetime.now(timezone(timedelta(hours=8)))
        ttl = max(1, 3600 - now.minute * 60 - now.second)
        result = await self.script(
            keys=[self._comment_key(user_id, now.strftime("%Y-%m-%d:%H"))],
            args=[settings.COMMENT_HOURLY_LIMIT_PER_USER, ttl],
        )
        blocked, _, remaining_ttl = map(int, result)
        if blocked:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": (
                        f"每小时最多发布 {settings.COMMENT_HOURLY_LIMIT_PER_USER} 条评论或回复"
                    ),
                    "reason": "comment_hourly_limit",
                    "wait_seconds": max(0, remaining_ttl),
                },
            )


rate_limiter = RateLimiter()
