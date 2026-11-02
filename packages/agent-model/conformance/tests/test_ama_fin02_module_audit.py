"""FIN-02 source-only audit regressions; completion cannot be inferred from references."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve()
ROOT = HERE.parents[4]
sys.path.insert(0, str(HERE.parents[1]))
from ama_fin02_module_audit import inspect


class Fin02ModuleAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inventory = json.loads((ROOT / "packages/agent-model/ama-template-coverage.json").read_text())

    def test_all_32_have_individual_dispositions(self):
        report = inspect(self.inventory, ROOT)
        self.assertEqual(report["count"], 32)
        self.assertEqual(report["core_count"], 13)
        self.assertEqual(report["optional_count"], 19)
        self.assertEqual(report["completed_verified"], 0)
        self.assertFalse(report["director_acceptance"])
        self.assertEqual(len({x["id"] for x in report["module_assessments"]}), 32)

    def test_complete_claim_cannot_self_certify(self):
        data = copy.deepcopy(self.inventory)
        data["modules"][0]["implementation_status"] = "COMPLETE"
        report = inspect(data, ROOT)
        self.assertIn("UNSUPPORTED_COMPLETE_CLAIM:identity", report["structural_findings"])
        self.assertEqual(report["run_status"], "FAIL")

    def test_missing_contract_fails_closed(self):
        data = copy.deepcopy(self.inventory)
        data["modules"][0]["evidence_contract"] = "missing/not-a-real-contract.schema.json"
        report = inspect(data, ROOT)
        self.assertTrue(any(x.startswith("MISSING_CONTRACT:identity:") for x in report["structural_findings"]))

    def test_duplicate_module_fails_closed(self):
        data = copy.deepcopy(self.inventory)
        data["modules"][1]["id"] = data["modules"][0]["id"]
        report = inspect(data, ROOT)
        self.assertIn("INVALID_32_MODULE_INVENTORY", report["structural_findings"])


if __name__ == "__main__":
    unittest.main()
