import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.core.config import settings
from src.services.llm_service import llm_service
from src.services.rate_limiter import rate_limiter

router = APIRouter()
logger = logging.getLogger(__name__)


async def verify_request(request: Request):
    """
    基础安全校验：检查 Origin/Referer
    """
    if settings.DEBUG:
        return

    origin = request.headers.get("origin")
    referer = request.headers.get("referer")

    # 检查 Origin 是否在允许列表中
    is_valid = False
    if origin and origin in settings.ALLOWED_ORIGINS:
        is_valid = True
    elif referer:
        for allowed in settings.ALLOWED_ORIGINS:
            if referer.startswith(allowed):
                is_valid = True
                break

    if not is_valid:
        logger.warning(f"未授权的访问尝试，来源 Origin: {origin}, Referer: {referer}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="未授权的来源 (Unauthorized origin)",
        )


class ChatRequest(BaseModel):
    post_id: str | int
    session_id: str
    message: str


@router.get("/limit-status")
async def get_limit_status(request: Request) -> dict[str, Any]:
    ip = await rate_limiter.get_client_ip(request)
    return await rate_limiter.get_limit_status(ip)


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
