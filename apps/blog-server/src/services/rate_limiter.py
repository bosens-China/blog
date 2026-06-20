import ipaddress
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, Request, status

from src.core.config import settings
from src.services.redis_service import redis_service

# 分层限流的原子脚本：
#   KEYS[1] 突发节流 key（rl:burst:{ip}）
#   KEYS[2] 单 IP 配额 key（rl:quota:{ip}）
#   KEYS[3] 全局每日计数 key（rl:global:{date}）
#   ARGV: burst_interval, free_tier, window, global_cap, global_ttl
# 必须在一个脚本里「先判全部条件、再统一消费」，否则会出现先扣全局后被配额拒绝的错扣，
# 以及并发下读到旧计数全部放行的竞态。
CHECK_AND_RECORD_SCRIPT = """
local burst_key = KEYS[1]
local quota_key = KEYS[2]
local global_key = KEYS[3]

local burst_interval = tonumber(ARGV[1])
local free_tier = tonumber(ARGV[2])
local window = tonumber(ARGV[3])
local global_cap = tonumber(ARGV[4])
local global_ttl = tonumber(ARGV[5])

-- 1. 突发节流：两次提问的最小间隔
if burst_interval > 0 and redis.call("EXISTS", burst_key) == 1 then
  local pttl = redis.call("PTTL", burst_key)
  local wait = 1
  if pttl > 0 then wait = math.ceil(pttl / 1000) end
  return {1, "burst", wait, 0}
end

-- 2. 全局每日上限（兜底总成本）
local global_count = tonumber(redis.call("GET", global_key)) or 0
if global_cap > 0 and global_count >= global_cap then
  local ttl = redis.call("TTL", global_key)
  if ttl < 0 then ttl = 0 end
  return {1, "global", ttl, 0}
end

-- 3. 单 IP 滚动窗口配额
local quota_count = tonumber(redis.call("GET", quota_key)) or 0
if quota_count >= free_tier then
  local ttl = redis.call("TTL", quota_key)
  if ttl < 0 then ttl = window end
  return {1, "quota", ttl, quota_count}
end

-- 全部通过 -> 原子消费
if burst_interval > 0 then
  redis.call("SET", burst_key, 1, "EX", burst_interval)
end
local new_quota = redis.call("INCR", quota_key)
if new_quota == 1 then
  redis.call("EXPIRE", quota_key, window)
end
local new_global = redis.call("INCR", global_key)
if new_global == 1 then
  redis.call("EXPIRE", global_key, global_ttl)
end

return {0, "ok", 0, new_quota}
"""

# 全局计数 key 按日期区分，TTL 仅用于自动清理（实际「每日重置」由 key 中的日期决定）
GLOBAL_KEY_TTL = 172800  # 48 小时

_BLOCK_MESSAGES = {
    "burst": "操作太快了，请稍候再试。",
    "global": "今日 AI 提问额度已用完，请明天再来～",
    "quota": "您的提问次数暂时用完了，请稍后再试。",
}


