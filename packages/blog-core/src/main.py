import asyncio
import logging
import os
import sys
import time

from config import settings
from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from logging_config import setup_logging
from workflow.graph import graph
from workflow.state import OverallState

# 加载环境变量
load_dotenv()

# 初始化日志配置
setup_logging()
logger = logging.getLogger(__name__)


async def main():
    logger.info("🚀 启动 Blog 生成流程...")
    start_time = time.time()

    try:
        # 初始状态
        initial_state: OverallState = {
            "issues": [],
            "processed_articles": [],
            "columns": [],
            "site_seo": None,
        }

        # 运行 Graph
        # 通过 max_concurrency 限制并行处理的文章数量，防止 CI 环境内存溢出
        config: RunnableConfig = {
            "configurable": {
                "thread_id": "blog-sync",
                "max_concurrency": settings.MAX_ARTICLE_CONCURRENCY,
            }
        }
        result = await graph.ainvoke(initial_state, config=config)

        logger.info("✅ 流程执行完成!")
        logger.info(f"共处理文章: {len(result['processed_articles'])}")
        logger.info(f"生成专栏: {len(result['columns'])}")
        if result["site_seo"]:
            logger.info(f"站点描述: {result['site_seo'].description[:50]}...")

        elapsed_time = time.time() - start_time
        logger.info(f"⏱️ 流程总耗时: {elapsed_time:.2f} 秒")

    except Exception as e:
        logger.error(f"❌ 流程执行出错: {e}", exc_info=True)


if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
