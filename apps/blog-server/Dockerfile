# pnpm 的原生可执行文件只用于构建阶段，运行镜像无需 Node.js。
FROM node:24.11.1-bookworm-slim@sha256:48abc13a19400ca3985071e287bd405a1d99306770eb81d61202fb6b65cf0b57 AS pnpm
RUN npm install --global pnpm@12.10.1

# Python 3.12.13 是 3.12 系列的 patch 版本，不是 Python 3.13；digest 用于固定 CI 构建输入。
FROM python:3.12.13-slim-bookworm@sha256:93ab4b7fa528b25124c97bcc755415e60eb671a86b4dbe0328df2fe2d1c1193d AS builder
COPY --from=pnpm /usr/local/lib/node_modules/pnpm/pnpm /usr/local/bin/pnpm

WORKDIR /app

# 1. 复制根目录的 workspace 配置和锁文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml pyproject.toml pylock.toml .python-version ./

# 2. 复制子项目的配置文件
COPY apps/blog-server/pyproject.toml ./apps/blog-server/
COPY packages/blog-core/pyproject.toml ./packages/blog-core/

# 3. 安装依赖
# 共享环境按根锁文件安装生产依赖；复制真实目录，避免运行镜像依赖构建缓存中的符号链接。
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts \
    && cp -aL .venv /opt/venv

# --- Runtime Stage ---
# 与 builder 阶段保持相同的 Python 3.12 patch 版本。
FROM python:3.12.13-slim-bookworm@sha256:93ab4b7fa528b25124c97bcc755415e60eb671a86b4dbe0328df2fe2d1c1193d

WORKDIR /app

# 复制构建好的虚拟环境
COPY --from=builder /opt/venv /app/.venv

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
CMD ["sh", "-c", "python -m alembic upgrade head && python -m uvicorn src.main:app --host 0.0.0.0 --port 8000"]