class RateLimiter:
    def __init__(self):
        # 复用 redis_service 的连接，避免重复连接池
        self.redis = redis_service.redis
        # 类型用 Any：register_script 返回的 AsyncScript 未在公开路径导出
        self._script: Any = None

    @property
    def script(self) -> Any:
        # register_script 走 EVALSHA + 自动回退，避免每次请求重传整段脚本
        if self._script is None:
            self._script = self.redis.register_script(CHECK_AND_RECORD_SCRIPT)
        return self._script

    def _today_str(self) -> str:
        """当前日期字符串 (UTC+8)，用作全局每日计数 key"""
        tz = timezone(timedelta(hours=8))
        return datetime.now(tz).strftime("%Y-%m-%d")

    async def get_client_ip(self, request: Request) -> str:
        """
        解析真实客户端 IP 并做限流分组。

        部署拓扑：客户端 -> Caddy -> 本服务（服务无对外端口，仅内网可达）。
        - 优先读 Caddy 用 `header_up X-Real-IP {remote_host}` 覆写的头（客户端无法伪造）；
        - 退化时取 X-Forwarded-For 的【最右】一段（Caddy 追加的真实对端，最左是客户端可伪造的）。
        IPv6 按 /64 前缀归并，避免用户换地址段绕过限流。
        """
        raw = request.headers.get("X-Real-IP", "").strip()
        if not raw:
            forwarded = request.headers.get("X-Forwarded-For", "")
            if forwarded:
                raw = forwarded.split(",")[-1].strip()
        if not raw and request.client:
            raw = request.client.host
        return self._group_ip(raw) or "unknown"

    @staticmethod
    def _group_ip(ip: str) -> str:
        if not ip:
            return ""
        try:
            addr = ipaddress.ip_address(ip)
        except ValueError:
            return ip
        if isinstance(addr, ipaddress.IPv6Address):
            # 每个用户通常持有一个 /64，按前缀归并才有意义
            net = ipaddress.ip_network(f"{ip}/64", strict=False)
            return str(net.network_address)
        return str(addr)

    def _unlimited(self, ip: str) -> dict[str, Any]:
        return {
            "ip": ip,
            "request_count": 0,
            "limit": settings.RATE_LIMIT_FREE_TIER,
            "remaining_wait_seconds": 0,
            "is_blocked": False,
            "next_level_wait": 0,
        }

    async def get_limit_status(self, ip: str) -> dict[str, Any]:
        """供前端轮询展示的限流状态（只读，不消费配额）"""
        if not settings.ENABLE_RATE_LIMIT:
            return self._unlimited(ip)

        quota_key = f"rl:quota:{ip}"
        global_key = f"rl:global:{self._today_str()}"

        quota_count = int(await self.redis.get(quota_key) or 0)
        quota_ttl = await self.redis.ttl(quota_key)
        global_count = int(await self.redis.get(global_key) or 0)

        is_blocked = False
        remaining = 0
        if quota_count >= settings.RATE_LIMIT_FREE_TIER:
            is_blocked = True
            remaining = (
                quota_ttl if quota_ttl and quota_ttl > 0 else settings.RATE_LIMIT_WINDOW
            )
        elif (
            settings.GLOBAL_DAILY_CAP > 0 and global_count >= settings.GLOBAL_DAILY_CAP
        ):
            is_blocked = True

        return {
            "ip": ip,
            "request_count": quota_count,
            "limit": settings.RATE_LIMIT_FREE_TIER,
            "remaining_wait_seconds": int(remaining),
            "is_blocked": is_blocked,
            "next_level_wait": 0,
        }

    async def check_and_record(self, request: Request) -> dict[str, Any]:
        """检查分层限流并在通过后原子消费配额；被限时抛 429。"""
        ip = await self.get_client_ip(request)

        if not settings.ENABLE_RATE_LIMIT:
            return self._unlimited(ip)

        result = await self.script(
            keys=[f"rl:burst:{ip}", f"rl:quota:{ip}", f"rl:global:{self._today_str()}"],
            args=[
                settings.RATE_LIMIT_BURST_INTERVAL,
                settings.RATE_LIMIT_FREE_TIER,
                settings.RATE_LIMIT_WINDOW,
                settings.GLOBAL_DAILY_CAP,
                GLOBAL_KEY_TTL,
            ],
        )

        # decode_responses=True，脚本返回的字符串已是 str
        is_blocked = int(result[0])
        reason = str(result[1])
        wait = int(result[2])
        count = int(result[3])

        if is_blocked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": _BLOCK_MESSAGES.get(
                        reason, "请求过于频繁，请稍后再试。"
                    ),
                    "reason": reason,
                    "wait_seconds": wait,
                },
            )

        return {
            "ip": ip,
            "request_count": count,
            "limit": settings.RATE_LIMIT_FREE_TIER,
            "remaining_wait_seconds": 0,
            "is_blocked": False,
            "next_level_wait": 0,
        }


rate_limiter = RateLimiter()
