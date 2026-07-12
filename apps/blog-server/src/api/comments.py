from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import or_, select, true
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.dependencies import (
    get_current_user,
    get_optional_user,
    verify_request_origin,
)
from src.core.config import settings
from src.core.database import get_db
from src.models import Comment, User
from src.services.push_service import send_comment_notifications
from src.services.rate_limiter import rate_limiter

router = APIRouter(prefix="/posts", tags=["comments"])


class CommentCreate(BaseModel):
    body: str = Field(max_length=settings.MAX_COMMENT_LENGTH)
    reply_to_comment_id: int | None = None

    @field_validator("body")
    @classmethod
    def validate_body(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("评论不能为空")
        return value


class CommentUserResponse(BaseModel):
    id: int
    login: str
    avatar_url: str | None
    profile_url: str | None


class CommentReplyToResponse(BaseModel):
    id: int
    login: str


class CommentResponse(BaseModel):
    id: int
    post_id: int
    body: str
    created_at: datetime
    updated_at: datetime
    user: CommentUserResponse
    is_author: bool
    is_me: bool
    status: str
    reply_to: CommentReplyToResponse | None = None
    replies: list["CommentResponse"] = Field(default_factory=list)


def _comment_response(
    comment: Comment,
    current_user: User | None,
    replies: list[CommentResponse] | None = None,
) -> CommentResponse:
    user = comment.user
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        body=comment.body,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        user=CommentUserResponse(
            id=user.id,
            login=user.login,
            avatar_url=user.avatar_url,
            profile_url=user.profile_url,
        ),
        is_author=user.provider == "github"
        and user.provider_user_id == str(settings.BLOG_AUTHOR_GITHUB_ID),
        is_me=current_user is not None and user.id == current_user.id,
        status=comment.status,
        reply_to=CommentReplyToResponse(
            id=comment.reply_to.id, login=comment.reply_to.user.login
        )
        if comment.reply_to is not None
        else None,
        replies=replies or [],
    )


@router.get("/{post_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    post_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> list[CommentResponse]:
    is_author = current_user is not None and (
        current_user.provider == "github"
        and current_user.provider_user_id == str(settings.BLOG_AUTHOR_GITHUB_ID)
    )
    visibility = (
        Comment.status == "approved"
        if current_user is None
        else or_(Comment.status == "approved", Comment.user_id == current_user.id)
    )
    roots_result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(
            Comment.post_id == post_id,
            Comment.root_id.is_(None),
            true() if is_author else visibility,
        )
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    roots = list(roots_result.scalars())
    if not roots:
        return []

    replies_result = await db.execute(
        select(Comment)
        .options(
            selectinload(Comment.user),
            selectinload(Comment.reply_to).selectinload(Comment.user),
        )
        .where(Comment.root_id.in_([comment.id for comment in roots]))
        .where(true() if is_author else visibility)
        .order_by(Comment.created_at.asc())
    )
    replies_by_root: dict[int, list[CommentResponse]] = {
        comment.id: [] for comment in roots
    }
    for reply in replies_result.scalars():
        if reply.root_id is not None:
            replies_by_root[reply.root_id].append(
                _comment_response(reply, current_user)
            )

    return [
        _comment_response(comment, current_user, replies_by_root[comment.id])
        for comment in roots
    ]


@router.post(
    "/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_request_origin)],
)
async def create_comment(
    post_id: int,
    body: CommentCreate,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommentResponse:
    reply_target: Comment | None = None
    root_id: int | None = None
    if body.reply_to_comment_id is not None:
        target_result = await db.execute(
            select(Comment)
            .options(selectinload(Comment.user))
            .where(Comment.id == body.reply_to_comment_id)
        )
        reply_target = target_result.scalar_one_or_none()
        if reply_target is None or reply_target.post_id != post_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "回复的评论不存在")
        root_id = reply_target.root_id or reply_target.id

    await rate_limiter.check_and_record_comment(user.id)
    is_author = user.provider == "github" and user.provider_user_id == str(
        settings.BLOG_AUTHOR_GITHUB_ID
    )

    comment = Comment(
        post_id=post_id,
        user_id=user.id,
        root_id=root_id,
        reply_to_comment_id=body.reply_to_comment_id,
        body=body.body,
        status="approved" if is_author else "pending",
        moderation_category="author" if is_author else None,
        moderation_reason="作者免审" if is_author else None,
        moderated_at=datetime.now().astimezone() if is_author else None,
        user=user,
        reply_to=reply_target,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment, ["created_at", "updated_at"])
    if is_author:
        background_tasks.add_task(send_comment_notifications, comment.id)
    return _comment_response(comment, user)
