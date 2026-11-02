"""Portable AMA v1 module activation preflight; never registers or activates an agent.

Each of the canonical 32 module IDs has one explicit configuration:
CORE must be enabled; OPTIONAL defaults to disabled. Source inventory entries
may remain PARTIAL. This checker only validates construction configuration.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
def validate(config:object,inventory:dict)->dict:
    errors=[]
    if not isinstance(config,dict) or not isinstance(config.get("modules"),list):
        return {"status":"HOLD","errors":["INVALID_MODULE_CONFIGURATION"],"activation_authorized":False}
    catalog={x["id"]:x for x in inventory["modules"]}
    rows=config["modules"]
    names=[x.get("id") if isinstance(x,dict) else None for x in rows]
    if len(rows)!=len(catalog) or set(names)!=set(catalog) or len(set(names))!=len(names):
        errors.append("MODULE_INVENTORY_MUST_BE_EXACT")
    result={}
    for row in rows:
        if not isinstance(row,dict) or row.get("id") not in catalog:
            errors.append("UNKNOWN_MODULE")
            continue
        name=row["id"]
        base=catalog[name]
        enabled=row.get("enabled")
        if not isinstance(enabled,bool):
            errors.append("MISSING_BOOLEAN_ENABLED:"+name)
            enabled=False
        if base["requirement"]=="CORE" and not enabled:
            errors.append("CORE_MODULE_DISABLED:"+name)
        if base["requirement"]=="OPTIONAL" and enabled and row.get("approval_ref") in (None,""):
            errors.append("OPTIONAL_ACTIVATION_WITHOUT_APPROVAL:"+name)
        if enabled and (not isinstance(row.get("config_version"),str) or not row["config_version"].strip()):
            errors.append("ENABLED_WITHOUT_CONFIG_VERSION:"+name)
        if enabled and not isinstance(row.get("host_obligations"),list):
            errors.append("MISSING_HOST_OBLIGATION_LIST:"+name)
        if enabled and base.get("remaining_host_obligations"):
            acknowledgements=row.get("host_obligations",[])
            if not isinstance(acknowledgements,list):
                acknowledgements=[]
            missing=set(base["remaining_host_obligations"])-set(str(x) for x in acknowledgements)
            if missing:
                errors.append("UNDECLARED_HOST_OBLIGATIONS:"+name)
        if enabled and base["implementation_status"]!="COMPLETE":
            errors.append("ENABLED_MODULE_CONTRACT_NOT_COMPLETE:"+name)
        result[name]={"enabled":enabled,"source_status":base["implementation_status"],
                      "requires_host_verification":enabled}
    return {"schema":"ama.module-construction-preflight/v1",
            "status":"HOLD" if errors else "CONFIGURATION_VALID_ONLY",
            "errors":sorted(set(errors)),"modules":result,
            "activation_authorized":False,"agent_registered":False,
            "host_verified":False}

def default_config(inventory:dict)->dict:
    return {"schema":"ama.module-configuration/v1",
            "modules":[{"id":m["id"],"enabled":m["requirement"]=="CORE",
                        "config_version":"1.0.0" if m["requirement"]=="CORE" else None,
                        "host_obligations":m.get("remaining_host_obligations",[])}
                       for m in inventory["modules"]]}

if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("--configuration",type=Path)
    p.add_argument("--default-output",type=Path)
    args=p.parse_args()
    inventory=json.loads((ROOT/"packages/agent-model/ama-template-coverage.json").read_text())
    if args.default_output:
        args.default_output.write_text(json.dumps(default_config(inventory),indent=2)+"\n")
    configuration=(json.loads(args.configuration.read_text()) if args.configuration else default_config(inventory))
    report=validate(configuration,inventory)
    print(json.dumps(report,indent=2))
    raise SystemExit(0 if report["status"]=="CONFIGURATION_VALID_ONLY" else 1)
