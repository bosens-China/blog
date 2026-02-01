FROM python:3.12-slim-bookworm AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

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
FROM python:3.12-slim-bookworm

WORKDIR /app

# 复制构建好的虚拟环境
COPY --from=builder /app/.venv /app/.venv

# 复制源代码
COPY apps/blog-server/src ./src

# 设置环境变量
ENV PATH="/app/.venv/bin:$PATH"
# 确保 src 目录在 python path 中
ENV PYTHONPATH="/app"

# 暴露端口
EXPOSE 8000

# 启动服务
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]