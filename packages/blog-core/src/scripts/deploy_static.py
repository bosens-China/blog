import asyncio
import hashlib
import json
import logging
import mimetypes
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

import boto3
from boto3.s3.transfer import TransferConfig
from botocore.config import Config
from botocore.exceptions import ClientError

# 将 src 目录添加到 sys.path 以便导入 configs 和 utils
sys.path.append(str(Path(__file__).resolve().parent.parent))

from configs.storage import storage_settings as settings
from logging_config import setup_logging
from utils.dogecloud_storage import get_doge_token

# 初始化配置了 colorlog 的日志
setup_logging(module_name="static_deploy")
logger = logging.getLogger("static_deploy")

DEFAULT_UPLOAD_WORKERS = 16
MANIFEST_KEY = "_deploy/manifest.json"
MANIFEST_VERSION = 1


class StaticSiteDeployer:
    def __init__(self):
        # 从配置中读取静态网站的 Bucket 名称
        self.bucket_name = settings.DOGECLOUD_STATIC_BUCKET
        self.max_workers = self._get_max_workers()
        self.transfer_config = TransferConfig(use_threads=False)
        # 静态文件构建目录
        # packages/blog-core/src/scripts -> packages/blog-core -> packages -> root -> apps/blog/dist
        self.dist_dir = Path(__file__).parent.parent.parent.parent.parent / "apps" / "blog" / "dist"

        # 验证配置
        if not self.bucket_name:
            raise ValueError("未配置静态网站存储空间名称 (DOGECLOUD_STATIC_BUCKET)")

        if not settings.DOGECLOUD_ACCESS_KEY or not settings.DOGECLOUD_SECRET_KEY:
            raise ValueError("未配置多吉云 AccessKey 或 SecretKey")

    def get_s3_client(self, credentials: dict[str, Any], endpoint: str) -> Any:  # noqa: C901
        """初始化 S3 客户端"""
        s3_config = Config(
            s3={"addressing_style": "virtual"},
            signature_version="s3v4",
            max_pool_connections=self.max_workers,
            request_checksum_calculation="when_required",
            response_checksum_validation="when_required",
        )
        return boto3.client(
            "s3",
            aws_access_key_id=credentials["accessKeyId"],
            aws_secret_access_key=credentials["secretAccessKey"],
            aws_session_token=credentials["sessionToken"],
            endpoint_url=endpoint,
            config=s3_config,
        )

    async def deploy(self) -> None:
        """执行部署流程"""
        if not self.dist_dir.exists():
            raise FileNotFoundError(f"构建目录不存在: {self.dist_dir}，请先运行前端构建命令 (pnpm build)")

        # 这里的 self.bucket_name 已经过校验，不为 None
        bucket_name = str(self.bucket_name)
        logger.info(f"正在准备部署到: {bucket_name}")

        # 1. 获取临时凭证
        token_info = await asyncio.to_thread(get_doge_token, bucket_name, "OSS_FULL")

        if not token_info:
            raise RuntimeError("无法获取上传凭证，部署终止")

        creds = token_info["credentials"]
        endpoint = token_info["s3Endpoint"]
        s3_bucket_id = token_info["s3Bucket"]  # S3 内部使用的 Bucket ID

        # 2. 收集需要上传的文件
        files_to_upload = self._collect_files()
        if not files_to_upload:
            raise RuntimeError(f"构建目录为空，没有可部署文件: {self.dist_dir}")

        logger.info(f"共扫描到 {len(files_to_upload)} 个文件")

        # 3. 初始化 S3 客户端
        s3 = self.get_s3_client(creds, endpoint)
        start_time = time.time()

        # 4. 对比上次成功部署的清单，只上传内容或响应头变化的文件。
        remote_manifest = await asyncio.to_thread(self._load_manifest, s3, s3_bucket_id)
        local_manifest = self._build_manifest(files_to_upload)
        files_to_upload = [item for item in files_to_upload if remote_manifest.get(item[1]) != local_manifest[item[1]]]
        files_to_upload.sort(key=lambda item: item[1])
        skipped_count = len(local_manifest) - len(files_to_upload)

        logger.info(f"增量比较完成，需上传: {len(files_to_upload)}，跳过: {skipped_count}")

        results: list[str | BaseException] = []
        if files_to_upload:
            logger.info(f"开启 {self.max_workers} 线程并发上传...")
            resource_files = [item for item in files_to_upload if not item[1].endswith(".html")]
            html_files = [item for item in files_to_upload if item[1].endswith(".html")]
            results = await self._upload_files(s3, s3_bucket_id, resource_files)
            if not any(isinstance(result, BaseException) for result in results):
                results.extend(await self._upload_files(s3, s3_bucket_id, html_files))

        success_count, fail_count = self._count_upload_results(results)

        if fail_count > 0:
            raise RuntimeError(f"静态资源上传失败，共 {fail_count} 个文件失败")

        # 清单最后写入；部署中断时保留旧清单，下一次会自动重试未确认的变更。
        if remote_manifest != local_manifest:
            await asyncio.to_thread(self._save_manifest, s3, s3_bucket_id, local_manifest)

        duration = time.time() - start_time
        logger.info(
            f"部署完成! 上传: {success_count}, 跳过: {skipped_count}, 失败: {fail_count}, 耗时: {duration:.2f}秒"
        )

        if settings.DOGECLOUD_STATIC_DOMAIN:
            logger.info(f"网站地址: {settings.DOGECLOUD_STATIC_DOMAIN}")

    def _collect_files(self) -> list[tuple[Path, str]]:
        """收集所有需要上传的文件"""
        files_to_upload = []

        # 2.1 收集前端构建产物 (dist)
        for root, _, files in os.walk(self.dist_dir):
            for file in files:
                file_path = Path(root) / file
                relative_path = file_path.relative_to(self.dist_dir)
                s3_key = str(relative_path).replace(os.sep, "/")
                files_to_upload.append((file_path, s3_key))

        # 2.2 收集业务数据分片 (blog-data/posts -> OSS _posts/)
        posts_data_dir = Path(__file__).parent.parent.parent.parent.parent / "packages" / "blog-data" / "posts"
        if posts_data_dir.exists():
            logger.info("正在扫描 AI 专用分片数据 (_posts)...")
            for p in posts_data_dir.glob("*.json"):
                files_to_upload.append((p, f"_posts/{p.name}"))

        return files_to_upload

    def _build_manifest(self, files: list[tuple[Path, str]]) -> dict[str, str]:
        """生成包含文件内容和上传响应头的稳定指纹。"""
        return {key: self._fingerprint_file(file_path, key) for file_path, key in files}

    def _fingerprint_file(self, file_path: Path, key: str) -> str:
        content_type = self._get_content_type(file_path)
        extra_args = self._get_extra_args(key, content_type)
        fingerprint = hashlib.sha256(json.dumps(extra_args, sort_keys=True, separators=(",", ":")).encode())
        fingerprint.update(b"\0")
        with file_path.open("rb") as file:
            while chunk := file.read(1024 * 1024):
                fingerprint.update(chunk)
        return fingerprint.hexdigest()

    def _load_manifest(self, s3_client: Any, bucket_id: str) -> dict[str, str]:
        """读取上一次成功部署的清单；首次部署或清单损坏时回退到全量上传。"""
        try:
            response = s3_client.get_object(Bucket=bucket_id, Key=MANIFEST_KEY)
            body = response["Body"]
            try:
                manifest = json.loads(body.read())
            finally:
                body.close()

            files = manifest.get("files")
            if manifest.get("version") != MANIFEST_VERSION or not isinstance(files, dict):
                raise ValueError("清单版本或结构无效")
            if not all(isinstance(key, str) and isinstance(value, str) for key, value in files.items()):
                raise ValueError("清单文件指纹无效")

            logger.info(f"已读取远端部署清单，共 {len(files)} 个文件")
            return files
        except ClientError as error:
            error_code = str(error.response.get("Error", {}).get("Code", ""))
            if error_code not in {"404", "NoSuchKey", "NotFound"}:
                raise
            logger.info("远端部署清单不存在，本次执行全量上传")
            return {}
        except (KeyError, TypeError, ValueError) as error:
            logger.warning(f"远端部署清单无效，本次执行全量上传: {error}")
            return {}

    def _save_manifest(self, s3_client: Any, bucket_id: str, files: dict[str, str]) -> None:
        """在所有文件上传成功后保存本次部署清单。"""
        body = json.dumps(
            {"version": MANIFEST_VERSION, "files": files},
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
        s3_client.put_object(
            Bucket=bucket_id,
            Key=MANIFEST_KEY,
            Body=body,
            ContentType="application/json",
            CacheControl="no-cache, no-store, must-revalidate",
        )
        logger.info("远端部署清单已更新")

    async def _upload_files(
        self,
        s3_client: Any,
        bucket_id: str,
        files: list[tuple[Path, str]],
    ) -> list[str | BaseException]:
        """并发上传单个批次内的文件。"""
        if not files:
            return []

        loop = asyncio.get_running_loop()
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            tasks = [
                loop.run_in_executor(executor, self._upload_file_sync, s3_client, bucket_id, file_path, key)
                for file_path, key in files
            ]
            return await asyncio.gather(*tasks, return_exceptions=True)

    def _count_upload_results(self, results: list[str | BaseException]) -> tuple[int, int]:
        failures = [result for result in results if isinstance(result, BaseException)]
        for failure in failures:
            logger.error(f"上传出错: {failure}")
        return len(results) - len(failures), len(failures)

    def _get_max_workers(self) -> int:
        """读取上传并发配置，限制在合理范围内，避免 CI 中产生过多连接。"""
        raw_workers = os.getenv("STATIC_UPLOAD_WORKERS")
        if raw_workers is None:
            return DEFAULT_UPLOAD_WORKERS

        try:
            workers = int(raw_workers)
        except ValueError:
            logger.warning(f"STATIC_UPLOAD_WORKERS 配置无效，使用默认值 {DEFAULT_UPLOAD_WORKERS}: {raw_workers}")
            return DEFAULT_UPLOAD_WORKERS

        return max(1, min(workers, 32))

    def _get_content_type(self, file_path: Path) -> str:
        """获取文件的 MIME 类型"""
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type:
            return content_type

        # 针对常见但 guess_type 可能无法识别的类型做补充
        ext_map = {
            ".css": "text/css",
            ".js": "application/javascript",
            ".mjs": "application/javascript",
            ".json": "application/json",
            ".html": "text/html",
            ".svg": "image/svg+xml",
            ".xml": "text/xml",
        }
        return ext_map.get(file_path.suffix.lower(), "application/octet-stream")

    def _get_extra_args(self, key: str, content_type: str) -> dict[str, Any]:
        """获取上传的额外参数（MIME, 缓存控制等）"""
        extra_args: dict[str, Any] = {"ContentType": content_type}

        # 缓存策略
        # _astro/ 目录包含带有 Hash 的构建产物，适合长缓存
        # assets/ 和 fonts/ 通常也是静态资源
        if key.startswith("_astro/") or key.startswith("fonts/"):
            # 带哈希的静态资源可以缓存久一点 (1年)
            extra_args["CacheControl"] = "max-age=31536000"
        elif key.endswith(".html") or key == "favicon.svg" or key.startswith("_posts/"):
            # HTML 文件和 AI 专用分片数据不缓存，确保即时更新
            extra_args["CacheControl"] = "no-cache, no-store, must-revalidate"

        return extra_args

    def _upload_file_sync(self, s3_client: Any, bucket_id: str, file_path: Path, key: str) -> str:
        """同步上传单个文件"""
        try:
            content_type = self._get_content_type(file_path)
            extra_args = self._get_extra_args(key, content_type)

            logger.debug(f"正在上传: {key} ({content_type})")
            s3_client.upload_file(str(file_path), bucket_id, key, ExtraArgs=extra_args, Config=self.transfer_config)
            return key
        except Exception as e:
            logger.error(f"文件上传失败 [{key}]: {e}")
            raise e


if __name__ == "__main__":
    try:
        deployer = StaticSiteDeployer()
        asyncio.run(deployer.deploy())
    except Exception as e:
        logger.error(f"静态站点部署失败: {e}", exc_info=True)
        sys.exit(1)
