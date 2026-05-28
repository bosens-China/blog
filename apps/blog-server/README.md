# Blog AI Server

这是博客系统的后端服务，主要负责提供基于文章上下文的 AI 智能对话功能。

## 技术栈

- **框架**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **LLM 框架**: [LangChain](https://python.langchain.com/)
- **模型支持**: DeepSeek (通过 OpenAI 协议兼容接口)
- **存储**: [Redis](https://redis.io/) (用于对话历史缓存与限流)
- **依赖管理**: [uv](https://github.com/astral-sh/uv)

## 主要功能

- **流式对话 (SSE)**: 支持实时的 AI 响应输出。
- **短期记忆 (Short-term Memory)**: 基于 Session ID 的对话历史保持，页面刷新即重置。
- **文章上下文感知**: 自动关联当前博文内容，提供精准的问答支持。
- **阶梯式限流**: 针对用户 IP 进行多级限流保护，支持开发模式开关。
- **高性能**: 异步 IO 处理，轻量级存储。

## 快速开始

### 1. 环境准备

确保已安装 [uv](https://github.com/astral-sh/uv)。

```bash
# 安装依赖
uv sync
```

### 2. 配置文件

在 `apps/blog-server` 目录下创建 `.env` 文件（可参考 `.env.example`）：

### 3. 运行服务

```bash
# 使用 uv 直接运行
uv run src/main.py
```

服务默认运行在 `http://localhost:8000`。

## API 接口

- `POST /api/chat`: 流式对话接口。接收 `session_id`, `post_id`, `message`。
  - **安全升级**: 后端通过 `post_id` 自主从 OSS 获取文章内容，不再接受前端传递的 context。
- `GET /api/limit-status`: 获取当前客户端的限流剩余次数与冷却时间。
- `GET /health`: 健康检查接口。

## Docker 支持

项目包含 `Dockerfile` 和 `docker-compose.yml`。当前 `docker-compose.yml` 更适合本地开发和联调：

- `server` 会挂载 `./src:/app/src`，方便本地源码变更后快速验证。
- `redis` 会映射 `6379:6379`，方便本机调试和查看缓存。

生产部署建议直接使用 CI 发布的镜像，或准备独立的生产 compose 文件，并移除源码挂载和 Redis 端口映射。

```bash
docker compose up -d
```

## 开发规范

- 遵循 **单一职责原则**，业务逻辑集中在 `src/services`。
- 使用 **Ruff** 进行代码格式化与校验。
- 强制使用 **Type Hints** 保证类型安全。
