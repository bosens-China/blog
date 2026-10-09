import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from config import settings
from schemas import SiteData
from services.service_status import service_status
from utils.json_file import write_json, write_json_if_changed
from workflow.state import OverallState

logger = logging.getLogger(__name__)


async def save_data_node(state: OverallState) -> dict[str, Any]:
    """
    节点: 保存处理结果到本地 JSON 文件
    """
    logger.info("正在保存数据...")

    output_dir = Path(settings.OUTPUT_DIR)
    output_dir.mkdir(parents=True, exist_ok=True)

    articles = state["processed_articles"]
    columns = state["columns"]
    site_seo = state["site_seo"]

    # 1. 准备数据
    posts_data: list[dict[str, Any]] = []
    posts_meta_map: dict[str, dict[str, Any]] = {}

    for a in articles:
        # 提取元数据 (SEO, Series)
        meta_entry: dict[str, Any] = {
            "seo": a.seo.model_dump(mode="json") if a.seo else None,
            "series": a.series,
        }

        # 只有当至少有一个字段非空时才保存 (可选优化，这里选择保留以对应 ID)
        posts_meta_map[str(a.id)] = meta_entry

        # 保存文章数据 (排除已提取的元字段)
        posts_data.append(a.model_dump(mode="json", exclude={"seo", "series"}))

    # 2. 保存文章列表 (posts.json)
    write_json(output_dir / "posts.json", posts_data)

    # 2.1 分片保存每篇文章 (用于 AI Server 按需获取)
    # 直接保存在 blog-data/posts 目录下 (与 data 目录并列)
    posts_detail_dir = output_dir.parent / "posts"
    for a in articles:
        # 这里保存全量数据，包括 seo 和 series，为 AI 提供最全的上下文
        write_json(posts_detail_dir / f"{a.id}.json", a.model_dump(mode="json"))

    # 3. 保存元数据 (meta.json)，内容不变时保留原生成时间
    meta_content: dict[str, Any] = {
        "site_seo": site_seo.model_dump(mode="json") if site_seo else {},
        "posts_meta": posts_meta_map,
        "columns": [c.model_dump(mode="json") for c in columns],
    }
    write_json_if_changed(
        settings.meta_json_path,
        meta_content,
        timestamp_key="generated_at",
        timestamp=str(SiteData().generated_at),
    )

    # 4. 保存 About 内容 (about.json)，内容不变时保留原更新时间
    about_content = state.get("about_content")
    about_data: dict[str, Any] = {
        "content": about_content if about_content else "",
        "visible": bool(about_content),
    }
    write_json_if_changed(
        output_dir / "about.json",
        about_data,
        timestamp_key="updated_at",
        timestamp=str(datetime.now()),
    )

    # 5. 触发缓存最终保存。缓存默认尽量保留，避免关闭 Issue 后重复消耗 LLM 和图片处理成本。
    from services.cache import image_cache, llm_cache

    if service_status.is_storage_enabled():
        image_cache.save()

    if service_status.is_llm_enabled():
        llm_cache.save()

    logger.info(f"数据已保存至 {output_dir}")
    return {}
