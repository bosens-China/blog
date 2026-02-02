import time
import json
from datetime import datetime, timezone, timedelta
from typing import Any
from redis.asyncio import Redis
from fastapi import HTTPException, Request, status

from src.core.config import settings

# 阶梯式限流配置
FREE_TIER_COUNT = 5
FIRST_COOLDOWN = 1800  # 30 分钟
SUBSEQUENT_COOLDOWN = 3600  # 1 小时

class RateLimiter:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)

    def _get_today_str(self) -> str:
        """获取当前日期字符串 (UTC+8)"""
        tz = timezone(timedelta(hours=8))
        return datetime.now(tz).strftime("%Y-%m-%d")

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

        today = self._get_today_str()
        key = f"limit:v1:{ip}:{today}"
        
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

        # 计算冷却时间
        required_wait = 0
        if current_count < FREE_TIER_COUNT:
            required_wait = 0
        elif current_count == FREE_TIER_COUNT:
            required_wait = FIRST_COOLDOWN
        else: # > 5
            required_wait = SUBSEQUENT_COOLDOWN
        
        # 计算剩余等待时间
        now = time.time()
        time_passed = now - last_request_time
        remaining_wait = max(0, required_wait - time_passed) if required_wait > 0 else 0
        
        is_blocked = remaining_wait > 0

        # 计算下一次的等待时间提示
        next_wait = 0
        if current_count + 1 < FREE_TIER_COUNT:
            next_wait = 0
        elif current_count + 1 == FREE_TIER_COUNT:
            next_wait = FIRST_COOLDOWN
        else:
            next_wait = SUBSEQUENT_COOLDOWN

        return {
            "ip": ip,
            "request_count": current_count,
            "required_wait_seconds": required_wait,
            "remaining_wait_seconds": int(remaining_wait),
            "is_blocked": is_blocked,
            "next_level_wait": next_wait
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
            
        # 如果通过或者未开启限流，更新记录
        if not settings.ENABLE_RATE_LIMIT:
            return status_info

        today = self._get_today_str()
        key = f"limit:v1:{ip}:{today}"
        
        new_record = {
            "count": status_info["request_count"] + 1,
            "last_ts": time.time()
        }
        
        # 存入 Redis，设置 48 小时过期足够覆盖跨天需求，因为 Key 本身每天都会变
        await self.redis.set(key, json.dumps(new_record), ex=172800)
        
        return status_info

rate_limiter = RateLimiter()
