---
name: dogecloud-docs
description: 当需要编写、理解、评审或排查多吉云云存储、S3/Boto3、临时密钥、文件管理 API、图片处理、CI 静态站部署、增量上传或上传性能问题时使用。
---

# 多吉云存储与图片处理

## 工作流

1. 先确认任务属于图片处理、对象上传、文件管理、鉴权，还是 CI 部署性能。
2. 检查仓库中的 `package.json`、`pyproject.toml`、现有存储工具和全部调用方，优先复用已有 Boto3/httpx 能力。
3. 按任务读取参考：
   - OSS、临时密钥、Python S3、文件列表、增量部署：读取 [oss-storage.md](./references/oss-storage.md)。
   - `imageMogr2` 图片参数：读取 [image-basic.html](./references/image-basic.html)。
4. 参数、限额或 SDK 行为可能变化时，重新查阅参考中列出的多吉云官方页面；只使用官方文档作为技术依据。
5. 修改后先运行 `uv run pyright`，再运行 `uv run ruff check .`；涉及前端构建时再运行 `pnpm --filter blog check`。

## 必须遵守

- 只在服务端或 CI 使用永久 AccessKey/SecretKey，不写入客户端、日志或仓库。
- 每次通过临时密钥响应获取 `s3Endpoint` 和 `s3Bucket`，不要硬编码底层存储信息。
- 客户端上传使用最小化的 `OSS_UPLOAD` 路径授权；文件管理使用 `OSS_FULL` 存储空间授权。
- 初始化 S3 客户端时使用 Virtual Hosted Style，并按官方 Python 示例限制请求与响应校验行为。
- 调用多吉云管理 API 时检查响应 JSON 的 `code`，不能只判断 HTTP 状态码。
- 优化上传前先用 CI 日志量化文件数和耗时；不要把提高并发当作默认答案。

## 增量部署决策

- 文件列表适合一次获取远端清单或审计；避免为每个对象单独查询文件信息。
- 不把 `key + 文件大小` 当作内容一致，也不假设多吉云 `hash` 或 S3 ETag 等于本地 MD5。
- CI 独占写入的静态空间优先使用单个部署 manifest：对“文件内容 + 上传响应头”计算稳定 SHA-256，只上传变化对象。
- 先完成资源和数据上传，再发布 HTML；全部成功后最后写 manifest。
- manifest 缺失或损坏时回退全量上传；上传失败时保留旧 manifest，确保下次重试。
- 默认不删除远端旧对象；只有明确需要严格镜像或清理存储时才增加删除阶段。
