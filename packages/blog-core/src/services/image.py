import asyncio
import hashlib
import hmac
import json
import logging
import os
import time
from collections.abc import Iterable
from typing import Any
from urllib.parse import urlparse

import boto3
import httpx
import marko
from botocore.config import Config
from bs4 import BeautifulSoup, Tag
from config import settings
from marko.block import HTMLBlock
from marko.inline import Image, InlineHTML
from marko.md_renderer import MarkdownRenderer
from services.cache import image_cache

logger = logging.getLogger(__name__)


class ImageService:
    markdown: marko.Markdown
    semaphore: asyncio.Semaphore

    def __init__(self) -> None:
        # 初始化 Marko，使用 Markdown 渲染器
        self.markdown = marko.Markdown(renderer=MarkdownRenderer)
        # 限制单篇文章内并行下载/上传图片的数量，防止内存激增
        self.semaphore = asyncio.Semaphore(settings.MAX_IMAGE_CONCURRENCY)

    async def process_content(self, content: str) -> str:
        """
        处理 Markdown 内容中的图片：
        1. 解析 AST
        2. 提取所有图片链接 (Markdown Image 和 HTML img 标签)
        3. 下载并上传到图床 (目前仅模拟)
        4. 替换 AST 中的链接
        5. 重新渲染为 Markdown
        """
        if not content:
            return ""

        try:
            # 1. 解析 AST
            parsed: Any = self.markdown.parse(content)

            # 2. 遍历 AST 并处理图片
            # 我们需要收集所有的异步上传任务，但在遍历 AST 时很难直接 await
            # 所以这里采用先收集节点，再批量处理的策略

            nodes_to_process: list[dict[str, Any]] = []

            # 重写遍历逻辑：Marko 没有内置通用的 visitor，
            # 我们需要自己写一个简单的递归查找
            self._find_image_nodes(parsed, nodes_to_process)

            if not nodes_to_process:
                return content

            # 3. 并行处理所有图片节点
            async def task(item: dict[str, Any]) -> None:
                node: Any = item["node"]
                original_url: str = item["url"]

                async with self.semaphore:
                    new_url = await self._process_single_image(original_url)

                # 4. 更新 AST 节点
                if item["type"] == "markdown":
                    node.dest = new_url
                elif item["type"] == "html":
                    soup = BeautifulSoup(node.children, "html.parser")
                    img_tag = soup.find("img")
                    if isinstance(img_tag, Tag) and img_tag.get("src"):
                        img_tag["src"] = new_url
                        node.children = str(soup)

            # 使用 gather 并行执行，semaphore 会确保同时活跃的下载任务不超过 3 个
            await asyncio.gather(*(task(item) for item in nodes_to_process))

            # 5. 重新渲染
            return str(self.markdown.render(parsed))

        except Exception as e:
            logger.error(f"处理图片失败: {e}")
            # 如果出错，返回原始内容以保证安全
            return content

    def _find_image_nodes(self, element: Any, nodes: list[dict[str, Any]]) -> None:
        """
        递归遍历 AST 查找图片节点
        """
        # 检查当前节点是否是图片
        if isinstance(element, Image):
            nodes.append({"type": "markdown", "node": element, "url": element.dest})

        # 检查当前节点是否是 HTML (RawHTML, InlineHTML, HTMLBlock)
        elif isinstance(element, (InlineHTML, HTMLBlock)):
            # 解析 HTML 检查是否包含 img 标签
            # element.children 对于 HTML 节点通常是字符串内容
            if isinstance(element.children, str):
                soup = BeautifulSoup(element.children, "html.parser")
                img_tag = soup.find("img")
                if isinstance(img_tag, Tag) and img_tag.get("src"):
                    nodes.append({"type": "html", "node": element, "url": str(img_tag["src"])})

        # 递归遍历子节点
        # Marko 的 element 如果有 children 属性，可能是 list 或其他元素
        if hasattr(element, "children"):
            children: Any = element.children
            if isinstance(children, list):
                for child in children:
                    self._find_image_nodes(child, nodes)
            elif hasattr(children, "children"):  # 单个子节点对象
                self._find_image_nodes(children, nodes)

    async def _process_single_image(self, url: str) -> str:  # noqa: C901
        """
        下载并上传单个图片
        """
        # 1. 检查是否跳过
        if settings.DOGECLOUD_DOMAIN and settings.DOGECLOUD_DOMAIN in url:
            return url

        # 2. 检查缓存
        # 2.1 如果已经成功上传过，直接返回新链接
        cached_url = image_cache.get_success(url)
        if cached_url:
            logger.debug(f"命中图片缓存: {url} -> {cached_url}")
            return cached_url

        # 2.2 如果失败次数超过 3 次，跳过处理
        fail_count = image_cache.get_failure_count(url)
        if fail_count > 3:
            logger.warning(f"图片处理失败次数过多 ({fail_count}), 跳过: {url}")
            return url

        # 必须配置了完整的凭证才执行下载和上传
        if not all(
            [
                settings.DOGECLOUD_ACCESS_KEY,
                settings.DOGECLOUD_SECRET_KEY,
                settings.DOGECLOUD_BUCKET,
            ]
        ):
            return url

        logger.debug(f"正在处理图片: {url}")

        try:
            # 3. 下载图片
            # 采用通用策略：Referer 设置为图片自身的域名 (Origin)，尝试绕过简单的防盗链
            parsed_url = urlparse(url)
            origin_referer = f"{parsed_url.scheme}://{parsed_url.netloc}/"

            headers: dict[str, str] = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",  # noqa: E501
                "Referer": origin_referer,
            }

            async with httpx.AsyncClient(verify=False, timeout=30.0, follow_redirects=True) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                image_data: bytes = resp.content
                content_type: str = resp.headers.get("content-type", "image/jpeg")

            # 4. 确定文件名
            # parsed_url 已在上面解析
            filename = os.path.basename(parsed_url.path)

            if not filename or "." not in filename:
                # 简单推断扩展名
                ext = ".jpg"
                if "png" in content_type:
                    ext = ".png"
                elif "gif" in content_type:
                    ext = ".gif"
                elif "webp" in content_type:
                    ext = ".webp"
                # 分行以缩短长度
                filename_hash = hashlib.md5(url.encode()).hexdigest()[:8]
                filename = f"{int(time.time())}_{filename_hash}{ext}"
            else:
                # 加上时间戳防止重名
                name, ext = os.path.splitext(filename)
                filename = f"{name}_{int(time.time())}{ext}"

            # 5. 上传到 DogeCloud
            new_url = await self.upload_image(image_data, filename, content_type)
            if new_url:
                logger.info(f"图片处理成功: {url} -> {new_url}")
                # 记录成功缓存
                image_cache.mark_success(url, new_url)
                return new_url
            else:
                return url

        except Exception as e:
            logger.error(f"处理单张图片失败 [{url}]: {e}")
            # 记录失败缓存
            image_cache.mark_failure(url)
            return url

    async def upload_image(
        self,
        image_data: bytes,
        filename: str,
        content_type: str,
    ) -> str:
        """
        上传图片到 DogeCloud
        """
        if not all(
            [
                settings.DOGECLOUD_ACCESS_KEY,
                settings.DOGECLOUD_SECRET_KEY,
                settings.DOGECLOUD_BUCKET,
            ]
        ):
            logger.warning("未配置 DogeCloud 凭证，跳过上传")
            return ""

        try:
            # 1. 获取临时密钥 (运行在线程中以避免阻塞)
            credentials = await asyncio.to_thread(self._get_doge_token)
            if not credentials:
                return ""

            creds: dict[str, Any] | None = credentials.get("credentials")
            if not creds:
                return ""

            # 2. 初始化 S3 客户端并上传 (运行在线程中)
            s3_endpoint: str | None = credentials.get("s3Endpoint")
            s3_bucket: str | None = credentials.get("s3Bucket")

            def _sync_upload() -> str:
                s3: Any = boto3.client(
                    "s3",
                    aws_access_key_id=creds["accessKeyId"],
                    aws_secret_access_key=creds["secretAccessKey"],
                    aws_session_token=creds["sessionToken"],
                    endpoint_url=s3_endpoint,
                    config=Config(s3={"addressing_style": "virtual"}, signature_version="s3v4"),
                )

                # 使用 put_object 直接上传 bytes 数据
                s3.put_object(
                    Bucket=s3_bucket,
                    Key=filename,
                    Body=image_data,
                    ContentType=content_type,
                )
                return filename

            await asyncio.to_thread(_sync_upload)

            # 3. 构造返回链接
            # 如果配置了自定义域名，使用自定义域名
            if settings.DOGECLOUD_DOMAIN:
                # 确保域名末尾没有 /
                domain = settings.DOGECLOUD_DOMAIN.rstrip("/")
                return f"{domain}/{filename}"

            # 否则使用 endpoint 拼接
            return f"{s3_endpoint}/{filename}"

        except Exception as e:
            logger.error(f"DogeCloud 上传失败: {e}")
            return ""

    def _get_doge_token(self) -> dict[str, Any] | None:
        """
        获取多吉云临时上传凭证 (同步方法，被 async 包装调用)
        """
        access_key = settings.DOGECLOUD_ACCESS_KEY
        secret_key = settings.DOGECLOUD_SECRET_KEY
        bucket = settings.DOGECLOUD_BUCKET

        if not (access_key and secret_key and bucket):
            return None

        # 简单封装 dogecloud_api 逻辑
        api_path = "/auth/tmp_token.json"
        data = {
            "channel": "OSS_UPLOAD",
            "scopes": [f"{bucket}:*"],  # 允许上传到该 bucket 下的任意文件
        }

        body = json.dumps(data)
        sign_str = api_path + "\n" + body

        signed_data = hmac.new(secret_key.encode("utf-8"), sign_str.encode("utf-8"), hashlib.sha1)
        sign = signed_data.digest().hex()
        authorization = f"TOKEN {access_key}:{sign}"

        try:
            # 使用同步的 httpx 调用，因为这个函数在 thread 里面运行
            resp = httpx.post(
                "https://api.dogecloud.com" + api_path,
                content=body,  # 使用 content 发送 raw body
                headers={
                    "Authorization": authorization,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            resp_data: dict[str, Any] = resp.json()

            if resp_data.get("code") != 200:
                logger.error(f"DogeCloud API Error: {resp_data.get('msg')}")
                return None

            res_data: dict[str, Any] = resp_data.get("data", {})
            # 找到对应 bucket 的 info
            target_bucket_info: dict[str, Any] | None = None
            buckets: Iterable[dict[str, Any]] = res_data.get("Buckets", [])
            for b in buckets:
                # 简单起见，取第一个 bucket
                target_bucket_info = b
                break

            if not target_bucket_info:
                logger.error("DogeCloud Token: No bucket info found")
                return None

            return {
                "credentials": res_data.get("Credentials"),
                "s3Endpoint": target_bucket_info.get("s3Endpoint"),
                "s3Bucket": target_bucket_info.get("s3Bucket"),
            }

        except Exception as e:
            logger.error(f"获取 DogeCloud Token 异常: {e}")
            return None
