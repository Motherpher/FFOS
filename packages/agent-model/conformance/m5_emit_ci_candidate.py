"""Emit machine-readable M5 CI test-fixture report, never operational certification."""
import argparse,json,sys
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
sys.path.insert(0,str(Path(__file__).resolve().parent/"tests"))
from ama_evaluation import evaluate
from ama_vnext import digest
from test_m5_evaluation import sample,test_only_attestor

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    bundle=sample()
    result=evaluate(bundle,profile_id="SYNTHETIC.EVALUATION",
                    at="2026-10-29T11:00:00+00:00",
                    attestor=test_only_attestor)
    payload={
      "contract":"ama.m5-ci-candidate-report/v1",
      "status":"SYNTHETIC_ENGINEERING_VERIFICATION" if result["status"]==
                "CANDIDATE_METRICS_PASS" else "FAIL",
      "fixture_verdict":result,
      "profile_ref":bundle["evaluationProfiles"][0]["profileId"],
      "fixture_digest":digest(bundle),
      "evaluation_scope":"STATIC_CANDIDATE",
      "attestation_adapter":"SYNTHETIC_TEST_DOUBLE",
      "integrated_ci":True,
      "independent_acceptance":False,"live_c4_c5_certified":False,
      "runtime_authorized":False,"production_effects_executed":False,
      "remaining_release_blockers":[
        "LIVE_AGENT_RUNTIME_AND_PRODUCTION_IDENTITY",
        "INDEPENDENT_ORACLE_ATTESTATION",
        "REAL_POLICY_SERVICE_AND_REVOCATION",
        "INDEPENDENT_FINAL_STATE_VERIFICATION",
        "LONG_HORIZON_RELIABILITY_AND_HUMAN_CALIBRATION",
        "AUTHENTICATED_SECURITY_EVIDENCE",
        "HUMAN_NORMATIVE_ACCEPTANCE"
      ]
    }
    Path(args.output).write_text(json.dumps(payload,indent=2,sort_keys=True)+"\n",
                                  encoding="utf-8")
    print(json.dumps({"status":payload["status"],"cases":result["metrics"].get("cases"),
                      "verified_live":False,"independent_acceptance":False}))
    return 0 if result["status"]=="CANDIDATE_METRICS_PASS" else 1

if __name__=="__main__":
    raise SystemExit(main())
