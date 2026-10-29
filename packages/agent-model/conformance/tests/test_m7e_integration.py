"""M7-E integrated synthetic reference; negative attempts cannot promote test evidence."""
import json,copy,tempfile,unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_m7_integration import audit_reference,reference_suites,export_reference,load_release_preflight
from ama_vnext import digest,validate_bundle
from test_m1_contracts import repin
class IntegrationReadiness(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory()
  self.addCleanup(self.tmp.cleanup)
  self.path=Path(self.tmp.name)/"f8-preflight.json"
  self.baseline={"schema":"ffos.f8.preflight/v1",
    "release_gate":"BLOCKED_EXTERNAL_GATES",
    "blockers":["CDX_PRE_RELEASE","LIVE_FFOS_SPETL_NOT_BOUND"],
    "production_effects_allowed":False,"runtime_verified":False,
    "human_accepted":False}
  self.dump(self.baseline)
 def dump(self,v):self.path.write_text(json.dumps(v))
 def check(self,mutator=None):return audit_reference(preflight_path=self.path,mutator=mutator)
 def test_reference_six_profiles_m1_to_m6(self):
  result=self.check()
  self.assertEqual(result["engineering_status"],"SYNTHETIC_REFERENCE_PASS",result)
  self.assertEqual(set(result["scenario_results"]),{
   "MINIMAL_MEMORY_OFF","E0_CLASSIFIED_READ_PRECHECK","MEMORY_ON_PROFILE",
   "DURABLE_UNKNOWN_AND_RECONCILIATION","EVALUATION_TEN_AXIS",
   "OPERATIONAL_CANARY_REVIEW"})
  self.assertTrue(all(r["static_pass"] for r in result["scenario_results"].values()))
  self.assertFalse(result["deployment_authorized"])
  self.assertFalse(result["independent_accepted"])
 def test_evidence_is_repeatable_and_pinned(self):
  one=self.check();two=self.check()
  for k in one["scenario_results"]:
   self.assertEqual(one["scenario_results"][k]["reference_digest"],
                    two["scenario_results"][k]["reference_digest"])
 def test_export_keeps_instances_outside_master(self):
  report=self.check()
  dest=Path(self.tmp.name)/"reference"
  export_reference(dest,report)
  self.assertEqual(len(list(dest.glob("*.json"))),7)
  self.assertFalse(json.loads((dest/"m7e-assessment.json").read_text())["runtime_authorized"])
 def test_memory_off_vs_on_is_orthogonal(self):
  r=self.check()["scenario_results"]
  self.assertFalse(r["MINIMAL_MEMORY_OFF"]["module_memory_enabled"])
  self.assertTrue(r["MEMORY_ON_PROFILE"]["module_memory_enabled"])
 def test_stale_agent_contract_pin_fails_whole_suite(self):
  def tamper(label,b):
   if label=="MEMORY_ON_PROFILE":
    b["cognitiveBindings"][0]["agentRef"]["digest"]="sha256:"+"0"*64
   return b
  result=self.check(tamper)
  self.assertEqual(result["engineering_status"],"FAIL")
  self.assertIn("REFERENCE_GATE_FAIL:MEMORY_ON_PROFILE",result["findings"])
 def test_unauthorized_e0_recipient_fails_whole_suite(self):
  def tamper(label,b):
   if label=="E0_CLASSIFIED_READ_PRECHECK":
    b["authorizationRequests"][0]["recipientId"]="ATTACKER"
   return b
  result=self.check(tamper)
  self.assertIn("REFERENCE_GATE_FAIL:E0_CLASSIFIED_READ_PRECHECK",result["findings"])
 def test_m5_false_allow_fails_whole_suite(self):
  def tamper(label,b):
   if label=="EVALUATION_TEN_AXIS":
    for obs in b["evaluationObservations"]:
     if obs["actualDecision"]=="DENY":
      obs["actualDecision"]="ALLOW"
      break
   return b
  result=self.check(tamper)
  self.assertIn("REFERENCE_GATE_FAIL:EVALUATION_TEN_AXIS",result["findings"])
 def test_m6_revoked_tool_fails_whole_suite(self):
  def tamper(label,b):
   if label=="OPERATIONAL_CANARY_REVIEW":
    b["healthSnapshots"][0]["revocationDetected"]=True
   return b
  result=self.check(tamper)
  self.assertIn("REFERENCE_GATE_FAIL:OPERATIONAL_CANARY_REVIEW",result["findings"])
 def test_fake_release_state_does_not_promote_gate(self):
  forged={**self.baseline,"release_gate":"VERIFIED_RUNTIME_BOUND",
     "production_effects_allowed":True,"runtime_verified":True}
  self.dump(forged)
  result=self.check()
  self.assertEqual(result["engineering_status"],"FAIL")
  self.assertIn("UNSAFE_F8_RELEASE_PREFLIGHT",result["findings"])
  self.assertFalse(result["production_effects_permitted"])
 def test_empty_source_blockers_fails(self):
  self.dump({**self.baseline,"blockers":[]})
  self.assertIn("UNSAFE_F8_RELEASE_PREFLIGHT",self.check()["findings"])
 def test_cannot_claim_acceptance_even_on_all_green(self):
  result=self.check()
  for fld in ["deployment_authorized","registration_authorized",
    "runtime_authorized","independent_accepted","cdx_f8_7_verified",
    "m7_o_verified","production_effects_permitted"]:
   self.assertIs(result[fld],False)
 def test_static_schema_tampering_fails(self):
  def tamper(label,b):
   if label=="MINIMAL_MEMORY_OFF":
    b["agent"]["authority"]["selfApprovalProhibited"]=False
   return b
  result=self.check(tamper)
  self.assertIn("REFERENCE_GATE_FAIL:MINIMAL_MEMORY_OFF",result["findings"])
if __name__=="__main__":unittest.main()
