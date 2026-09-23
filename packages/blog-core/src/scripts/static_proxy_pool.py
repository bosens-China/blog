import ipaddress
import logging
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlsplit

import httpx

logger = logging.getLogger("static_deploy")

DEFAULT_PROXY_SOURCE = "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/countries/CN/data.txt"
MAX_CANDIDATES = 30
PROBE_BATCH_SIZE = 10
MAX_SELECTED_PROXIES = 4


def _normalize_proxy(value: str) -> str | None:
    try:
        proxy = urlsplit(value if "://" in value else f"http://{value}")
        address = ipaddress.ip_address(proxy.hostname or "")
        if (
            proxy.scheme not in {"http", "https"}
            or not isinstance(address, ipaddress.IPv4Address)
            or not address.is_global
            or not proxy.port
            or proxy.username
            or proxy.password
            or proxy.path not in {"", "/"}
            or proxy.query
            or proxy.fragment
        ):
            return None
        return f"{proxy.scheme}://{address}:{proxy.port}"
    except ValueError:
        return None


def _load_proxies(source: str) -> list[str]:
    parsed = urlsplit(source)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("代理来源必须是 HTTPS 地址，且不能包含凭证")

    response = httpx.get(source, timeout=10.0, follow_redirects=True, trust_env=False)
    response.raise_for_status()
    if response.url.scheme != "https":
        raise ValueError("代理来源跳转到了非 HTTPS 地址")
    if len(response.content) > 2 * 1024 * 1024:
        raise ValueError("代理列表超过 2 MiB")
    return list(dict.fromkeys(filter(None, (_normalize_proxy(value) for value in response.text.split()))))


def select_proxies(probe: Callable[[str], float], source: str = DEFAULT_PROXY_SOURCE) -> list[str]:
    """从公开代理列表中选出实际上传成功且耗时较低的节点。"""
    candidates = _load_proxies(source)
    logger.info("代理来源读取完成，共 %s 个候选", len(candidates))
    successful: list[tuple[float, str]] = []

    for offset in range(0, min(len(candidates), MAX_CANDIDATES), PROBE_BATCH_SIZE):
        batch = candidates[offset : offset + PROBE_BATCH_SIZE]
        with ThreadPoolExecutor(max_workers=len(batch)) as executor:
            futures = {executor.submit(probe, address): address for address in batch}
            for future in as_completed(futures):
                try:
                    successful.append((future.result(), futures[future]))
                except Exception:
                    continue
        logger.info("代理筛选：%s/%s 个可用", len(successful), offset + len(batch))
        if len(successful) >= MAX_SELECTED_PROXIES:
            break

    return [address for _, address in sorted(successful)[:MAX_SELECTED_PROXIES]]
