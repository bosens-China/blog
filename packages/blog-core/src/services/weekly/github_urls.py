from urllib.parse import urlparse


def github_blob_to_raw(url: str) -> str:
    parsed = urlparse(url)
    if parsed.netloc != "github.com":
        return url

    parts = parsed.path.strip("/").split("/")
    if len(parts) < 5 or parts[2] != "blob":
        return url

    owner, repo, _, branch = parts[:4]
    file_path = "/".join(parts[4:])
    return f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{file_path}"


def github_readme_raw_to_report(raw_url: str) -> str:
    if raw_url.endswith("/README.md"):
        return f"{raw_url.rsplit('/', 1)[0]}/report.json"
    return raw_url
