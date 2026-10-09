"""站点首页的 SEO 摘要与关键词 Prompt。"""

from langchain_core.prompts import ChatPromptTemplate
from workflow.prompts.style import BLOG_POSITIONING, WRITING_STYLE

_ROLE = "你是这个博客的编辑，负责为博客首页撰写搜索摘要（description）和关键词（keywords）。"

_TASK = """## description
- 以站点名称开头，说明这是作者的个人博客，再概括它写些什么。
- 技术方向只根据输入的标题和标签归纳，用两三个最有代表性的领域概括，不要预设领域。
- 如果标题中有随笔、生活或感悟类内容，用一句话带出这一面。
- 归纳而不是罗列：不要逐个列举文章主题或标签。

## keywords
- 4-6 个，覆盖主要技术方向；如果确实存在随笔类内容，包含 1 个能代表它的词。
- 使用规范名称，不要使用“技术”“编程”“博客”这类泛化词。

## 输出格式
只输出 JSON，不要使用 Markdown 代码块：
{{"description": "...", "keywords": ["...", "..."]}}
如果最近文章标题和高频标签都为空，description 返回空字符串，keywords 返回空数组。"""

SITE_SEO_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", "\n\n".join([_ROLE, BLOG_POSITIONING, WRITING_STYLE, _TASK])),
        ("user", "站点名称：{site_name}\n\n最近文章标题：\n{titles}\n\n高频标签：\n{tags}"),
    ]
)
