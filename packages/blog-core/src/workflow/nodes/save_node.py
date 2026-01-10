import json
import logging
from pathlib import Path

from config import settings
from schemas import SiteData
from workflow.state import OverallState

logger = logging.getLogger(__name__)


async def save_data_node(state: OverallState) -> dict:
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
    posts_data = []
    posts_meta_map = {}

    for a in articles:
        # 提取元数据 (SEO, Series)
        # 即使是 None 也可以保存，或者根据需求过滤
        # 这里我们构造 PostMeta 对象 (需要导入)
        # 为了避免循环导入或重新定义，这里直接构造字典，
        # 只要符合 schemas.PostMeta 结构即可
        meta_entry = {
            "seo": a.seo.model_dump(mode="json") if a.seo else None,
            "series": a.series,
        }

        # 只有当至少有一个字段非空时才保存 (可选优化，这里选择保留以对应 ID)
        posts_meta_map[str(a.id)] = meta_entry

        # 保存文章数据 (排除已提取的元字段)
        posts_data.append(
            a.model_dump(mode="json", exclude={"seo", "series"})
        )

    # 2. 保存文章列表 (posts.json)
    with open(output_dir / "posts.json", "w", encoding="utf-8") as f:
        json.dump(posts_data, f, ensure_ascii=False, indent=2)

    # 3. 保存元数据 (meta.json)
    meta_data = {
        "site_seo": site_seo.model_dump(mode="json") if site_seo else {},
        "posts_meta": posts_meta_map,
        "columns": [c.model_dump(mode="json") for c in columns],
        "generated_at": str(SiteData().generated_at),
    }
    with open(output_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta_data, f, ensure_ascii=False, indent=2)

    logger.info(f"数据已保存至 {output_dir}")
    return {}
