"""AMA FIN-02 module-contract catalog adversarial regressions."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/"packages/agent-model/conformance"))
from ama_fin02_catalog_audit import audit

class CatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inventory=json.loads((ROOT/"packages/agent-model/ama-template-coverage.json").read_text())
        cls.catalog=json.loads((ROOT/"packages/agent-model/ama-v1-module-contract-catalog.json").read_text())

    def test_all_modules_have_candidate_contracts_not_completion(self):
        report=audit(self.inventory,self.catalog)
        self.assertEqual(report["candidate_contracts"],32)
        self.assertEqual(report["verified_complete"],0)
        self.assertEqual(report["findings"],[])
        self.assertEqual(report["status"],"IN_PROGRESS")
        self.assertFalse(report["agent_activation_authorized"])

    def test_missing_module_denied(self):
        catalog=copy.deepcopy(self.catalog)
        catalog["modules"].pop()
        self.assertIn("CATALOG_32_IDENTITY_MISMATCH",audit(self.inventory,catalog)["findings"])

    def test_optional_default_on_denied(self):
        catalog=copy.deepcopy(self.catalog)
        entry=next(x for x in catalog["modules"] if x["id"]=="memory")
        entry["default_enabled"]=True
        self.assertIn("INVALID_DEFAULT:memory",audit(self.inventory,catalog)["findings"])

    def test_forged_completion_denied(self):
        catalog=copy.deepcopy(self.catalog)
        catalog["modules"][0]["release_claim"]="COMPLETE"
        self.assertIn("UNSUPPORTED_COMPLETE:identity",audit(self.inventory,catalog)["findings"])

    def test_missing_denial_contract_denied(self):
        catalog=copy.deepcopy(self.catalog)
        catalog["modules"][0]["mandatory_denial_case"]=""
        self.assertIn("MISSING_NORMATIVE_OR_DENIAL:identity",audit(self.inventory,catalog)["findings"])

    def test_stage_drift_denied(self):
        catalog=copy.deepcopy(self.catalog)
        catalog["modules"][0]["stage"]="M6"
        self.assertIn("STAGE_MISMATCH:identity",audit(self.inventory,catalog)["findings"])

if __name__=="__main__":
    unittest.main()
