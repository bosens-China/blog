import json
import time
from datetime import datetime, timezone, timedelta
from typing import Any, cast

from fastapi import HTTPException, Request, status
from redis.asyncio import Redis

from src.core.config import settings

# 阶梯式限流配置
FREE_TIER_COUNT = 5
FIRST_COOLDOWN = 1800  # 30 分钟
SUBSEQUENT_COOLDOWN = 3600  # 1 小时
RATE_LIMIT_KEY_TTL = 172800  # 48 小时，覆盖跨天场景

CHECK_AND_RECORD_SCRIPT = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local free_tier_count = tonumber(ARGV[2])
local first_cooldown = tonumber(ARGV[3])
local subsequent_cooldown = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local current_count = 0
local last_request_time = 0
local data = redis.call("GET", key)

if data then
  local ok, record = pcall(cjson.decode, data)
  if ok and record then
    current_count = tonumber(record["count"]) or 0
    last_request_time = tonumber(record["last_ts"]) or 0
  end
end

local required_wait = 0
if current_count < free_tier_count then
  required_wait = 0
elseif current_count == free_tier_count then
  required_wait = first_cooldown
else
  required_wait = subsequent_cooldown
end

local remaining_wait = 0
if required_wait > 0 then
  remaining_wait = math.max(0, required_wait - (now - last_request_time))
end

local next_wait = 0
if current_count + 1 < free_tier_count then
  next_wait = 0
elseif current_count + 1 == free_tier_count then
  next_wait = first_cooldown
else
  next_wait = subsequent_cooldown
end

local is_blocked = remaining_wait > 0
if not is_blocked then
  redis.call("SET", key, cjson.encode({
    count = current_count + 1,
    last_ts = now,
  }), "EX", ttl)
end

return {
  is_blocked and 1 or 0,
  current_count,
  required_wait,
  math.floor(remaining_wait),
  next_wait,
}
"""


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
                "next_level_wait": 0,
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
        else:  # > 5
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
            "next_level_wait": next_wait,
        }

    async def check_and_record(self, request: Request) -> dict[str, Any]:
        """
        检查限流并在通过后记录。

        这里必须用 Redis Lua 脚本保证“读取状态、判断冷却、递增计数”是原子的，
        避免并发请求同时读到旧计数后全部放行。
        """
        ip = await self.get_client_ip(request)

        if not settings.ENABLE_RATE_LIMIT:
            return await self.get_limit_status(ip)

        today = self._get_today_str()
        key = f"limit:v1:{ip}:{today}"
        result = await cast(Any, self.redis.eval)(
            CHECK_AND_RECORD_SCRIPT,
            1,
            key,
            time.time(),
            FREE_TIER_COUNT,
            FIRST_COOLDOWN,
            SUBSEQUENT_COOLDOWN,
            RATE_LIMIT_KEY_TTL,
        )

        is_blocked, request_count, required_wait, remaining_wait, next_wait = result
        status_info = {
            "ip": ip,
            "request_count": int(request_count),
            "required_wait_seconds": int(required_wait),
            "remaining_wait_seconds": int(remaining_wait),
            "is_blocked": bool(is_blocked),
            "next_level_wait": int(next_wait),
        }

        if status_info["is_blocked"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": "Too many requests. Please wait.",
                    "wait_seconds": status_info["remaining_wait_seconds"],
                },
            )

        return status_info


rate_limiter = RateLimiter()
