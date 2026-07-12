from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status
from pydantic import BaseModel, ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.models import User


class GitHubProfile(BaseModel):
    id: int
    login: str
    avatar_url: str | None = None
    html_url: str | None = None


class GitHubAuthService:
    authorize_url = "https://github.com/login/oauth/authorize"
    token_url = "https://github.com/login/oauth/access_token"
    user_url = "https://api.github.com/user"

    def get_authorize_url(self, state: str) -> str:
        return f"{self.authorize_url}?{urlencode({'client_id': settings.GITHUB_CLIENT_ID, 'redirect_uri': settings.GITHUB_OAUTH_CALLBACK_URL, 'state': state})}"

    async def authenticate(self, code: str, db: AsyncSession) -> User:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                token_response = await client.post(
                    self.token_url,
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                        "code": code,
                        "redirect_uri": settings.GITHUB_OAUTH_CALLBACK_URL,
                    },
                )
                token_response.raise_for_status()
                access_token = token_response.json().get("access_token")
                if not access_token:
                    raise ValueError("GitHub 未返回 access token")

                profile_response = await client.get(
                    self.user_url,
                    headers={
                        "Accept": "application/vnd.github+json",
                        "Authorization": f"Bearer {access_token}",
                    },
                )
                profile_response.raise_for_status()
                profile = GitHubProfile.model_validate(profile_response.json())
        except (httpx.HTTPError, ValidationError, ValueError) as error:
            raise HTTPException(
                status.HTTP_502_BAD_GATEWAY, "GitHub 登录失败，请稍后重试"
            ) from error

        result = await db.execute(
            select(User).where(
                User.provider == "github",
                User.provider_user_id == str(profile.id),
            )
        )
        user = result.scalar_one_or_none()
        if user is None:
            user = User(
                provider="github",
                provider_user_id=str(profile.id),
                login=profile.login,
                avatar_url=profile.avatar_url,
                profile_url=profile.html_url,
            )
            db.add(user)
        else:
            user.login = profile.login
            user.avatar_url = profile.avatar_url
            user.profile_url = profile.html_url

        await db.commit()
        await db.refresh(user)
        return user


github_auth_service = GitHubAuthService()
