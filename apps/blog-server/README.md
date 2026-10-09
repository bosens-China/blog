# Blog AI Server

这是博客系统的在线后端，负责 GitHub 登录和基于文章上下文的 AI 问答。

## 技术栈

- **框架**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **LLM 框架**: [LangChain](https://python.langchain.com/)
- **模型支持**: DeepSeek (通过 OpenAI 协议兼容接口)
- **数据库**: PostgreSQL + SQLAlchemy Async
- **缓存**: Redis（登录会话、对话历史和每日限额）
- **依赖管理**: [pnpm](https://pnpm.io/python)（与前端共用安装入口）

## 主要功能

- **流式对话 (SSE)**: 支持实时的 AI 响应输出。
- **GitHub 登录**: GitHub 仅作为身份提供方，不申请仓库权限。
- **短期记忆 (Short-term Memory)**: 按登录用户和文章保存对话历史。
- **文章上下文感知**: 自动关联当前博文内容，提供精准的问答支持。
- **每日限额**: 登录用户每天最多提问 10 次。
- **高性能**: 异步 IO 处理，轻量级存储。

## 快速开始

### 1. 环境准备

确保已安装 Node.js 与仓库固定版本的 pnpm。Python 3.12 可由 pnpm 自动安装。

```bash
# 在仓库根目录安装全部依赖
pnpm install --frozen-lockfile
```

### 2. 配置文件

在 `apps/blog-server` 创建 `.env` 文件（参考同目录 `.env.example`），并创建 GitHub OAuth App：

- Homepage URL：前端博客地址
- Authorization callback URL：`GITHUB_OAUTH_CALLBACK_URL`
- 本地开发将 `SESSION_COOKIE_SECURE` 设为 `false`

### 3. 运行服务

```bash
# 在 apps/blog-server 目录启动本地 PostgreSQL 和 Redis
docker compose -f docker-compose.dev.yml up -d

# 执行数据库迁移并启动服务
pnpm exec python -m alembic upgrade head
pnpm exec python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

服务默认运行在 `http://localhost:8000`。

## API 接口

- `GET /api/auth/github/login`: 发起 GitHub 登录。
- `GET /api/auth/github/callback`: GitHub OAuth 回调。
- `GET /api/auth/me`: 获取当前登录用户。
- `POST /api/auth/logout`: 退出登录。
- `POST /api/chat`: 流式对话接口。接收 `post_id`, `message`，需要登录。
  - **安全升级**: 后端通过 `post_id` 自主从 OSS 获取文章内容，不再接受前端传递的 context。
- `GET /api/limit-status`: 获取当前用户今日 AI 剩余额度，需要登录。
- `GET /health`: 检查 PostgreSQL、Redis 及各模块可用状态。

## Docker 支持

`docker-compose.yml` 会启动服务端、Redis 和 PostgreSQL。数据库和 Redis 均只连接内部网络，数据分别写入命名卷。

```bash
docker compose up -d
```

## 开发规范

- 遵循 **单一职责原则**，业务逻辑集中在 `src/services`。
- 使用 **Ruff** 进行代码格式化与校验。
- 强制使用 **Type Hints** 保证类型安全。
