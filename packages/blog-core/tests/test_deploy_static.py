# pyright: reportMissingImports=false

import asyncio
import sys
import tempfile
import unittest
from datetime import UTC, datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from scripts.deploy_static import StaticSiteDeployer  # noqa: E402
from scripts.static_cleanup import cleanup_stale_objects  # noqa: E402


class StaticSiteDeployerTest(unittest.TestCase):
    def test_cleanup_includes_historical_objects_and_preserves_recent_assets(self) -> None:
        s3 = Mock()
        old = datetime.now(UTC) - timedelta(days=2)
        recent = datetime.now(UTC)
        s3.list_objects.side_effect = [
            {
                "IsTruncated": True,
                "NextMarker": "old.html",
                "Contents": [
                    {"Key": "index.html"},
                    {"Key": "old.html"},
                    {"Key": "_astro/old.js", "LastModified": old},
                ],
            },
            {
                "IsTruncated": False,
                "Contents": [
                    {"Key": "_astro/recent.js", "LastModified": recent},
                    {"Key": "demos/recent.html", "LastModified": recent},
                    {"Key": "_deploy/manifest.json"},
                    {"Key": "_posts/deleted.json"},
                ],
            },
        ]
        retained = cleanup_stale_objects(
            s3, "bucket", {"index.html", "_deploy/manifest.json"}, {"_astro/old.js": old.timestamp()}, 2
        )
        self.assertEqual(set(retained), {"_astro/recent.js", "demos/recent.html"})
        self.assertEqual(
            {call.kwargs["Key"] for call in s3.delete_object.call_args_list},
            {"old.html", "_astro/old.js", "_posts/deleted.json"},
        )
        self.assertEqual(s3.list_objects.call_args.kwargs["Marker"], "old.html")

    def test_cleanup_rejects_incomplete_build_and_invalid_pagination(self) -> None:
        s3 = Mock()
        with self.assertRaises(ValueError):
            cleanup_stale_objects(s3, "bucket", set(), {}, 1)
        s3.list_objects.return_value = {"IsTruncated": True, "Contents": []}
        with self.assertRaises(RuntimeError):
            cleanup_stale_objects(s3, "bucket", {"index.html"}, {}, 1)
        s3.delete_object.assert_not_called()

    def test_asset_retention_starts_when_removed_from_build(self) -> None:
        s3 = Mock()
        s3.list_objects.return_value = {
            "Contents": [{"Key": "_astro/old.js", "LastModified": datetime(2020, 1, 1, tzinfo=UTC)}]
        }
        with patch("scripts.static_cleanup.time.time", return_value=100_000):
            retired = cleanup_stale_objects(s3, "bucket", {"index.html"}, {}, 1)
        self.assertEqual(retired, {"_astro/old.js": 100_000})
        s3.delete_object.assert_not_called()
        with patch("scripts.static_cleanup.time.time", return_value=100_000 + 25 * 60 * 60):
            self.assertEqual(cleanup_stale_objects(s3, "bucket", {"index.html"}, retired, 1), {})
        s3.delete_object.assert_called_once_with(Bucket="bucket", Key="_astro/old.js")

    def test_failed_upload_or_cleanup_does_not_publish_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            index = Path(directory) / "index.html"
            index.write_text("首页", encoding="utf-8")
            for upload_fails in (True, False):
                with self.subTest(upload_fails=upload_fails):
                    deployer = StaticSiteDeployer.__new__(StaticSiteDeployer)
                    deployer.dist_dir = Path(directory)
                    deployer.bucket_name = "bucket"
                    deployer.max_workers = 1
                    s3 = Mock()
                    deployer.get_s3_client = Mock(return_value=s3)
                    deployer._collect_files = Mock(return_value=[(index, "index.html")])
                    deployer._load_manifest = Mock(return_value=({}, {}))
                    deployer._save_manifest = Mock()
                    deployer._upload_files = AsyncMock(return_value=[RuntimeError("上传失败")] if upload_fails else [])
                    token = {"credentials": {}, "s3Endpoint": "endpoint", "s3Bucket": "bucket"}
                    with (
                        patch("scripts.deploy_static.get_doge_token", return_value=token),
                        patch(
                            "scripts.deploy_static.cleanup_stale_objects", side_effect=RuntimeError("删除失败")
                        ) as clean,
                    ):
                        with self.assertRaises(RuntimeError):
                            asyncio.run(deployer.deploy())
                        if upload_fails:
                            clean.assert_not_called()
                        else:
                            clean.assert_called_once()
                    deployer._save_manifest.assert_not_called()
                    s3.close.assert_called_once()

    def test_fingerprint_detects_content_and_header_changes(self) -> None:
        deployer = StaticSiteDeployer.__new__(StaticSiteDeployer)

        with tempfile.TemporaryDirectory() as directory:
            file_path = Path(directory) / "index.html"
            file_path.write_text("alpha", encoding="utf-8")

            original = deployer._fingerprint_file(file_path, "index.html")
            self.assertEqual(original, deployer._fingerprint_file(file_path, "index.html"))

            file_path.write_text("bravo", encoding="utf-8")
            self.assertNotEqual(original, deployer._fingerprint_file(file_path, "index.html"))
            self.assertNotEqual(
                deployer._fingerprint_file(file_path, "index.html"),
                deployer._fingerprint_file(file_path, "_astro/index.html"),
            )


if __name__ == "__main__":
    unittest.main()
