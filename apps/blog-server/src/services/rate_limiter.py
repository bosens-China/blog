import time
import json
from typing import Any
from redis.asyncio import Redis
from fastapi import HTTPException, Request, status

from src.core.config import settings

# 阶梯式限流配置
# 次数 (count) -> 需要等待的冷却时间 (seconds)
# 0-4 次: 0 等待 (前 5 次免费)
# 5 次: 30 分钟 (1800s)
# >5 次: 1 小时 (3600s)
COOLDOWN_MAP = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0,
    5: 1800,
}
MAX_COOLDOWN = 3600

class RateLimiter:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def get_client_ip(self, request: Request) -> str:
        # 优先获取 X-Forwarded-For (适配 Docker/Nginx/Proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0]
        return request.client.host if request.client else "unknown"

    async def get_limit_status(self, ip: str) -> dict[str, Any]:
        """
        获取当前 IP 的限流状态
        """
        if not settings.ENABLE_RATE_LIMIT:
            return {
                "ip": ip,
                "request_count": 0,
                "required_wait_seconds": 0,
                "remaining_wait_seconds": 0,
                "is_blocked": False,
                "next_level_wait": 0
            }

        key = f"limit:v1:{ip}"
        
        # 获取当前记录
        data = await self.redis.get(key)
        
        current_count = 0
        last_request_time = 0.0
        
        if data:
            try:
                record = json.loads(data)
                current_count = record.get("count", 0)
                last_request_time = record.get("last_ts", 0.0)
            except Exception:
                pass

        # 计算下一个级别的冷却时间
        required_wait = COOLDOWN_MAP.get(current_count, MAX_COOLDOWN)
        
        # 计算剩余等待时间
        now = time.time()
        time_passed = now - last_request_time
        remaining_wait = max(0, required_wait - time_passed)
        
        is_blocked = remaining_wait > 0

        return {
            "ip": ip,
            "request_count": current_count,
            "required_wait_seconds": required_wait,
            "remaining_wait_seconds": int(remaining_wait),
            "is_blocked": is_blocked,
            "next_level_wait": COOLDOWN_MAP.get(current_count + 1, MAX_COOLDOWN)
        }

    async def check_and_record(self, request: Request) -> dict[str, Any]:
        """
        检查限流并在通过后记录
        """
        ip = await self.get_client_ip(request)
        status_info = await self.get_limit_status(ip)
        
        if settings.ENABLE_RATE_LIMIT and status_info["is_blocked"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": "Too many requests. Please wait.",
                    "wait_seconds": status_info["remaining_wait_seconds"]
                }
            )
            
        # 如果通过或者未开启限流，更新记录 (未开启时也可以记录，或者干脆跳过)
        if not settings.ENABLE_RATE_LIMIT:
            return status_info

        key = f"limit:v1:{ip}"
        new_record = {
            "count": status_info["request_count"] + 1,
            "last_ts": time.time()
        }
        
        # 存入 Redis，设置 TTL (例如 24h 后重置)
        await self.redis.set(key, json.dumps(new_record), ex=settings.RATE_LIMIT_TTL)
        
        return status_info

rate_limiter = RateLimiter()
