import asyncio

from src.core.config import settings

llm_semaphore = asyncio.Semaphore(settings.LLM_MAX_CONCURRENCY)
