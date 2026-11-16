"""FIN-01 mission-bound clearance: fail closed and distinguish engineering continuity.

This validator does NOT sign or grant an external Director mandate.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PATH = "docs/roadmap/AMA-FIN-01-MISSION-TIED-CLEARANCE.json"

def assess(record:dict)->dict:
    errors=[]
    counts=record.get("counts",{})
    gap_queue=record.get("gap_queue",[])
    states=record.get("status",{})
    if record.get("target")!="AMA_v1.0" or record.get("scope")!="AMA_ENGINEERING_ONLY_NO_AGENT_BUILD":
        errors.append("OUT_OF_SCOPE")
    if counts.get("requirements")!=96 or counts.get("missing_direct_evidence")!=28:
        errors.append("REQUIREMENT_BASELINE_MISMATCH")
    if len(gap_queue)!=28 or len({g.get("id") for g in gap_queue})!=31:
        errors.append("INCOMPLETE_GAP_QUEUE")
    for row in gap_queue:
        if row.get("status")!="OPEN_NO_DIRECT_TEST_LINK":
            errors.append("UNSUPPORTED_GAP_CLOSURE:"+str(row.get("id")))
        if not row.get("existing_negative_test_plan"):
            errors.append("GAP_WITHOUT_PLAN:"+str(row.get("id")))
    for rid in ("K02","K03"):
        match=next((x for x in gap_queue if x.get("id")==rid),{})
        if match.get("household_protocol_classification")!="J2_SOURCE_DECISION_STOP":
            errors.append("J2_SOURCE_HOLD_MISSING:"+rid)
    if states.get("fin01_formal_clearance")!="HOLD":
        errors.append("UNSUPPORTED_FIN01_CLEARANCE")
    if states.get("next_stage_automatic_trigger")!="NOT_AUTHORIZED":
        errors.append("UNAUTHORIZED_STAGE_TRIGGER")
    if states.get("fin01_director_acceptance")!="NOT_RECEIVED":
        errors.append("FORGED_DIRECTOR_ACCEPTANCE")
    if states.get("release_approval")!="NOT_AUTHORIZED":
        errors.append("FORGED_RELEASE_APPROVAL")
    return {"schema":"ama.fin01.mission-clearance-assessment/v1",
            "finding_count":len(errors),"errors":sorted(set(errors)),
            "engineering_continuity":"IN_SCOPE_ONLY" if not errors else "HOLD",
            "formal_fin01_clearance":False,
            "may_trigger_fin02":False,
            "agent_construction_permitted":False,
            "release_authorized":False}

if __name__=="__main__":
    import sys
    record=json.loads((ROOT/PATH).read_text(encoding="utf-8"))
    report=assess(record)
    print(json.dumps(report,indent=2))
    sys.exit(bool(report["errors"]))
