"""AMA M0-M7 plus F8 regression tests using the existing requirement evidence."""
import copy
import json
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE))
from ama_milestone_integrity import inspect, load


def fixtures():
    def read(path):
        return json.loads((ROOT / path).read_text(encoding="utf-8"))
    return [
        read("packages/agent-model/ama-milestones.json"),
        read("packages/agent-model/ama-template-coverage.json"),
        read("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json"),
        read("docs/research/AMA-96-REQUIREMENT-COVERAGE-INDEX-2026-10-29.json"),
    ]


class CanonicalMilestoneTests(unittest.TestCase):
    def test_all_original_source_requirements(self):
        report = load()
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["stage_count"], 8)
        self.assertEqual(report["source_requirement_count"], 96)
        self.assertEqual(report["f8"], "OPTIONAL_CDX_HOST_INTEGRATION")
        self.assertFalse(report["template_complete"])

    def test_f8_cannot_become_m8(self):
        items = fixtures()
        items[0]["milestone_order"].append("M8")
        self.assertIn("M0_M7_ORDER", inspect(*items)["errors"])

    def test_host_binding_cannot_become_template_prerequisite(self):
        items = fixtures()
        items[0]["f8"]["production_binding_required_for_template"] = True
        self.assertIn("F8_REQUIRED_FOR_TEMPLATE", inspect(*items)["errors"])

    def test_32_module_inventory_cannot_become_parallel_framework(self):
        items = fixtures()
        items[1]["coverage_policy"] = "NEW_32_STAGE_ARCHITECTURE"
        self.assertIn("UNAUTHORIZED_NEW_FRAMEWORK", inspect(*items)["errors"])

    def test_missing_original_requirement_is_detected(self):
        items = fixtures()
        items[2]["items"].pop()
        self.assertIn("DECISION_REGISTER_96", inspect(*items)["errors"])
        self.assertIn("SOURCE_REGISTER_MISMATCH", inspect(*items)["errors"])

    def test_unmapped_module_is_detected(self):
        items = fixtures()
        items[1]["modules"][0]["milestone"] = "M8"
        self.assertTrue(any(x.startswith("UNMAPPED_MODULE")
                            for x in inspect(*items)["errors"]))

    def test_package_to_milestone_drift_is_detected(self):
        items = fixtures()
        items[0]["milestones"]["M3"]["source_packages"] = ["F4"]
        self.assertIn("SOURCE_PACKAGE:M3", inspect(*items)["errors"])

    def test_source_candidate_cannot_be_counted_as_completed_automatically(self):
        items = fixtures()
        self.assertFalse(inspect(*items)["template_complete"])


if __name__ == "__main__":
    unittest.main()
