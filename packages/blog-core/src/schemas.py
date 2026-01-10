from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SEOData(BaseModel):
    description: str = Field(description="SEO description")
    keywords: list[str] = Field(description="Keywords/Tags")


class Article(BaseModel):
    """
    文章模型。
    配置 extra='allow' 以保留所有 GitHub Issue 的原始字段
    (如 html_url, user, state 等)。
    """

    model_config = ConfigDict(extra="allow")

    # 核心字段 (用于类型提示)
    id: int
    number: int
    title: str
    body: str | None = None  # GitHub 使用 body 存储 Markdown 内容
    created_at: str | datetime
    updated_at: str | datetime
    labels: list[dict] | list[str] = []  # GitHub 原生是 list[dict]

    # --- 我们生成的附加字段 ---
    seo: SEOData | None = None  # 挂载 SEO 信息
    series: str | None = None  # 所属专栏名称


class Column(BaseModel):
    id: str = Field(description="Column ID/Slug")
    name: str = Field(description="Column Name")
    description: str = Field(description="Column Description")
    article_ids: list[int] = Field(description="List of Article IDs in this column")


class PostMeta(BaseModel):
    seo: SEOData | None = None
    series: str | None = None


class SiteData(BaseModel):
    site_seo: SEOData | None = None
    posts_meta: dict[str, PostMeta] = {}
    columns: list[Column] = []
    generated_at: datetime = Field(default_factory=datetime.now)
