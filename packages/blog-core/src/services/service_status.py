import logging

from configs.llm import llm_settings
from configs.storage import storage_settings

logger = logging.getLogger(__name__)


class ServiceStatus:
    """
    统一管理各个后端服务的状态检查逻辑
    """

    @staticmethod
    def is_llm_enabled() -> bool:
        """检查 LLM 服务是否可用"""
        # 只要配置了 API Key 即视为可用
        return bool(llm_settings.BLOG_CORE_LLM_API_KEY)

    @staticmethod
    def is_storage_enabled() -> bool:
        """
        检查图床/存储服务是否可用
        要求：必须配置 AK, SK, Bucket 和 Domain 四项完整
        """
        return all(
            [
                storage_settings.DOGECLOUD_ACCESS_KEY,
                storage_settings.DOGECLOUD_SECRET_KEY,
                storage_settings.DOGECLOUD_IMAGE_BUCKET,
                storage_settings.DOGECLOUD_IMAGE_DOMAIN,
            ]
        )

    @classmethod
    def get_llm_summary(cls) -> str:
        """获取 LLM 服务状态描述"""
        if cls.is_llm_enabled():
            return f"✅ 已启用 ({llm_settings.BLOG_CORE_LLM_API_MODEL})"
        return "⚠️  未启用 (将跳过 SEO 和专栏生成)"

    @classmethod
    def get_storage_summary(cls) -> str:
        """获取存储服务状态描述"""
        if cls.is_storage_enabled():
            return "✅ 已启用 (DogeCloud)"

        # 细化缺失信息提示
        missing = []
        if not storage_settings.DOGECLOUD_ACCESS_KEY:
            missing.append("AK")
        if not storage_settings.DOGECLOUD_SECRET_KEY:
            missing.append("SK")
        if not storage_settings.DOGECLOUD_IMAGE_BUCKET:
            missing.append("Bucket")
        if not storage_settings.DOGECLOUD_IMAGE_DOMAIN:
            missing.append("Domain")

        if missing:
            return f"⚠️  未启用 (缺失配置: {', '.join(missing)}) -> 将保留原始链接"
        return "⚠️  未启用"

    @classmethod
    def print_summary(cls):
        """打印所有服务的状态摘要"""
        from configs.base import base_settings

        logger.info("=" * 30)
        logger.info("   Blog Core 服务状态检查")
        logger.info("=" * 30)
        logger.info(f"目标仓库    : {base_settings.effective_repo}")
        logger.info(f"LLM 服务     : {cls.get_llm_summary()}")
        logger.info(f"图床服务    : {cls.get_storage_summary()}")
        logger.info("=" * 30 + "\n")


# 单例导出
service_status = ServiceStatus()
