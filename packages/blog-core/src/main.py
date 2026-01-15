import asyncio
import logging
import os
import sys
import time

from config import settings
from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from logging_config import setup_logging
from services.github import GitHubService
from services.global_image_processor import global_image_processor
from services.service_status import service_status
from workflow.graph import graph
from workflow.state import OverallState

# 加载环境变量
load_dotenv()

# 初始化日志配置
setup_logging()
logger = logging.getLogger(__name__)


async def main():
    # --- 打印配置摘要 ---
    service_status.print_summary()

    logger.info("🚀 启动 Blog 生成流程...")
    start_time = time.time()

    try:
        # Phase 1: Data Ingestion (ETL Extract)
        # 负责从外部源获取原始数据
        logger.info(f"开始拉取 GitHub Issues [{settings.effective_repo}]...")
        github_service = GitHubService()
        issues = await github_service.fetch_issues(state="open")
        logger.info(f"成功拉取 {len(issues)} 篇 Issues")

        if not issues:
            logger.warning("未获取到任何文章，流程结束。")
            return

        # Phase 2: Global Pre-processing (ETL Transform - Assets)
        # 负责处理图片资源：提取 -> 全局去重 -> 上传 -> 替换
        # 这确保了网络请求的高效和文件名的全局唯一/一致性
        processed_issues = await global_image_processor.process_articles(issues)

        # Phase 3: Content Processing & Generation (Pipeline)
        # 负责业务逻辑：LLM 生成(SEO, Summary) -> 聚合 -> 结构化输出 -> 持久化
        initial_state: OverallState = {
            "issues": processed_issues,
            "processed_articles": [],
            "columns": [],
            "site_seo": None,
        }

        config: RunnableConfig = {
            "configurable": {
                "thread_id": "blog-sync",
                "max_concurrency": settings.MAX_ARTICLE_CONCURRENCY,
            }
        }

        logger.info("🚀 启动内容处理流水线 (Graph)...")
        result = await graph.ainvoke(initial_state, config=config)

        # Phase 4: Summary & Reporting
        logger.info("✅ 流程执行完成!")
        logger.info(f"共处理文章: {len(result['processed_articles'])}")
        logger.info(f"生成专栏: {len(result['columns'])}")
        if result["site_seo"]:
            logger.info(f"站点描述: {result['site_seo'].description[:50]}...")

        elapsed_time = time.time() - start_time
        logger.info(f"⏱️ 流程总耗时: {elapsed_time:.2f} 秒")

    except Exception as e:
        logger.error(f"❌ 流程执行出错: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
