"""M7-E integrated synthetic reference admission. No production or self-acceptance.

The reference is an INSTANCE fixture outside the universal master contract;
each sub-gate has its own source-derived evaluator. This orchestrator does not
replace their checks or turn synthetic test doubles into independent proof.
"""
from __future__ import annotations
import json, sys
from pathlib import Path
from ama_vnext import validate_bundle,digest
from ama_authorization import validate_authorization_contract
from ama_cognitive import validate_cognitive_contract
from ama_durability import validate_durability_contract
from ama_evaluation import evaluate
from ama_operations import validate_operational_contract
TESTS=Path(__file__).resolve().parent/"tests"
sys.path.insert(0,str(TESTS))
from test_m1_contracts import fixture as reference_base
from test_m2_authorization import baseline as authorization_reference
from test_m3_cognitive import cognitive_fixture
from test_m4_durability import fixture as durability_reference
from test_m5_evaluation import sample as evaluation_reference,test_only_attestor
from test_m6_operations import sample as operations_reference,test_attestor
DATE="2026-10-29T12:00:00+00:00"
EVALUATED_AT="2026-10-29T11:00:00+00:00"
OUTCOMES={"M1":"STATIC_BUNDLE_VALID","M2":"STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION",
          "M3":"STATIC_COGNITIVE_ELIGIBLE","M4":"STATIC_DURABILITY_ELIGIBLE",
          "M5":"CANDIDATE_METRICS_PASS","M6":"STATIC_OPERATIONAL_ELIGIBLE"}
REQUIRED_SCENARIOS=(
 "MINIMAL_MEMORY_OFF","E0_CLASSIFIED_READ_PRECHECK","MEMORY_ON_PROFILE",
 "DURABLE_UNKNOWN_AND_RECONCILIATION","EVALUATION_TEN_AXIS",
 "OPERATIONAL_CANARY_REVIEW")
RELEASE_GATES=(
 "CDX_F8_7_PINNED_RELEASE_AND_AUTHENTICATED_RUNTIME",
 "M5_REAL_INDEPENDENT_ORACLE_AND_C4_C5",
 "M6_PRODUCTION_TELEMETRY_CUSTODY_AND_ROLLBACK",
 "HUMAN_NORMATIVE_ACCEPTANCE_AND_APPROVED_DEPLOYMENT")

def reference_suites():
 return {
   "MINIMAL_MEMORY_OFF":("M1",reference_base(),lambda b: {
      "status":"STATIC_BUNDLE_VALID" if not validate_bundle(b) else "FAIL",
      "errors":validate_bundle(b),"runtime_authorized":False}),
   "E0_CLASSIFIED_READ_PRECHECK":("M2",authorization_reference(),lambda b:
      validate_authorization_contract(b,at=DATE)),
   "MEMORY_ON_PROFILE":("M3",cognitive_fixture(memory=True,retrieval=True),
     lambda b:validate_cognitive_contract(b,at=DATE)),
   "DURABLE_UNKNOWN_AND_RECONCILIATION":("M4",durability_reference(),
     lambda b:validate_durability_contract(b)),
   "EVALUATION_TEN_AXIS":("M5",evaluation_reference(),
     lambda b:evaluate(b,profile_id="SYNTHETIC.EVALUATION",at=EVALUATED_AT,
                       attestor=test_only_attestor)),
   "OPERATIONAL_CANARY_REVIEW":("M6",operations_reference(),
     lambda b:validate_operational_contract(b,at=DATE,attestor=test_attestor))
 }

def load_release_preflight(path):
 """Do not treat a generated source snapshot as a real-time CDX release proof."""
 obj=json.loads(Path(path).read_text(encoding="utf-8"))
 if (obj.get("schema")!="ffos.f8.preflight/v1" or
     obj.get("production_effects_allowed") is not False or
     obj.get("runtime_verified") is not False or
     obj.get("human_accepted") is not False or
     obj.get("release_gate")!="BLOCKED_EXTERNAL_GATES" or
     not obj.get("blockers")):
  return {"status":"INVALID_OR_PROMOTED_SOURCE_PREFLIGHT","gates_closed":False}
 return {"status":"EXTERNAL_RELEASE_BLOCK_CONFIRMED","gates_closed":False,
         "external_blockers":obj["blockers"]}

