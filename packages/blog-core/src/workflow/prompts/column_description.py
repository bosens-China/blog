"""专栏介绍 Prompt：根据专栏名与文章摘要生成整体介绍。"""

from langchain_core.prompts import ChatPromptTemplate
from workflow.prompts.style import BLOG_POSITIONING, WRITING_STYLE

_ROLE = "你是这个博客的编辑，负责为一个专栏（系列文章）撰写整体介绍（description）。"

_TASK = """## description
- 概括这一组文章共同讨论的主题和覆盖范围：技术系列写清楚问题域和推进的脉络，随笔系列写清楚它记录的主题。
- 不要逐篇复述文章内容，也不要描述读者能获得什么。
- 文章摘要较少时，基于专栏名称和标题给出简洁概括，不要返回空字符串。

## 输出格式
只输出 JSON，不要使用 Markdown 代码块：
{{"description": "..."}}"""

COLUMN_DESCRIPTION_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", "\n\n".join([_ROLE, BLOG_POSITIONING, WRITING_STYLE, _TASK])),
        ("user", "专栏名称：{name}\n\n文章摘要：\n{summaries}"),
    ]
)
