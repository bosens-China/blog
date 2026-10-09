import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def write_json(path: Path, data: Any) -> None:
    """以统一格式写入 JSON，保证多次生成的输出稳定、diff 可读"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_json_if_changed(path: Path, content: dict[str, Any], timestamp_key: str, timestamp: str) -> bool:
    """
    仅在内容（不含时间戳字段）变化时写入，并刷新时间戳。
    数据文件纳入版本控制后，可避免每次构建只因时间戳不同而产生无意义的提交。
    返回是否发生了写入。
    """
    existing = read_json_object(path)
    if existing is not None and timestamp_key in existing:
        previous = {key: value for key, value in existing.items() if key != timestamp_key}
        if previous == content:
            return False

    write_json(path, {**content, timestamp_key: timestamp})
    return True


def read_json_object(path: Path) -> dict[str, Any] | None:
    """读取 JSON 对象文件；文件不存在、解析失败或顶层不是对象时返回 None"""
    if not path.exists():
        return None
    try:
        with open(path, encoding="utf-8") as f:
            payload = json.load(f)
    except (OSError, json.JSONDecodeError) as error:
        logger.warning(f"读取现有数据失败，将重新写入 {path.name}: {error}")
        return None
    return payload if isinstance(payload, dict) else None
