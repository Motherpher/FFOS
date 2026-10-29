"""AMA template coverage validator and machine-readable gap assessment."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
COVERAGE=ROOT/"ama-template-coverage.json"
ALLOWED={"PARTIAL_EXISTING_CONTRACTS","REQUIRES_TEMPLATE_CONTRACT","COMPLETE"}
def assess(data):
    findings=[]
    rows=data.get("modules",[])
    ids=[m.get("id") for m in rows]
    if data.get("architecture")!="AMA" or data.get("template_not_agent") is not True:
        findings.append("TEMPLATE_IDENTITY")
    if len(ids)<30 or len(ids)!=len(set(ids)):
        findings.append("MODULE_COVERAGE_OR_DUPLICATION")
    if not {"CORE","OPTIONAL"} <= {m.get("requirement") for m in rows}:
        findings.append("REQUIREMENT_CLASS")
    for m in rows:
        if m.get("requirement") not in ("CORE","OPTIONAL"):
            findings.append("INVALID_REQUIREMENT:"+str(m.get("id")))
        if m.get("implementation_status") not in ALLOWED:
            findings.append("INVALID_STATUS:"+str(m.get("id")))
        if m.get("host_binding")!="INJECTED_NOT_PRESELECTED":
            findings.append("HOST_BINDING:"+str(m.get("id")))
    missing=[m["id"] for m in rows if m["implementation_status"]=="REQUIRES_TEMPLATE_CONTRACT"]
    partial=[m["id"] for m in rows if m["implementation_status"]=="PARTIAL_EXISTING_CONTRACTS"]
    complete=[m["id"] for m in rows if m["implementation_status"]=="COMPLETE"]
    return {"schema":"ama.template-assessment/v1",
            "module_count":len(rows),"complete":complete,"partial":partial,"missing":missing,
            "template_complete":not bool(missing or partial or findings),
            "findings":findings}
if __name__=="__main__":
    report=assess(json.loads(COVERAGE.read_text()))
    print(json.dumps(report,indent=2))
    if report["findings"]:
        raise SystemExit(1)
