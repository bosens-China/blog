import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from src.api.dependencies import get_current_user, verify_request_origin
from src.core.config import settings
from src.models import User
from src.services.llm_service import llm_service
from src.services.rate_limiter import rate_limiter

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    post_id: int
    message: str = Field(min_length=1, max_length=settings.MAX_MESSAGE_LENGTH)


@router.get("/limit-status")
async def get_limit_status(user: User = Depends(get_current_user)) -> dict[str, Any]:
    try:
        return await rate_limiter.get_limit_status(user.id)
    except Exception as error:
        logger.exception("获取 AI 限额失败")
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "服务暂时不可用"
        ) from error


@router.post("/chat", dependencies=[Depends(verify_request_origin)])
async def chat(
    body: ChatRequest, user: User = Depends(get_current_user)
) -> StreamingResponse:
    try:
        await rate_limiter.check_and_record(user.id)
    except HTTPException:
        raise
    except Exception as error:
        logger.exception("AI 限额检查失败")
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "服务暂时不可用"
        ) from error

    async def event_generator():
        try:
            async for chunk in llm_service.chat_stream(
                user_id=user.id,
                post_id=str(body.post_id),
                message=body.message,
            ):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except Exception:
            logger.exception("流式响应错误")
            yield f"data: {json.dumps({'error': 'AI 服务响应异常'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
