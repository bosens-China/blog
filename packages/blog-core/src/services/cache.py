import json
import logging
from pathlib import Path
from threading import Lock
from typing import Any

from config import settings

logger = logging.getLogger(__name__)


class ImageCache:
    _instance: "ImageCache | None" = None
    _lock: Lock = Lock()
    data: dict[str, Any]
    cache_file: Path
    touched_urls: set[str]

    def __new__(cls) -> "ImageCache":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init()
        return cls._instance

    def _init(self) -> None:
        # 缓存文件路径: packages/blog-data/data/image_map.json
        self.cache_file = Path(settings.OUTPUT_DIR) / "image_map.json"
        self.data = self._load()
        self.touched_urls = set()

    def _load(self) -> dict[str, Any]:
        if self.cache_file.exists():
            try:
                with open(self.cache_file, encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        return data
            except Exception as e:
                logger.error(f"加载图片缓存失败: {e}, 将使用空缓存")
        return {"success": {}, "failures": {}}

    def save(self, prune: bool = False) -> None:
        """
        持久化缓存到磁盘 (线程安全)
        """
        try:
            # 确保目录存在
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)

            with self._lock:
                if prune:
                    # 仅保留本次构建中访问过的 URL
                    new_success = {k: v for k, v in self.data.get("success", {}).items() if k in self.touched_urls}
                    new_failures = {k: v for k, v in self.data.get("failures", {}).items() if k in self.touched_urls}
                    self.data["success"] = new_success
                    self.data["failures"] = new_failures
                    logger.info("图片缓存清理完成 (Pruned)")

                with open(self.cache_file, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存图片缓存失败: {e}")

    def get_success(self, url: str) -> str | None:
        """获取已成功上传的 URL"""
        self.touched_urls.add(url)
        success_map: dict[str, str] = self.data.get("success", {})
        return success_map.get(url)

    def get_failure_count(self, url: str) -> int:
        """获取失败次数"""
        self.touched_urls.add(url)
        failures_map: dict[str, int] = self.data.get("failures", {})
        return failures_map.get(url, 0)

    def mark_success(self, original_url: str, new_url: str) -> None:
        """标记上传成功"""
        self.touched_urls.add(original_url)
        if "success" not in self.data:
            self.data["success"] = {}

        self.data["success"][original_url] = new_url

        # 如果之前失败过，从失败列表中移除
        if "failures" in self.data and original_url in self.data["failures"]:
            del self.data["failures"][original_url]

        self.save()

    def mark_failure(self, original_url: str) -> None:
        """标记上传失败 (计数 +1)"""
        self.touched_urls.add(original_url)
        if "failures" not in self.data:
            self.data["failures"] = {}

        failures_map: dict[str, int] = self.data["failures"]
        current_count = failures_map.get(original_url, 0)
        self.data["failures"][original_url] = current_count + 1
        self.save()


class LLMCache:
    _instance: "LLMCache | None" = None
    _lock: Lock = Lock()
    data: dict[str, Any]
    cache_file: Path
    touched_keys: set[str]

    def __new__(cls) -> "LLMCache":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init()
        return cls._instance

    def _init(self) -> None:
        # 缓存文件路径: packages/blog-data/data/llm_cache.json
        self.cache_file = Path(settings.OUTPUT_DIR) / "llm_cache.json"
        self.data = self._load()
        self.touched_keys = set()

    def _load(self) -> dict[str, Any]:
        if self.cache_file.exists():
            try:
                with open(self.cache_file, encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        return data
            except Exception as e:
                logger.error(f"加载 LLM 缓存失败: {e}, 将使用空缓存")
        return {}

    def save(self, prune: bool = False) -> None:
        """持久化缓存"""
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            with self._lock:
                if prune:
                    # 仅保留本次构建访问过的 Key
                    self.data = {k: v for k, v in self.data.items() if k in self.touched_keys}
                    logger.info("LLM 缓存清理完成 (Pruned)")

                with open(self.cache_file, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存 LLM 缓存失败: {e}")

    def get(self, key: str) -> dict[str, Any] | None:
        """获取缓存结果"""
        self.touched_keys.add(key)
        return self.data.get(key)

    def set(self, key: str, value: dict[str, Any]) -> None:
        """设置缓存"""
        self.touched_keys.add(key)
        self.data[key] = value
        self.save()


# 单例实例
image_cache = ImageCache()
llm_cache = LLMCache()
