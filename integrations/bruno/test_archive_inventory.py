#!/usr/bin/env python3
"""Offline regression tests for safe Bruno archive manifest generation."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parent / "archive_inventory.py"
spec = importlib.util.spec_from_file_location("bruno_archive_inventory", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class ArchiveInventoryTests(unittest.TestCase):
    def make_root(self, base):
        root = Path(base) / "collection"
        root.mkdir()
        (root / "opencollection.yml").write_text("opencollection: 1.0.0\n", encoding="utf-8")
        return root

    def test_manifest_deterministic_and_no_contents(self):
        with tempfile.TemporaryDirectory() as base:
            root = self.make_root(base)
            (root / "02 Example.yml").write_text("http:\n  method: GET\n", encoding="utf-8")
            first = module.inventory(root)
            self.assertEqual(first, module.inventory(root))
            self.assertEqual(first["count"], 2)
            self.assertEqual([e["path"] for e in first["files"]], ["02 Example.yml", "opencollection.yml"])
            self.assertNotIn("method: GET", str(first))

    def test_environment_rejected(self):
        with tempfile.TemporaryDirectory() as base:
            root = self.make_root(base)
            folder = root / "environments"
            folder.mkdir()
            (folder / "Development.yml").write_text("api_key: confidentialvalue\n")
            with self.assertRaisesRegex(ValueError, "Restricted path"):
                module.inventory(root)

    def test_bearer_token_rejected(self):
        with tempfile.TemporaryDirectory() as base:
            root = self.make_root(base)
            (root / "request.yml").write_text("Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456\n")
            with self.assertRaisesRegex(ValueError, "embedded secret"):
                module.inventory(root)

    def test_placeholder_allowed(self):
        with tempfile.TemporaryDirectory() as base:
            root = self.make_root(base)
            (root / "request.yml").write_text("api_key: {{scb_afr_api_key}}\n")
            self.assertEqual(module.inventory(root)["count"], 2)

    def test_symlink_rejected(self):
        with tempfile.TemporaryDirectory() as base:
            root = self.make_root(base)
            (root / "pointer.yml").symlink_to(root / "opencollection.yml")
            with self.assertRaisesRegex(ValueError, "Symlink"):
                module.inventory(root)

    def test_raw_payload_rejected(self):
        with tempfile.TemporaryDirectory() as base:
            root = self.make_root(base)
            (root / "raw.csv").write_text("personal,content\n")
            with self.assertRaisesRegex(ValueError, "Unapproved file"):
                module.inventory(root)

if __name__ == "__main__":
    unittest.main()
