"""AMA FIN-01 HARP source-line and requirement disposition verification.

This performs a deterministic source/metadata check only. It cannot authenticate
third-party primary sources, run linked tests, or adopt requirements for Director.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
REGISTER="docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json"
BRIDGE="packages/agent-model/ama-m0-test-evidence-bridge.json"
DOSSIER="docs/research/AMA-SOURCE-ROUND-GRANULAR-REQUIREMENTS-2026-10-29.md"
TRIAGE="docs/roadmap/AMA-FIN-01-REQUIREMENT-DISPOSITIONS.json"

def inspect(register:dict,bridge:dict,dossier:str,triage:dict)->dict:
    requirements=register.get("items",[])
    rows=triage.get("requirements",[])
    refs=bridge.get("entries",[])
    lines=dossier.splitlines()
    ids=[item.get("id") for item in requirements]
    referenced=[row.get("requirement_id") for row in refs]
    findings=[]
    if len(requirements)!=96 or len(set(ids))!=96:
        findings.append("SOURCE_REGISTER_NOT_96_UNIQUE")
    if len(rows)!=96 or len({row.get("id") for row in rows})!=96:
        findings.append("TRIAGE_NOT_96_UNIQUE")
    if len(referenced)!=len(set(referenced)):
        findings.append("DUPLICATE_EVIDENCE_BRIDGE_LINK")
    if set(referenced)-set(ids):
        findings.append("UNKNOWN_TEST_LINK")
    if set(ids)!={row.get("id") for row in rows}:
        findings.append("TRIAGE_REQUIREMENT_ID_MISMATCH")
    indexed={row.get("id"):row for row in rows}
    linked=set(referenced)
    gaps=[]
    for item in requirements:
        rid=item.get("id")
        n=item.get("source_line")
        if not isinstance(n,int) or n<1 or n>len(lines):
            findings.append("INVALID_SOURCE_LINE:"+str(rid))
        elif lines[n-1].strip()!="- "+rid+" "+item.get("statement",""):
            findings.append("SOURCE_STATEMENT_DRIFT:"+str(rid))
        row=indexed.get(rid)
        if row is None:
            continue
        for key in ("statement","source_path","source_line","normative_target"):
            if row.get(key)!=item.get(key):
                findings.append("TRIAGE_SOURCE_DRIFT:"+rid+":"+key)
        if row.get("original_proposed_disposition")!=item.get("disposition"):
            findings.append("TRIAGE_DECISION_DRIFT:"+rid)
        if row.get("fin01_acceptance")=="PASS" or row.get("decision_status")=="DIRECTOR_ADOPTED":
            findings.append("UNSUPPORTED_ACCEPTANCE_CLAIM:"+rid)
        if rid not in linked:
            if not item.get("test_plan", "").strip():
                findings.append("UNLINKED_WITHOUT_TEST_PLAN:"+rid)
            gaps.append({
                "id":rid,"original_proposal":item.get("disposition"),
                "source_path":item.get("source_path"),"source_line":n,
                "target":item.get("normative_target"),
                "negative_test_plan":item.get("test_plan"),
                "required_disposition":"IMPLEMENT_AND_EXECUTE_OR_DIRECTOR_APPROVE_BOUNDED_DEFERRAL",
                "evidence_state":"NO_DIRECT_TEST_REFERENCE",
            })
    return {
        "schema":"ama.fin01.harp-source-audit/v1",
        "source_dossier":DOSSIER,
        "source_requirement_count":len(requirements),
        "source_lines_exact":len(requirements)-len([x for x in findings if x.startswith(("SOURCE_STATEMENT_DRIFT:","INVALID_SOURCE_LINE:"))]),
        "partial_test_references":len(linked),
        "direct_link_gaps":len(gaps),
        "gap_queue":gaps,
        "source_scope":"SECONDARY_RESEARCH_DOSSIER_NOT_PRIMARY_REF_A_AUTHENTICATION",
        "test_assertions_executed":False,
        "requirements_accepted":0,
        "director_decision":"PENDING",
        "findings":sorted(set(findings)),
        "structural_result":"FAIL" if findings else "SOURCE_TRACEABILITY_PASS",
        "fin01_release_gate":"HOLD_DIRECT_EVIDENCE_AND_DIRECTOR_ACCEPTANCE",
    }

def load(root=ROOT):
    read=lambda path: json.loads((root/path).read_text(encoding="utf-8"))
    return inspect(read(REGISTER),read(BRIDGE),
                   (root/DOSSIER).read_text(encoding="utf-8"),read(TRIAGE))

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    result=load()
    text=json.dumps(result,ensure_ascii=False,indent=2)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(text,encoding="utf-8")
    else:
        print(text,end="")
    raise SystemExit(bool(result["findings"]))
