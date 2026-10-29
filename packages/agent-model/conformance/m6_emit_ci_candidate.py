"""M6 operational engineering evidence; never an operational authorization."""
import argparse,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
sys.path.insert(0,str(Path(__file__).resolve().parent/"tests"))
from ama_vnext import digest
from ama_operations import validate_operational_contract,plan_canary_action
from test_m6_operations import sample,test_attestor
def main():
 parser=argparse.ArgumentParser();parser.add_argument("--output",required=True)
 args=parser.parse_args()
 b=sample()
 status=validate_operational_contract(b,at="2026-10-29T12:00:00+00:00",
                                      attestor=test_attestor)
 canary=plan_canary_action(b["operationalProfiles"][0],
                           b["healthSnapshots"][0],observations=10)
 payload={
 "contract":"ama.m6-ci-candidate-report/v1",
 "milestone":"M6","engineering_status":status["status"],
 "fixture_digest":digest(b),"assurance_scope":"SYNTHETIC_TEST_ENVIRONMENT",
 "attestor":"TEST_DOUBLE_NOT_LIVE",
 "profile_ref":b["operationalProfiles"][0]["profileId"],
 "preflight":status,"canary_recommendation":canary,
 "production_deployment_authorized":False,
 "independent_approval_obtained":False,
 "live_health_attested":False,
 "cdx_f8_7_production_bound":False,
 "m7_operational_readiness":False,
 "residual_release_gates":[
  "M6 normative adoption and authorized human approval",
  "F8.7 independently authenticated Conductellence release/runtime binding",
  "real operational monitoring and alerting integrations",
  "database permissions, retention, encryption and backup review",
  "independent live canary and rollback evidence",
  "M7-O full operational integration and independent acceptance"
 ]}
 Path(args.output).write_text(json.dumps(payload,indent=2,sort_keys=True)+"\n")
 print(json.dumps({"milestone":"M6","static_candidate":status["status"],
   "deployment_authorized":False,"canary_activated":False}))
 return 0 if status["status"]=="STATIC_OPERATIONAL_ELIGIBLE" and (
   canary["release_authorized"] is False) else 1
if __name__=="__main__":
 raise SystemExit(main())
