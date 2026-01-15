import logging
import sys
from datetime import datetime
from pathlib import Path

import colorlog
from config import settings


def setup_logging(module_name: str = "blog-core"):
    """
    根据 settings.APP_ENV 配置日志。

    Args:
        module_name: 日志文件名前缀，默认为 "blog-core"

    CI 环境:
      - 控制台: DEBUG 级别，彩色详细格式。
      - 文件: 不保存。

    Development 环境:
      - 控制台: INFO 级别，彩色简洁格式。
      - 文件: DEBUG 级别，详细格式 (无颜色)，文件名包含时间戳。
    """
    # 1. 定义格式器

    # 控制台彩色格式
    console_formatter = colorlog.ColoredFormatter(
        "%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%H:%M:%S",
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "red,bg_white",
        },
    )

    # 文件详细格式 (无颜色)
    file_formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # 获取根 Logger
    root_logger = logging.getLogger()
    # 根 Logger 设置为最低级别，以便让 Handler 决定过滤级别
    root_logger.setLevel(logging.DEBUG)

    # 清除现有的 Handlers (防止重复添加或与默认配置冲突)
    if root_logger.handlers:
        root_logger.handlers.clear()

    # --- 2. 控制台 Handler ---
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)

    if settings.APP_ENV == "ci":
        # CI 环境：控制台需要详细日志以便排查问题
        console_handler.setLevel(logging.DEBUG)
        root_logger.addHandler(console_handler)

        print("在 CI 环境下，日志将仅打印到控制台 (DEBUG 级别)。")

    else:
        # Development 环境：控制台保持清爽，只显示重要信息
        console_handler.setLevel(logging.INFO)
        root_logger.addHandler(console_handler)

        # --- 3. 文件 Handler (仅开发环境) ---
        # 路径: logs/{module_name}_YYYYMMDD_HHMMSS.log
        log_dir = Path(__file__).parent.parent.parent.parent / "logs"
        try:
            log_dir.mkdir(parents=True, exist_ok=True)

            # 生成带时间戳的文件名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            log_file = log_dir / f"{module_name}_{timestamp}.log"

            file_handler = logging.FileHandler(log_file, encoding="utf-8")
            file_handler.setLevel(logging.DEBUG)  # 文件记录所有细节
            file_handler.setFormatter(file_formatter)  # 文件使用无颜色详细格式
            root_logger.addHandler(file_handler)

        except Exception as e:
            print(f"设置文件日志失败: {e}")

    # --- 4. 第三方库日志降噪 ---
    # httpx 和 httpcore 的 DEBUG 日志非常多，通常不需要
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    # AWS/S3 相关
    logging.getLogger("botocore").setLevel(logging.WARNING)
    logging.getLogger("boto3").setLevel(logging.WARNING)
    logging.getLogger("s3transfer").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
