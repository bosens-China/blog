import asyncio
import json
import logging
import re

from pywebpush import WebPushException, webpush
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from src.core.config import settings
from src.core.database import async_session
from src.models import Comment, PushSubscription, User

logger = logging.getLogger(__name__)
MENTION_PATTERN = re.compile(
    r"(?<![\w-])@([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)"
)


async def send_comment_notifications(comment_id: int) -> None:
    if not settings.VAPID_PRIVATE_KEY:
        return

    async with async_session() as db:
        result = await db.execute(
            select(Comment)
            .options(
                selectinload(Comment.user),
                selectinload(Comment.reply_to).selectinload(Comment.user),
            )
            .where(Comment.id == comment_id, Comment.status == "approved")
        )
        comment = result.scalar_one_or_none()
        if comment is None:
            return

        recipients: dict[int, str] = {}
        if comment.reply_to is not None:
            recipients[comment.reply_to.user_id] = "reply"

        mentioned_logins = {
            login.lower() for login in MENTION_PATTERN.findall(comment.body)
        }
        if mentioned_logins:
            mentioned_result = await db.execute(
                select(User)
                .join(Comment, Comment.user_id == User.id)
                .where(
                    Comment.post_id == comment.post_id,
                    func.lower(User.login).in_(mentioned_logins),
                )
                .distinct()
            )
            for mentioned_user in mentioned_result.scalars():
                recipients.setdefault(mentioned_user.id, "mention")

        recipients.pop(comment.user_id, None)
        if not recipients:
            return

        subscriptions_result = await db.execute(
            select(PushSubscription).where(
                PushSubscription.user_id.in_(recipients.keys())
            )
        )
        stale: list[PushSubscription] = []
        for subscription in subscriptions_result.scalars():
            reason = recipients[subscription.user_id]
            payload = json.dumps(
                {
                    "title": (
                        f"{comment.user.login} 回复了你"
                        if reason == "reply"
                        else f"{comment.user.login} 提到了你"
                    ),
                    "body": comment.body[:120],
                    "url": (
                        f"{settings.FRONTEND_URL.rstrip('/')}/posts/{comment.post_id}/"
                        f"#comment-{comment.id}"
                    ),
                    "tag": f"comment-{comment.id}",
                },
                ensure_ascii=False,
            )
            try:
                await asyncio.to_thread(
                    webpush,
                    subscription_info={
                        "endpoint": subscription.endpoint,
                        "keys": {
                            "p256dh": subscription.p256dh,
                            "auth": subscription.auth,
                        },
                    },
                    data=payload,
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": settings.VAPID_SUBJECT},
                    ttl=86400,
                )
            except WebPushException as error:
                if error.response is not None and error.response.status_code in {
                    404,
                    410,
                }:
                    stale.append(subscription)
                else:
                    logger.warning("Web Push 发送失败: %s", error)

        for subscription in stale:
            await db.delete(subscription)
        if stale:
            await db.commit()
