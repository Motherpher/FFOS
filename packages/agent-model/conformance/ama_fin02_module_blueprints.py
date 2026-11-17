"""AMA FIN-02 portable 32-module blueprint preflight.

Produces architecture *module specification* evidence, never an agent
instance, registered runtime, permission, or deployment. Source references are
candidates until separately authenticated and tested.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
REQUIRED_FIELDS=("version_pinned_configuration","explicit_authority_scope",
                 "typed_input_output","denial_evidence",
                 "change_impact_and_rollback","host_dependency_declaration")

def compose(inventory:dict,catalog:dict)->dict:
    findings=[]
    source={row.get("id"):row for row in inventory.get("modules",[]) if isinstance(row,dict)}
    rows=catalog.get("modules",[])
    ids=[r.get("id") for r in rows if isinstance(r,dict)]
    if len(source)!=32 or len(rows)!=32 or len(set(ids))!=32 or set(source)!=set(ids):
        findings.append("NOT_EXACT_CANONICAL_32_MODULES")
    blueprints=[]
    for row in rows:
        if not isinstance(row,dict):
            findings.append("INVALID_MODULE_ROW")
            continue
        ident=row.get("id")
        base=source.get(ident)
        if not base:
            findings.append("UNREGISTERED_MODULE:"+str(ident))
            continue
        core=base.get("requirement")=="CORE"
        if row.get("classification")!=base.get("requirement") or row.get("stage")!=base.get("milestone"):
            findings.append("CANONICAL_MODULE_MISMATCH:"+ident)
        if row.get("default_enabled") is not core:
            findings.append("UNSAFE_DEFAULT:"+ident)
        if set(row.get("contract_requirements",[]))!=set(REQUIRED_FIELDS):
            findings.append("INCOMPLETE_REQUIRED_CONTRACT:"+ident)
        if not row.get("mandatory_denial_case") or not row.get("normative_capability"):
            findings.append("MISSING_NORMATIVE_DENIAL:"+ident)
        if row.get("release_claim")=="COMPLETE" or base.get("implementation_status")=="COMPLETE":
            # No authority to validate complete here. Independent attestation is separate.
            findings.append("UNATTESTED_COMPLETION_PROHIBITED:"+ident)
        source_refs=list(dict.fromkeys(row.get("source_references",[])))
        source_contracts=list(dict.fromkeys(
            base.get("evidence_contracts",[])+
            ([base["evidence_contract"]] if base.get("evidence_contract") else [])))
        obligations=list(dict.fromkeys(row.get("host_obligations",[])+base.get("remaining_host_obligations",[])))
        blockers=[]
        if not source_refs and not source_contracts:
            blockers.append("SOURCE_CONTRACT_UNMAPPED")
        if not base.get("evidence_validator"):
            blockers.append("VALIDATOR_UNMAPPED")
        if not base.get("evidence_tests"):
            blockers.append("NEGATIVE_TEST_UNMAPPED")
        blockers.extend(("BLUEPRINT_EXECUTION_UNVERIFIED","MIGRATION_UNVERIFIED",
                         "HOST_DISCHARGE_UNVERIFIED","EXACT_HEAD_EVIDENCE_MISSING"))
        blueprints.append({
            "module_id":ident,"stage":base.get("milestone"),
            "classification":base.get("requirement"),"default_enabled":core,
            "required_contract_dimensions":list(REQUIRED_FIELDS),
            "normative_capability":row.get("normative_capability"),
            "mandatory_denial_case":row.get("mandatory_denial_case"),
            "candidate_sources":list(dict.fromkeys(source_refs+source_contracts)),
            "candidate_validator":base.get("evidence_validator"),
            "candidate_negative_tests":base.get("evidence_tests"),
            "host_obligations":obligations,
            "evidence_blockers":blockers,
            "technical_disposition":"HOLD",
            "runtime_authority":False,
        })
    return {"schema":"ama.fin02.blueprint-preflight/v1",
            "scope":"AMA_ARCHITECTURE_MODULES_ONLY",
            "module_count":len(blueprints),
            "core_count":sum(x["classification"]=="CORE" for x in blueprints),
            "optional_count":sum(x["classification"]=="OPTIONAL" for x in blueprints),
            "module_blueprints":blueprints,
            "findings":sorted(set(findings)),
            "status":"INVALID_SOURCE" if findings else "CANDIDATE_BLUEPRINTS_NOT_VERIFIED",
            "verified_complete":0,"agent_constructed":False,
            "agent_activation_authorized":False,"fin02_accepted":False}

if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("--output",type=Path)
    a=p.parse_args()
    inventory=json.loads((ROOT/"packages/agent-model/ama-template-coverage.json").read_text())
    catalog=json.loads((ROOT/"packages/agent-model/ama-v1-module-contract-catalog.json").read_text())
    report=compose(inventory,catalog)
    out=json.dumps(report,indent=2)+"\n"
    if a.output:
        a.output.parent.mkdir(parents=True,exist_ok=True)
        a.output.write_text(out)
    else:
        print(out,end="")
    raise SystemExit(bool(report["findings"]))
