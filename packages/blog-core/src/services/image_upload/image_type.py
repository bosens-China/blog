import mimetypes


def get_image_extension(data: bytes, content_type: str) -> str | None:
    """根据图片魔数和 Content-Type 推断文件扩展名。"""
    magic_map = [
        (b"\xff\xd8\xff", ".jpg"),
        (b"\x89PNG\r\n\x1a\n", ".png"),
        (b"GIF87a", ".gif"),
        (b"GIF89a", ".gif"),
        (b"BM", ".bmp"),
        (b"\x00\x00\x01\x00", ".ico"),
        (b"II*\x00", ".tiff"),
        (b"MM\x00*", ".tiff"),
    ]

    for magic, ext in magic_map:
        if data.startswith(magic):
            return ext

    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return ".webp"
    if len(data) > 12 and data[4:12] == b"ftypavif":
        return ".avif"

    start_bytes = data[:512].strip()
    if start_bytes.startswith(b"<svg") or b"<svg" in start_bytes:
        return ".svg"

    if content_type == "application/octet-stream":
        return None

    ext = mimetypes.guess_extension(content_type)
    if ext:
        if ext == ".bin":
            return None
        if ext == ".jpeg":
            return ".jpg"
        return ext
    return None
