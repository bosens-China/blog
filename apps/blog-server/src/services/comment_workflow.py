import asyncio
import logging
import secrets
from contextlib import suppress
from datetime import datetime, timezone

from sqlalchemy import select

from src.core.config import settings
from src.core.database import async_session
from src.models import Comment
from src.services.moderation_service import moderation_service
from src.services.push_service import send_comment_notifications
from src.services.redis_service import redis_service

logger = logging.getLogger(__name__)
LOCK_KEY = "comments:moderation:hourly"


async def moderate_pending_comments() -> int:
    lock_token = secrets.token_urlsafe(16)
    acquired = await redis_service.redis.set(
        LOCK_KEY,
        lock_token,
        nx=True,
        ex=settings.COMMENT_MODERATION_INTERVAL_SECONDS,
    )
    if not acquired:
        return 0

    processed = 0
    try:
        async with async_session() as db:
            result = await db.execute(
                select(Comment.id)
                .where(Comment.status == "pending")
                .order_by(Comment.created_at.asc())
                .limit(100)
            )
            comment_ids = list(result.scalars())

        for comment_id in comment_ids:
            try:
                async with async_session() as db:
                    comment = await db.get(Comment, comment_id)
                    if comment is None or comment.status != "pending":
                        continue
                    moderation = await moderation_service.check_comment(comment.body)
                    comment.status = "approved" if moderation.allowed else "rejected"
                    comment.moderation_category = moderation.category
                    comment.moderation_reason = moderation.reason
                    comment.moderated_at = datetime.now(timezone.utc)
                    await db.commit()
                processed += 1
                if moderation.allowed:
                    await send_comment_notifications(comment_id)
            except Exception:
                logger.exception("评论 %s 审核失败，将在下次任务重试", comment_id)
    finally:
        if await redis_service.redis.get(LOCK_KEY) == lock_token:
            await redis_service.redis.delete(LOCK_KEY)
    return processed


async def comment_moderation_loop() -> None:
    while True:
        await asyncio.sleep(settings.COMMENT_MODERATION_INTERVAL_SECONDS)
        try:
            await moderate_pending_comments()
        except Exception:
            logger.exception("评论定时审核任务异常")


async def stop_moderation_task(task: asyncio.Task[None]) -> None:
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task
