import logging
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Any

logger = logging.getLogger("static_deploy")


def cleanup_stale_objects(
    s3_client: Any, bucket_id: str, current_keys: set[str], retired_keys: dict[str, float], max_workers: int
) -> dict[str, float]:
    """清理部署专用空间，先完整列举再删除，避免删除影响分页。"""
    if "index.html" not in current_keys:
        raise ValueError("缺少首页，拒绝清理静态网站存储空间")

    stale_keys: list[str] = []
    retained_keys: dict[str, float] = {}
    marker = ""
    now = time.time()
    cutoff = now - 24 * 60 * 60
    while True:
        response = s3_client.list_objects(Bucket=bucket_id, Marker=marker, MaxKeys=1000)
        objects = response.get("Contents", [])
        for item in objects:
            key = item["Key"]
            if key in current_keys:
                continue
            # 旧页面可能延迟加载资源，构建资源保留一天后在后续部署中回收。
            if key.startswith(("_astro/", "fonts/", "demos/")):
                retired_at = retired_keys.get(key, now)
                if retired_at > cutoff:
                    retained_keys[key] = retired_at
                    continue
            stale_keys.append(key)

        if not response.get("IsTruncated"):
            break
        next_marker = response.get("NextMarker") or (objects[-1]["Key"] if objects else "")
        if not next_marker or next_marker <= marker:
            raise RuntimeError("远端文件列表分页无效，拒绝清理")
        marker = next_marker

    def delete(key: str) -> None:
        s3_client.delete_object(Bucket=bucket_id, Key=key)
        logger.debug("已删除失效文件: %s", key)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 任何删除失败都会终止部署，旧 manifest 保留供下一次重试。
        list(executor.map(delete, stale_keys))
    logger.info("失效文件清理完成，删除: %s", len(stale_keys))
    return retained_keys
