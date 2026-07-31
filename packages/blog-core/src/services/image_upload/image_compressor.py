from dataclasses import dataclass
from io import BytesIO

from PIL import Image, UnidentifiedImageError


@dataclass(frozen=True)
class CompressedImage:
    data: bytes
    content_type: str
    extension: str


def compress_static_image(
    data: bytes,
    *,
    minimum_bytes: int,
    max_dimension: int,
    quality: int,
    minimum_savings_ratio: float,
) -> CompressedImage | None:
    """将足够大的静态位图压缩为高质量 WebP；动图和无收益结果保持原样。"""
    if len(data) < minimum_bytes:
        return None

    try:
        with Image.open(BytesIO(data)) as image:
            if getattr(image, "is_animated", False) or image.format == "GIF":
                return None
            compressed_data = _compress_static_webp(
                image,
                max_dimension=max_dimension,
                quality=quality,
            )
    except (OSError, UnidentifiedImageError):
        return None

    if len(compressed_data) > len(data) * (1 - minimum_savings_ratio):
        return None

    return CompressedImage(data=compressed_data, content_type="image/webp", extension=".webp")


def _compress_static_webp(image: Image.Image, *, max_dimension: int, quality: int) -> bytes:
    has_alpha = image.mode in {"LA", "RGBA"} or "transparency" in image.info
    working_image = image.convert("RGBA" if has_alpha else "RGB")
    working_image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    output = BytesIO()
    if has_alpha:
        working_image.save(output, format="WEBP", lossless=True, method=6)
    else:
        working_image.save(output, format="WEBP", quality=quality, method=6)
    return output.getvalue()


def should_keep_animated_source_url(data: bytes, *, max_upload_bytes: int) -> bool:
    """判断大动图是否应跳过转存，避免它阻塞构建。"""
    if len(data) <= max_upload_bytes:
        return False

    try:
        with Image.open(BytesIO(data)) as image:
            return bool(getattr(image, "is_animated", False))
    except (OSError, UnidentifiedImageError):
        return False
