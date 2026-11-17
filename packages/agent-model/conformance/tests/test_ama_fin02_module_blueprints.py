"""FIN-02: blueprint module preflight regression, no agent instance construction."""
import copy,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/"packages/agent-model/conformance"))
from ama_fin02_module_blueprints import compose

class BlueprintTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inv=json.loads((ROOT/"packages/agent-model/ama-template-coverage.json").read_text())
        cls.cat=json.loads((ROOT/"packages/agent-model/ama-v1-module-contract-catalog.json").read_text())
    def test_32_candidate_blueprints_remain_non_authorizing(self):
        r=compose(self.inv,self.cat)
        self.assertEqual((r["module_count"],r["core_count"],r["optional_count"]),(32,13,19))
        self.assertEqual(r["findings"],[])
        self.assertEqual(r["verified_complete"],0)
        self.assertFalse(r["agent_constructed"])
        self.assertFalse(r["agent_activation_authorized"])
        self.assertTrue(all(m["technical_disposition"]=="HOLD" for m in r["module_blueprints"]))
    def test_optional_off_by_default(self):
        r=compose(self.inv,self.cat)
        self.assertTrue(all(not x["default_enabled"] for x in r["module_blueprints"] if x["classification"]=="OPTIONAL"))
    def test_core_module_disabled_is_rejected(self):
        c=copy.deepcopy(self.cat)
        c["modules"][0]["default_enabled"]=False
        self.assertIn("UNSAFE_DEFAULT:identity",compose(self.inv,c)["findings"])
    def test_denial_case_removed_is_rejected(self):
        c=copy.deepcopy(self.cat)
        c["modules"][0]["mandatory_denial_case"]=""
        self.assertIn("MISSING_NORMATIVE_DENIAL:identity",compose(self.inv,c)["findings"])
    def test_forged_complete_still_blocks(self):
        c=copy.deepcopy(self.cat)
        c["modules"][0]["release_claim"]="COMPLETE"
        self.assertIn("UNATTESTED_COMPLETION_PROHIBITED:identity",compose(self.inv,c)["findings"])
    def test_missing_module_fails_inventory_gate(self):
        c=copy.deepcopy(self.cat)
        c["modules"].pop()
        self.assertIn("NOT_EXACT_CANONICAL_32_MODULES",compose(self.inv,c)["findings"])
    def test_missing_sources_remain_explicit_blockers(self):
        r=compose(self.inv,self.cat)
        x=next(x for x in r["module_blueprints"] if x["module_id"]=="identity")
        self.assertIn("SOURCE_CONTRACT_UNMAPPED",x["evidence_blockers"])

if __name__=="__main__":
    unittest.main()
