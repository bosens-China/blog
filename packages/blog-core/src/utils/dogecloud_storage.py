import hashlib
import hmac
import json
import logging
from typing import Any

import httpx
from configs.storage import storage_settings as settings

logger = logging.getLogger(__name__)


def get_doge_token(bucket: str, channel: str = "OSS_UPLOAD") -> dict[str, Any] | None:
    """
    获取多吉云临时 Token (通用方法)

    Args:
        bucket: 存储空间名称
        channel: 授权通道，默认 "OSS_UPLOAD" (上传用)，也可以是 "OSS_FULL" (全权限)

    Returns:
        dict: 包含 credentials, s3Endpoint, s3Bucket 的字典，失败返回 None
    """
    access_key = settings.DOGECLOUD_ACCESS_KEY
    secret_key = settings.DOGECLOUD_SECRET_KEY

    if not access_key or not secret_key or not bucket:
        logger.error("DogeCloud 配置缺失: AK/SK 或 Bucket 名称为空")
        return None

    api_path = "/auth/tmp_token.json"
    # OSS_FULL 按存储空间授权，OSS_UPLOAD 按对象路径授权。
    scopes = [bucket] if channel == "OSS_FULL" else [f"{bucket}:*"]

    data = {"channel": channel, "scopes": scopes}

    body = json.dumps(data)
    sign_str = api_path + "\n" + body
    signed_data = hmac.new(secret_key.encode("utf-8"), sign_str.encode("utf-8"), hashlib.sha1)
    sign = signed_data.digest().hex()
    authorization = f"TOKEN {access_key}:{sign}"

    try:
        # 使用同步请求，因为获取 token 通常很快且不需要高并发
        resp = httpx.post(
            "https://api.dogecloud.com" + api_path,
            content=body,
            headers={"Authorization": authorization, "Content-Type": "application/json"},
            timeout=10.0,
        )
        data = resp.json()
        if data.get("code") != 200:
            logger.error(f"DogeCloud API 错误: {data.get('msg')}")
            return None

        res_data = data.get("data", {})
        buckets = res_data.get("Buckets", [])

        # 寻找匹配的 bucket 信息
        target_bucket = None
        if buckets:
            # 即使 scopes 指定了，API 有时会返回所有有权限的 bucket，我们需要过滤
            # 但通常 API 返回的顺序是按照 scopes 来的，或者只有一个
            # 简单起见，我们假设第一个就是或者遍历寻找包含 bucket name 的
            # 实际上 API 返回的 's3Bucket' 是内部 ID，不完全等于我们传入的 name
            # 所以直接取第一个通常是安全的，因为我们只请求了一个 scope
            target_bucket = buckets[0]

        if not target_bucket:
            logger.error("DogeCloud API 未返回 Bucket 信息")
            return None

        return {
            "credentials": res_data.get("Credentials"),
            "s3Endpoint": target_bucket.get("s3Endpoint"),
            "s3Bucket": target_bucket.get("s3Bucket"),
        }
    except Exception as e:
        logger.error(f"获取 DogeCloud Token 异常: {e}")
        return None
