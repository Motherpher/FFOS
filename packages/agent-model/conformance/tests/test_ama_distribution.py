"""No named agent instances or fake production claims in AMA distribution."""
import copy,json,sys,unittest
from pathlib import Path
BASE_DIR=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE_DIR))
from ama_distribution import validate
BASE=json.loads((BASE_DIR.parent/"ama-distribution-manifest.json").read_text())
class DistributionTests(unittest.TestCase):
 def test_valid_candidate(self): self.assertEqual(validate(BASE),[])
 def test_not_an_agent(self):
  x=copy.deepcopy(BASE);x["not_an_agent"]=False;self.assertTrue(validate(x))
 def test_no_premature_release(self):
  x=copy.deepcopy(BASE);x["status"]="STABLE";self.assertIn("PREMATURE_STABLE",validate(x))
 def test_no_deployment_claim(self):
  x=copy.deepcopy(BASE);x["adoption"]["agent_deployment_authorized"]=True;self.assertTrue(validate(x))
 def test_host_injection_required(self):
  x=copy.deepcopy(BASE);x["host_provided"].remove("policy_authority");self.assertTrue(validate(x))
 def test_canonical_milestone_binding(self):
  x=copy.deepcopy(BASE);x["canonical_milestones"]="packages/agent-model/new-framework.json"
  self.assertIn("M0_M7_BOUNDARY",validate(x))
 def test_f8_is_realm_conditional(self):
  x=copy.deepcopy(BASE);x["f8_integration_mode"]="MANDATORY_PRODUCTION_BINDING"
  self.assertIn("F8_REALM_POLICY",validate(x))
 def test_no_instance_leak(self):
  x=copy.deepcopy(BASE);x["excluded"].remove("HOUSEHOLD");self.assertTrue(validate(x))
if __name__=="__main__": unittest.main()
