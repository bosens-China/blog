from typing import Any


def format_project_meta(label: str, value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        return ""
    return f"- {label} {value.strip()}"


def render_report_item_markdown(item: dict[str, Any]) -> list[str]:
    lines: list[str] = []
    repo = item.get("repo") if isinstance(item.get("repo"), str) else ""
    url = item.get("url") if isinstance(item.get("url"), str) else ""
    heading = f"[{repo}]({url})" if repo and url else repo or url
    if heading:
        lines.extend([f"### {heading}", ""])

    meta_lines = [
        format_project_meta("⭐ 总 star", item.get("total_stars")),
        format_project_meta("🔥 本周 star", item.get("period_stars")),
        format_project_meta("💻", item.get("language")),
        format_project_meta("🔗 官网：", item.get("homepage")),
    ]
    lines.extend([line for line in meta_lines if line])
    if any(meta_lines):
        lines.append("")

    image = item.get("image")
    if isinstance(image, str) and image:
        lines.extend([f"![]({image})", ""])

    summary = item.get("summary") if isinstance(item.get("summary"), str) else ""
    description = item.get("description") if isinstance(item.get("description"), str) else ""
    content = summary or description
    if content:
        lines.extend([content, ""])

    tags = item.get("tags")
    if isinstance(tags, list):
        tag_line = " ".join(f"`#{tag}`" for tag in tags if isinstance(tag, str) and tag)
        if tag_line:
            lines.extend([tag_line, ""])

    return lines


def render_report_markdown(
    report: dict[str, Any],
    categories: list[dict[str, Any]],
    title: str,
    date_slug: str,
) -> str:
    lines = [f"# {title}", ""]

    for category in categories:
        name = category.get("name")
        if not isinstance(name, str) or not name:
            continue

        lines.extend([f"## {name}", ""])
        items = category.get("items")
        if not isinstance(items, list):
            continue

        for item in items:
            if isinstance(item, dict):
                lines.extend(render_report_item_markdown(item))

    return "\n".join(lines).strip() + "\n"
