import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user, verify_request_origin
from src.core.config import settings
from src.core.database import get_db
from src.models import User
from src.services.github_auth_service import github_auth_service
from src.services.redis_service import redis_service

router = APIRouter(prefix="/auth", tags=["auth"])
OAUTH_STATE_COOKIE = "github_oauth_state"
OAUTH_RETURN_TO_COOKIE = "github_oauth_return_to"


class CurrentUserResponse(BaseModel):
    id: int
    login: str
    avatar_url: str | None
    profile_url: str | None
    is_author: bool


def _user_response(user: User) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=user.id,
        login=user.login,
        avatar_url=user.avatar_url,
        profile_url=user.profile_url,
        is_author=user.provider == "github"
        and user.provider_user_id == str(settings.BLOG_AUTHOR_GITHUB_ID),
    )


def _safe_return_to(value: str) -> str:
    return value if value.startswith("/") and not value.startswith("//") else "/"


@router.get("/github/login")
async def github_login(return_to: str = "/") -> RedirectResponse:
    state = secrets.token_urlsafe(32)
    await redis_service.save_oauth_state(state)
    response = RedirectResponse(github_auth_service.get_authorize_url(state))
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite="lax",
        path="/api/auth/github/callback",
    )
    response.set_cookie(
        OAUTH_RETURN_TO_COOKIE,
        _safe_return_to(return_to),
        max_age=600,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite="lax",
        path="/api/auth/github/callback",
    )
    return response


@router.get("/github/callback")
async def github_callback(
    request: Request,
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    cookie_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if (
        not cookie_state
        or not secrets.compare_digest(cookie_state, state)
        or not await redis_service.consume_oauth_state(state)
    ):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "登录状态已失效，请重新登录")

    user = await github_auth_service.authenticate(code, db)
    session_token = secrets.token_urlsafe(32)
    await redis_service.save_session(session_token, user.id)

    return_to = _safe_return_to(request.cookies.get(OAUTH_RETURN_TO_COOKIE, "/"))
    response = RedirectResponse(f"{settings.FRONTEND_URL.rstrip('/')}{return_to}")
    response.delete_cookie(OAUTH_STATE_COOKIE, path="/api/auth/github/callback")
    response.delete_cookie(OAUTH_RETURN_TO_COOKIE, path="/api/auth/github/callback")
    response.set_cookie(
        settings.SESSION_COOKIE_NAME,
        session_token,
        max_age=settings.SESSION_TTL,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite="lax",
        path="/",
    )
    return response


@router.get("/me", response_model=CurrentUserResponse)
async def me(user: User = Depends(get_current_user)) -> CurrentUserResponse:
    return _user_response(user)


@router.post("/logout", dependencies=[Depends(verify_request_origin)])
async def logout(request: Request) -> Response:
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if token:
        await redis_service.delete_session(token)
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(settings.SESSION_COOKIE_NAME, path="/")
    return response


if __name__ == "__main__":
    assert _safe_return_to("/posts/1/?tab=comments") == "/posts/1/?tab=comments"
    assert _safe_return_to("//example.com") == "/"
    assert _safe_return_to("https://example.com") == "/"
