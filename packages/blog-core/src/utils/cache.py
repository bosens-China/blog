# @/packages/blog-core/src/utils/cache.py
import hashlib
from typing import Any

from config import settings


def generate_cache_key(prefix: str, *args: Any) -> str:
    """
    根据项目版本、前缀和多个输入字符串生成缓存键。

    Args:
        prefix (str): 缓存键的前缀 (例如: "seo", "columns").
        *args: 用于生成哈希的一个或多个输入值.

    Returns:
        str: 生成的唯一缓存键.
    """
    # 将所有输入部分连接成一个字符串，包含项目版本以确保版本更新时缓存失效
    input_parts = [settings.project_version] + [str(arg) for arg in args]
    input_str = "|".join(input_parts)

    # 计算 MD5 哈希值
    input_hash = hashlib.md5(input_str.encode("utf-8")).hexdigest()

    # 返回最终的缓存键
    return f"{prefix}_{input_hash}"
