---
name: deepseek-api-guide
description: 当需要调用、配置或调优 DeepSeek 等大模型 API 参数（如 temperature、并发与限速）时使用。
---

# DeepSeek API 使用与调优技能

## When to use this skill

在以下场景使用：

- 编写或修改 DeepSeek API 调用代码
- 不确定 temperature 等参数如何设置
- 排查请求卡住、延迟高等问题

## How to use this skill

1. 根据用户目标判断使用场景（代码生成、对话、创作等）
2. 按文档建议选择合适的 temperature 值
3. 若出现请求卡顿，参考限速与连接说明进行解释或优化

## Parameter Guidelines

### Temperature 设置

temperature 参数默认为 1.0。

我们建议您根据如下表格，按使用场景设置 temperature。
场景 温度
代码生成/数学解题    0.0
数据抽取/分析 1.0
通用对话 1.3
翻译 1.3
创意类写作/诗歌创作 1.5

### 限速

DeepSeek API 不限制用户并发量，我们会尽力保证您所有请求的服务质量。

但请注意，当我们的服务器承受高流量压力时，您的请求发出后，可能需要等待一段时间才能获取服务器的响应。在这段时间里，您的 HTTP 请求会保持连接，并持续收到如下格式的返回内容：

非流式请求：持续返回空行
流式请求：持续返回 SSE keep-alive 注释（: keep-alive）
这些内容不影响 OpenAI SDK 对响应的 JSON body 的解析。如果您在自己解析 HTTP 响应，请注意处理这些空行或注释。

如果 10 分钟后，请求仍未开始推理，服务器将关闭连接。
