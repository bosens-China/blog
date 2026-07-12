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
MAX_BATCH_CHARS = 100_000


def _split_batches(
    comments: list[tuple[int, str]],
) -> list[list[tuple[int, str]]]:
    batches: list[list[tuple[int, str]]] = []
    batch: list[tuple[int, str]] = []
    batch_chars = 0
    for comment in comments:
        if batch and batch_chars + len(comment[1]) > MAX_BATCH_CHARS:
            batches.append(batch)
            batch = []
            batch_chars = 0
        batch.append(comment)
        batch_chars += len(comment[1])
    if batch:
        batches.append(batch)
    return batches


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
                select(Comment.id, Comment.body)
                .where(Comment.status == "pending")
                .order_by(Comment.created_at.asc())
            )
            comments = [(row.id, row.body) for row in result]
        if not comments:
            return 0

        for batch in _split_batches(comments):
            try:
                moderations = await moderation_service.check_comments(batch)
                approved_ids: list[int] = []
                async with async_session() as db:
                    moderation_by_id = {
                        moderation.id: moderation for moderation in moderations
                    }
                    pending_result = await db.execute(
                        select(Comment).where(
                            Comment.id.in_(moderation_by_id),
                            Comment.status == "pending",
                        )
                    )
                    for comment in pending_result.scalars():
                        moderation = moderation_by_id[comment.id]
                        comment.status = (
                            "approved" if moderation.allowed else "rejected"
                        )
                        comment.moderation_category = moderation.category
                        comment.moderation_reason = moderation.reason
                        comment.moderated_at = datetime.now(timezone.utc)
                        if moderation.allowed:
                            approved_ids.append(comment.id)
                    await db.commit()
                processed += len(moderations)
                for comment_id in approved_ids:
                    await send_comment_notifications(comment_id)
            except Exception:
                logger.exception("评论批次审核失败，将在下次任务重试")
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


if __name__ == "__main__":
    assert _split_batches([]) == []
    assert [
        len(batch) for batch in _split_batches([(1, "a" * 60_000), (2, "b" * 50_000)])
    ] == [1, 1]
