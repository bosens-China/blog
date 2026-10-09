# Xiaowo's Blog

欢迎来到我的博客项目，这个项目是记录技术探索与生活随笔的个人博客，采用 Astro + LLM 驱动构建。

## 本地开发

仓库使用 pnpm 12.10.1 统一安装前端与 Python 依赖，Python 3.12 会按需下载。提交的 `pnpm-lock.yaml` 与 `pylock.toml` 分别锁定两套依赖，支持 Windows x64 和 Linux x64。

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm --filter blog check
pnpm --filter blog dev
```

首次从 uv 环境迁移时，先将已有 `.venv` 移到备份位置，再执行安装；pnpm 不会覆盖其他工具创建的虚拟环境。`tool.uv.workspace` 仅保留为 Python 项目发现配置，不需要安装 uv。

Python 支持目前属于 pnpm 的实验性功能。Docker 使用同一套共享环境的生产依赖，运行镜像不包含 pnpm 或 Node.js。

## 📄 协议声明

本项目采用双协议授权：

- **代码部分**：遵循 [MIT License](LICENSE)，你可以自由地使用、修改和分发本项目代码。
- **文章内容**：遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。转载请注明出处，不可用于商业目的，且需以相同方式共享。
