import json
import logging
from pathlib import Path
from threading import Lock

from config import settings

logger = logging.getLogger(__name__)


class ImageCache:
    _instance = None
    _lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init()
        return cls._instance

    def _init(self):
        # 缓存文件路径: packages/blog-data/data/image_map.json
        self.cache_file = Path(settings.OUTPUT_DIR) / "image_map.json"
        self.data = self._load()

    def _load(self) -> dict:
        if self.cache_file.exists():
            try:
                with open(self.cache_file, encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"加载图片缓存失败: {e}, 将使用空缓存")
                return {"success": {}, "failures": {}}
        return {"success": {}, "failures": {}}

    def save(self):
        """
        持久化缓存到磁盘 (线程安全)
        """
        try:
            # 确保目录存在
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)

            with self._lock:
                with open(self.cache_file, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存图片缓存失败: {e}")

    def get_success(self, url: str) -> str | None:
        """获取已成功上传的 URL"""
        return self.data.get("success", {}).get(url)

    def get_failure_count(self, url: str) -> int:
        """获取失败次数"""
        return self.data.get("failures", {}).get(url, 0)

    def mark_success(self, original_url: str, new_url: str):
        """标记上传成功"""
        if "success" not in self.data:
            self.data["success"] = {}

        self.data["success"][original_url] = new_url

        # 如果之前失败过，从失败列表中移除
        if "failures" in self.data and original_url in self.data["failures"]:
            del self.data["failures"][original_url]

        self.save()

    def mark_failure(self, original_url: str):
        """标记上传失败 (计数 +1)"""
        if "failures" not in self.data:
            self.data["failures"] = {}

        current_count = self.data["failures"].get(original_url, 0)
        self.data["failures"][original_url] = current_count + 1
        self.save()


class LLMCache:
    _instance = None
    _lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init()
        return cls._instance

    def _init(self):
        # 缓存文件路径: packages/blog-data/data/llm_cache.json
        self.cache_file = Path(settings.OUTPUT_DIR) / "llm_cache.json"
        self.data = self._load()

    def _load(self) -> dict:
        if self.cache_file.exists():
            try:
                with open(self.cache_file, encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"加载 LLM 缓存失败: {e}, 将使用空缓存")
                return {}
        return {}

    def save(self):
        """持久化缓存"""
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            with self._lock:
                with open(self.cache_file, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存 LLM 缓存失败: {e}")

    def get(self, key: str) -> dict | None:
        """获取缓存结果"""
        return self.data.get(key)

    def set(self, key: str, value: dict):
        """设置缓存"""
        self.data[key] = value
        self.save()


# 单例实例
image_cache = ImageCache()
llm_cache = LLMCache()
