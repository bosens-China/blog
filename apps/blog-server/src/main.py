import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.auth import router as auth_router
from src.api.chat import router as chat_router
from src.api.comments import router as comments_router
from src.api.push import router as push_router
from src.core.config import settings
from src.core.database import close_database, database_is_healthy
from src.services.comment_workflow import (
    comment_moderation_loop,
    stop_moderation_task,
)
from src.services.redis_service import redis_service


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    moderation_task = asyncio.create_task(comment_moderation_loop())
    yield
    await stop_moderation_task(moderation_task)
    await redis_service.close()
    await close_database()


app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api", tags=["ai"])
app.include_router(comments_router, prefix="/api")
app.include_router(push_router, prefix="/api")


@app.get("/health")
async def health_check() -> JSONResponse:
    database_ok = await database_is_healthy()
    redis_ok = await redis_service.is_healthy()
    healthy = database_ok and redis_ok
    return JSONResponse(
        status_code=status.HTTP_200_OK
        if healthy
        else status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "ok" if healthy else "degraded",
            "services": {
                "auth": database_ok and redis_ok,
                "comments": database_ok and redis_ok,
                "ai": database_ok and redis_ok,
            },
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
