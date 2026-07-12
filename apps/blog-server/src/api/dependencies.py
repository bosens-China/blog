import logging
from urllib.parse import urlparse

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import get_db
from src.models import User
from src.services.redis_service import redis_service

logger = logging.getLogger(__name__)


async def verify_request_origin(request: Request) -> None:
    """校验浏览器写请求来源，降低跨站请求风险。"""
    if settings.DEBUG:
        return

    origin = request.headers.get("origin")
    referer = request.headers.get("referer")
    allowed_hosts = {urlparse(item).netloc for item in settings.ALLOWED_ORIGINS}
    if origin in settings.ALLOWED_ORIGINS or (
        referer and urlparse(referer).netloc in allowed_hosts
    ):
        return

    logger.warning("拒绝未知来源请求，Origin=%s, Referer=%s", origin, referer)
    raise HTTPException(status.HTTP_403_FORBIDDEN, "未授权的来源")


async def get_optional_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User | None:
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        return None
    user_id = await redis_service.get_session_user_id(token)
    return await db.get(User, user_id) if user_id else None


async def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "请先使用 GitHub 登录")
    return user