def audit_reference(*,preflight_path,mutator=None):
 results={}
 failures=[]
 for label,(milestone,bundle,check) in reference_suites().items():
  if mutator:
   bundle=mutator(label,bundle)
  errors=validate_bundle(bundle)
  output=check(bundle)
  passed=not errors and output["status"]==OUTCOMES[milestone] and (
      output.get("runtime_authorized") is False or
      output.get("authority_granted") is False)
  if milestone=="M5":
   passed=passed and output.get("independent_accepted") is False and (
      output.get("live_c4_c5_verified") is False)
  if milestone=="M6":
   passed=passed and output.get("deployment_authorized") is False and (
      output.get("operational_ready") is False)
  if milestone=="M4":
   passed=passed and output.get("evidence_verified") is False
  if not passed:failures.append("REFERENCE_GATE_FAIL:"+label)
  results[label]={
    "contract_family":milestone,"status":output["status"],
    "static_pass":passed,
    "agent_id":bundle["agent"]["agentId"],
    "agent_version":bundle["agent"]["agentVersion"],
    "agent_digest":digest(bundle["agent"]),
    "reference_digest":digest(bundle),
    "module_memory_enabled":any(m["kind"]=="MEMORY" and m["enabled"]
                                for m in bundle["agent"]["modules"]),
    "errors":errors,
    "findings":output.get("errors",output.get("findings",[])),
    "synthetic_only":True}
 if set(results)!=set(REQUIRED_SCENARIOS):
  failures.append("MISSING_SCENARIO")
 if results["MINIMAL_MEMORY_OFF"]["module_memory_enabled"]:
  failures.append("MEMORY_OFF_PROFILE_MISDECLARED")
 if not results["MEMORY_ON_PROFILE"]["module_memory_enabled"]:
  failures.append("MEMORY_ON_PROFILE_MISDECLARED")
 if len({x["agent_id"] for x in results.values()})!=1:
  failures.append("CROSS_PROFILE_REFERENCE_AGENT_ID_MISMATCH")
 if any(x["agent_id"]!="SYNTHETIC.AGENT" for x in results.values()):
  failures.append("NON_GENERIC_REFERENCE_ID")
 boundary=load_release_preflight(preflight_path)
 if boundary["status"]!="EXTERNAL_RELEASE_BLOCK_CONFIRMED":
  failures.append("UNSAFE_F8_RELEASE_PREFLIGHT")
 return {"schema":"ama.m7e.integration-assessment/v1","milestone":"M7-E",
  "source":"GENERATED_SYNTHETIC_REFERENCE_NOT_REAL_AGENT",
  "contract_version":"v0.2-candidate","scenario_results":results,
  "source_separation":{"universal_master_unchanged":True,
    "instance_location":"packages/agent-model/conformance/fixtures/m7e-reference",
    "host_policy_not_in_universal_contract":True},
  "external_cdx_preflight":boundary,"required_live_gates":list(RELEASE_GATES),
  "engineering_status":"SYNTHETIC_REFERENCE_PASS" if not failures else "FAIL",
  "findings":sorted(failures),"deployment_authorized":False,
  "registration_authorized":False,"runtime_authorized":False,
  "independent_accepted":False,"cdx_f8_7_verified":False,
  "m7_o_verified":False,"production_effects_permitted":False}

def export_reference(output_dir,report):
 """Materialize inspectable synthetic instances, not registry admission."""
 base=Path(output_dir);base.mkdir(parents=True,exist_ok=True)
 for label,(_,bundle,_) in reference_suites().items():
  (base/(label.lower()+".json")).write_text(json.dumps(bundle,indent=2,
      sort_keys=True,ensure_ascii=False)+"\n",encoding="utf-8")
 (base/"m7e-assessment.json").write_text(json.dumps(report,indent=2,
   sort_keys=True)+"\n",encoding="utf-8")

if __name__=="__main__":
 import argparse
 ap=argparse.ArgumentParser()
 ap.add_argument("--preflight",required=True)
 ap.add_argument("--output-dir",required=True)
 args=ap.parse_args()
 report=audit_reference(preflight_path=args.preflight)
 export_reference(args.output_dir,report)
 print(json.dumps({"M7_E":report["engineering_status"],
      "scenarios":len(report["scenario_results"]),
      "CDX_F8_7":"BLOCKED","deployment_authorized":False}))
 raise SystemExit(0 if not report["findings"] else 1)
