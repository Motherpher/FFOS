"""Offline, source-controlled regression tests for WP04 reconciliation."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "estate"))
from reconcile import SnapshotError, audit  # noqa: E402

BASE = ROOT / "docs" / "governance" / "github-estate" / "data"


class EstateSnapshotTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.adoption = json.loads((BASE / "estate-adoption-register-v1.json").read_text(encoding="utf-8"))
        cls.project = json.loads((BASE / "portfolio-snapshot-2026-11-03.json").read_text(encoding="utf-8"))

    def project_copy(self):
        return copy.deepcopy(self.project)

    def test_actual_baseline_is_parseable_and_no_blockers(self):
        report = audit(self.adoption, self.project)
        self.assertEqual(report["observations"]["registered_repositories"], 31)
        self.assertEqual(report["observations"]["project_items"], 22)
        self.assertEqual(report["alerts_by_severity"]["BLOCKER"], 0)
        self.assertIn(report["status"], ("PASS", "PASS_WITH_WARNINGS"))

    def test_duplicate_source_identity_rejected(self):
        p = self.project_copy()
        p["items"].append(copy.deepcopy(p["items"][0]))
        p["metrics"]["items"] += 1
        with self.assertRaises(SnapshotError):
            audit(self.adoption, p)

    def test_auto_close_fails_closed(self):
        p = self.project_copy()
        workflow = next(x for x in p["workflows"] if x["name"] == "Auto-close issue")
        workflow["enabled"] = True
        out = audit(self.adoption, p)
        self.assertEqual(out["status"], "HOLD")
        self.assertIn("AUTO_CLOSE_UNSAFE", [a["code"] for a in out["alerts"]])

    def test_approval_without_source_fails_closed(self):
        p = self.project_copy()
        row = p["items"][0]
        row["fields"]["Work Stage"] = "Accepted"
        row["fields"]["Authority Gate"] = "Approved (Source Recorded)"
        row["fields"]["Evidence Reference"] = ""
        out = audit(self.adoption, p)
        self.assertEqual(out["status"], "HOLD")
        self.assertIn("ACCEPTANCE_WITHOUT_SOURCE", [a["code"] for a in out["alerts"]])

    def test_unregistered_repository_blocks_reconciliation(self):
        p = self.project_copy()
        p["items"][0]["repository"] = "Example/NotInEstate"
        out = audit(self.adoption, p)
        self.assertEqual(out["status"], "HOLD")
        self.assertIn("UNREGISTERED_REPOSITORY", [a["code"] for a in out["alerts"]])

    def test_project_must_be_private(self):
        p = self.project_copy()
        p["visibility"] = "public"
        self.assertEqual(audit(self.adoption, p)["status"], "HOLD")

    def test_detects_item_add_remove_and_field_changes(self):
        prev = self.project_copy()
        prev["items"] = prev["items"][1:]  # one item added in current
        prev["metrics"]["items"] -= 1
        prev["items"][0]["fields"]["Work Stage"] = "Ready"
        report = audit(self.adoption, self.project, prev)
        self.assertEqual(len(report["delta"]["added"]), 1)
        self.assertEqual(len(report["delta"]["removed"]), 0)
        self.assertGreaterEqual(len(report["delta"]["changed"]), 1)

    def test_schema_mismatch_causes_hold(self):
        p = self.project_copy()
        p["schema"] = "unknown"
        with self.assertRaises(SnapshotError):
            audit(self.adoption, p)


if __name__ == "__main__":
    unittest.main()
