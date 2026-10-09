"""单篇文章的 SEO 摘要与关键词 Prompt。"""

from langchain_core.prompts import ChatPromptTemplate
from workflow.prompts.style import BLOG_POSITIONING, WRITING_STYLE

_ROLE = "你是这个博客的编辑，负责为单篇文章撰写搜索摘要（description）和关键词（keywords）。"

_TASK = """## description
- 先判断文章类型：技术文章写清楚它处理的具体问题、采用的方法或得出的结论；随笔与感悟写清楚它记录的主题、场景和情绪。
- 自然包含 1-2 个核心关键词，但不要复述标题原句。
- 只写文章里确实有的内容，不要补充或推测。

## keywords
- 3-5 个，按重要性排序。
- 技术文章取核心技术、工具或概念；随笔取主题词，例如“成长”“年终总结”“读书”。
- 使用规范名称，不要使用“技术”“编程”“思考”“分享”这类泛化词，不要加 # 号。

## 参考示例
技术文章：面对插件之间复杂的依赖关系，串行执行逐渐成为瓶颈。文章用 Kahn 算法实现拓扑排序并重写调度逻辑，让互不依赖的插件可以并发执行。
随笔：三十岁生日这天，回望从乡村到城市的成长轨迹，在岔路口、寒暑假和渐渐失联的游戏好友之间，记录普通生活里的选择与告别。

## 输出格式
只输出 JSON，不要使用 Markdown 代码块：
{{"description": "...", "keywords": ["...", "..."]}}
如果正文少于 100 字或无法提炼有效信息，description 返回空字符串，keywords 返回空数组。"""

ARTICLE_SEO_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", "\n\n".join([_ROLE, BLOG_POSITIONING, WRITING_STYLE, _TASK])),
        ("user", "标题：{title}\n\n正文：\n{content}"),
    ]
)
