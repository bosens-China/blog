import json
import logging
from pathlib import Path
from typing import Any

from config import settings
from schemas import SiteData
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
    with open(output_dir / "posts.json", "w", encoding="utf-8") as f:
        json.dump(posts_data, f, ensure_ascii=False, indent=2)

    # 3. 保存元数据 (meta.json)
    meta_data: dict[str, Any] = {
        "site_seo": site_seo.model_dump(mode="json") if site_seo else {},
        "posts_meta": posts_meta_map,
        "columns": [c.model_dump(mode="json") for c in columns],
        "generated_at": str(SiteData().generated_at),
    }
    with open(output_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta_data, f, ensure_ascii=False, indent=2)

    # 4. 触发缓存清理与最终保存
    # 因为我们是全量构建，所以在此处执行 prune 会清理掉所有已删除文章或旧版本的缓存条目
    from services.cache import image_cache, llm_cache

    image_cache.save(prune=True)
    llm_cache.save(prune=True)

    logger.info(f"数据已保存至 {output_dir}")
    return {}
