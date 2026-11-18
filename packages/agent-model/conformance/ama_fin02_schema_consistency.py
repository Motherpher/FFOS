"""AMA FIN-02 source/schema drift gate for all 32 semantic module contracts.

Structural audit only; schema validity and semantic runtime evidence are separate.
"""
from __future__ import annotations
import json
from pathlib import Path
from ama_fin02_semantic_modules import CONTROLS

ROOT=Path(__file__).resolve().parents[3]
SCHEMA=ROOT/"packages/agent-model/schemas/v0.2/fin02-module-controls.schema.json"
INVENTORY=ROOT/"packages/agent-model/ama-template-coverage.json"

def audit(schema:dict,inventory:dict)->dict:
    findings=[]
    branches=schema.get("properties",{}).get("modules",{}).get("items",{}).get("oneOf",[])
    by_id={}
    cardinality=schema.get("properties",{}).get("modules",{}).get("allOf",[])
    cardinality_ids=[]
    for entry in cardinality:
        if not isinstance(entry,dict):
            findings.append("INVALID_CARDINALITY_ENTRY")
            continue
        ident=entry.get("contains",{}).get("properties",{}).get("id",{}).get("const")
        if entry.get("minContains")!=1 or entry.get("maxContains")!=1:
            findings.append("INVALID_MODULE_CARDINALITY:"+str(ident))
        cardinality_ids.append(ident)
    if len(cardinality_ids)!=32 or len(set(cardinality_ids))!=32 or set(cardinality_ids)!=set(CONTROLS):
        findings.append("MODULE_CARDINALITY_INCOMPLETE")
    for branch in branches:
        ident=branch.get("properties",{}).get("id",{}).get("const")
        if ident in by_id:findings.append("DUPLICATE_SCHEMA_MODULE:"+str(ident))
        by_id[ident]=branch
    names={row["id"]:row for row in inventory.get("modules",[]) if isinstance(row,dict)}
    if len(branches)!=32 or len(by_id)!=32 or set(by_id)!=set(CONTROLS) or set(names)!=set(CONTROLS):
        findings.append("NONCANONICAL_32_MODULE_SCHEMA")
    for name,fields in CONTROLS.items():
        row=names.get(name)
        branch=by_id.get(name)
        if not row or not branch:
            findings.append("MISSING_MODULE:"+name)
            continue
        core=row.get("requirement")=="CORE"
        expected=list(fields)
        if core:
            section=branch.get("properties",{}).get("controls",{})
            if branch.get("properties",{}).get("enabled",{}).get("const") is not True:
                findings.append("CORE_NOT_DEFAULT_ON:"+name)
        else:
            conditional=branch.get("allOf",[])
            section=(conditional[0].get("then",{}).get("properties",{}).get("controls",{})
                     if conditional else {})
            if not conditional or "approval_ref" not in conditional[0].get("then",{}).get("required",[]):
                findings.append("OPTIONAL_APPROVAL_NOT_REQUIRED:"+name)
        if set(section.get("required",[]))!=set(expected):
            findings.append("CONTROL_FIELD_DRIFT:"+name)
        if "host_obligations" not in branch.get("properties",{}):
            findings.append("HOST_OBLIGATIONS_MISSING:"+name)
    return {"schema":"ama.fin02.semantic-schema-audit/v1",
            "module_count":len(by_id),
            "findings":sorted(set(findings)),
            "status":"SOURCE_VALID" if not findings else "HOLD",
            "tests_executed":False,"modules_accepted":0,"agent_activation_authorized":False}

if __name__=="__main__":
    x=audit(json.loads(SCHEMA.read_text()),json.loads(INVENTORY.read_text()))
    print(json.dumps(x,indent=2))
    raise SystemExit(bool(x["findings"]))
