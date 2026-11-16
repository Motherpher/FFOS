"""AMA FIN protocol sequencer — planning only, never an agent runtime.

Derived from Household Family's J0 observation, J1 registered bounded repair,
J2 constitutional stop and Director's external acceptance. This module may
nominate the next FIN run; it cannot start work outside the current mandate,
approve a prior gate, create a mandate, merge or publish.
"""
from __future__ import annotations
import json
from pathlib import Path

STAGES=tuple(f"FIN-0{i}" for i in range(1,6))
ALLOWED_CLASSIFICATIONS={"J0","J1","J2"}
PASS_MARKER="VERIFIED_PASS"
MANDATORY=("janitor_inspection","handyman_scope","verifier_evidence")

def evaluate(record:dict)->dict:
    errors=[]
    current=record.get("current_stage")
    if current not in STAGES:
        errors.append("UNKNOWN_CURRENT_STAGE")
    classification=record.get("classification")
    if classification not in ALLOWED_CLASSIFICATIONS:
        errors.append("INVALID_J_CLASSIFICATION")
    if classification=="J2":
        errors.append("J2_CONSTITUTIONAL_STOP")
    evidence=record.get("evidence",{})
    if not isinstance(evidence,dict):
        evidence={}
        errors.append("INVALID_EVIDENCE")
    for item in MANDATORY:
        value=evidence.get(item)
        if not isinstance(value,dict) or value.get("status")!=PASS_MARKER or not isinstance(value.get("ref"),str) or not value["ref"].strip():
            errors.append("MISSING_VERIFIED_EVIDENCE:"+item)
    if classification=="J1" and not record.get("registered_recipe_ref"):
        errors.append("J1_RECIPE_REQUIRED")
    if not record.get("mandate_ref") or record.get("mandate_validation")!="EXTERNALLY_VERIFIED":
        errors.append("DIRECTOR_MANDATE_NOT_VERIFIED")
    # Director's upstream acceptance must not be created by the execution/verifier.
    if not isinstance(record.get("director_acceptance"),dict):
        errors.append("EXTERNAL_DIRECTOR_ACCEPTANCE_REQUIRED")
    else:
        d=record["director_acceptance"]
        if d.get("stage")!=current or d.get("decision")!="ACCEPT" or not d.get("external_evidence_ref") or d.get("validation")!="EXTERNALLY_VERIFIED" or not d.get("signature_verification_ref"):
            errors.append("EXTERNAL_DIRECTOR_ACCEPTANCE_REQUIRED")
        if d.get("source") in ("HOUSEHOLD","AMA","VERIFIER","HANDYMAN","JANITOR"):
            errors.append("SELF_ACCEPTANCE_FORBIDDEN")
    index=STAGES.index(current) if current in STAGES else -1
    next_stage=STAGES[index+1] if 0<=index<len(STAGES)-1 else None
    if current=="FIN-05":
        errors.append("TERMINAL_STAGE_REQUIRES_DIRECTOR_RELEASE")
    elif next_stage and (record.get("next_stage_mandate")!=next_stage or record.get("next_stage_mandate_validation")!="EXTERNALLY_VERIFIED"):
        errors.append("NEXT_STAGE_MANDATE_REQUIRED")
    if record.get("exact_head_tests_required") and (not isinstance(evidence.get("exact_head_tests"),dict) or evidence["exact_head_tests"].get("status")!=PASS_MARKER):
        errors.append("EXACT_HEAD_TESTS_NOT_VERIFIED")
    return {
        "schema":"ama.fin.protocol-transition-decision/v1",
        "subject":"AMA_V1_DEVELOPMENT_ONLY",
        "current_stage":current,
        "candidate_next_stage":next_stage,
        "result":"HOLD" if errors else "ELIGIBLE_FOR_DIRECTOR_AUTHORIZED_NEXT_STAGE",
        "errors":sorted(set(errors)),
        "automatic_stage_acceptance":False,
        "actual_next_stage_triggered":False,
        "agent_activation_authorized":False,
        "release_authorized":False,
    }

if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("record",type=Path)
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    obj=evaluate(json.loads(args.record.read_text(encoding="utf-8")))
    result=json.dumps(obj,indent=2)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(result,encoding="utf-8")
    else:
        print(result,end="")
    raise SystemExit(0 if obj["result"].startswith("ELIGIBLE") else 1)
