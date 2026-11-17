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


    def test_forged_all_verified_strings_require_independent_attestation(self):
        catalog=copy.deepcopy(self.catalog)
        entry=catalog["modules"][0]
        entry["release_claim"]="COMPLETE"
        entry["verification"]={k:"VERIFIED_EXECUTED" for k in ("contract","negative","migration","blueprint")}
        report=audit(self.inventory,catalog)
        self.assertEqual(report["verified_complete"],0)
        self.assertIn("MISSING_IMMUTABLE_HEAD:identity",report["findings"])

    def test_exact_head_does_not_replace_independent_attestation(self):
        catalog=copy.deepcopy(self.catalog)
        entry=catalog["modules"][0]
        entry["release_claim"]="COMPLETE"
        entry["verification"]={k:"VERIFIED_EXECUTED" for k in ("contract","negative","migration","blueprint")}
        report=audit(self.inventory,catalog,exact_head="a"*40)
        self.assertEqual(report["verified_complete"],0)
        self.assertIn("INDEPENDENT_MODULE_ATTESTATION_REQUIRED:identity",report["findings"])

    def test_attestor_failure_holds_completion(self):
        catalog=copy.deepcopy(self.catalog)
        entry=catalog["modules"][0]
        entry["release_claim"]="COMPLETE"
        entry["verification"]={k:"VERIFIED_EXECUTED" for k in ("contract","negative","migration","blueprint")}
        report=audit(self.inventory,catalog,exact_head="a"*40,
                     evidence_attestor=lambda *args: False)
        self.assertEqual(report["verified_complete"],0)
        self.assertIn("INDEPENDENT_MODULE_ATTESTATION_FAILED:identity",report["findings"])

    def test_attestor_exception_fails_closed(self):
        catalog=copy.deepcopy(self.catalog)
        entry=catalog["modules"][0]
        entry["release_claim"]="COMPLETE"
        entry["verification"]={k:"VERIFIED_EXECUTED" for k in ("contract","negative","migration","blueprint")}
        def unavailable(*args):
            raise OSError("independent evidence unavailable")
        report=audit(self.inventory,catalog,exact_head="a"*40,evidence_attestor=unavailable)
        self.assertEqual(report["verified_complete"],0)
        self.assertIn("INDEPENDENT_MODULE_ATTESTATION_FAILED:identity",report["findings"])

if __name__=="__main__":
    unittest.main()
