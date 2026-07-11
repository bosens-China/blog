# pyright: reportMissingImports=false

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from scripts.deploy_static import StaticSiteDeployer  # noqa: E402


class StaticSiteDeployerTest(unittest.TestCase):
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
