# Python 3.12.13 是 3.12 系列的 patch 版本，不是 Python 3.13；digest 用于固定 CI 构建输入。
FROM python:3.12.13-slim-bookworm@sha256:93ab4b7fa528b25124c97bcc755415e60eb671a86b4dbe0328df2fe2d1c1193d AS builder
COPY --from=ghcr.io/astral-sh/uv:0.8.3@sha256:ef11ed817e6a5385c02cd49fdcc99c23d02426088252a8eace6b6e6a2a511f36 /uv /bin/uv

WORKDIR /app

# 1. 复制根目录的 workspace 配置和锁文件
COPY pyproject.toml uv.lock ./

# 2. 复制子项目的配置文件
COPY apps/blog-server/pyproject.toml ./apps/blog-server/

# 3. 安装依赖
# --frozen: 严格依照 lock 文件
# --no-dev: 不安装开发依赖
# --package blog-server: 只安装 blog-server 及其依赖
# 使用 cache mount 加速安装
ENV UV_COMPILE_BYTECODE=1
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --package blog-server

# --- Runtime Stage ---
# 与 builder 阶段保持相同的 Python 3.12 patch 版本。
FROM python:3.12.13-slim-bookworm@sha256:93ab4b7fa528b25124c97bcc755415e60eb671a86b4dbe0328df2fe2d1c1193d

WORKDIR /app

# 复制构建好的虚拟环境
COPY --from=builder /app/.venv /app/.venv

# 复制源代码
COPY apps/blog-server/src ./src
COPY apps/blog-server/alembic ./alembic
COPY apps/blog-server/alembic.ini ./alembic.ini

# 设置环境变量
ENV PATH="/app/.venv/bin:$PATH"
# 确保 src 目录在 python path 中
ENV PYTHONPATH="/app"

# 暴露端口
EXPOSE 8000

# 启动服务
CMD ["sh", "-c", "alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000"]
