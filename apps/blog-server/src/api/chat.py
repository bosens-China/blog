import json
import logging
from typing import Any
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from src.core.config import settings
from src.services.llm_service import llm_service
from src.services.rate_limiter import rate_limiter

router = APIRouter()
logger = logging.getLogger(__name__)


def _allowed_hosts() -> set[str]:
    """从 ALLOWED_ORIGINS 提取 host（含端口），用于按域名边界比对来源"""
    return {urlparse(o).netloc for o in settings.ALLOWED_ORIGINS if o}


async def verify_request(request: Request):
    """
    基础安全校验：检查 Origin/Referer
    """
    if settings.DEBUG:
        return

    origin = request.headers.get("origin")
    referer = request.headers.get("referer")
    allowed_hosts = _allowed_hosts()

    # 按域名边界比对，避免 startswith 被 blog.example.com.attacker.com 之类绕过
    is_valid = False
    if origin and origin in settings.ALLOWED_ORIGINS:
        is_valid = True
    elif referer and urlparse(referer).netloc in allowed_hosts:
        is_valid = True

    if not is_valid:
        logger.warning(f"未授权的访问尝试，来源 Origin: {origin}, Referer: {referer}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="未授权的来源 (Unauthorized origin)",
        )


class ChatRequest(BaseModel):
    post_id: int
    # session_id 仅用于会话分组，限定字符集与长度，防止注入 Redis key 或制造海量 key
    session_id: str = Field(pattern=r"^[A-Za-z0-9_-]{8,64}$")
    message: str = Field(min_length=1, max_length=settings.MAX_MESSAGE_LENGTH)


@router.get("/limit-status")
async def get_limit_status(request: Request) -> dict[str, Any]:
    ip = await rate_limiter.get_client_ip(request)
    try:
        return await rate_limiter.get_limit_status(ip)
    except Exception as e:
        # Redis 异常时不应阻断前端展示，返回一个安全的非阻塞默认值
        logger.error(f"获取限流状态失败: {e}")
        return {
            "ip": ip,
            "request_count": 0,
            "remaining_wait_seconds": 0,
            "is_blocked": False,
            "next_level_wait": 0,
        }


@router.post("/chat")
async def chat(request: Request, body: ChatRequest, _=Depends(verify_request)):
    """
    流式对话接口
    """
    try:
        await rate_limiter.check_and_record(request)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"速率限制检查失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="服务暂时不可用"
        )

    async def event_generator():
        try:
            async for chunk in llm_service.chat_stream(
                session_id=body.session_id,
                post_id=str(body.post_id),
                message=body.message,
            ):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except Exception as e:
            logger.error(f"流式响应错误: {e}")
            # 返回具体的错误信息，以便前端展示
            error_msg = str(e) if str(e) else "AI 服务响应异常"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
