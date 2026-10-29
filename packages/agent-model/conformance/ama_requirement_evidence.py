"""M0 source-to-conformance test bridge: existence verified, acceptance not inferred."""
import argparse
import ast
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]


def inspect(bridge, register, root=ROOT):
    errors=[]
    items=register.get("items", [])
    known={row["id"] for row in items}
    entries=bridge.get("entries", [])
    seen=set()
    for row in entries:
        rid=row.get("requirement_id")
        if rid in seen:
            errors.append("DUPLICATE_REQUIREMENT_LINK:"+str(rid))
        seen.add(rid)
        if rid not in known:
            errors.append("UNKNOWN_REQUIREMENT_LINK:"+str(rid))
        if row.get("relation")!="PARTIAL_TEST_EVIDENCE":
            errors.append("FALSE_COMPLETENESS_CLAIM:"+str(rid))
        path=row.get("test_file","")
        if not path.startswith("packages/agent-model/conformance/tests/test_") or not path.endswith(".py") or ".." in path:
            errors.append("INVALID_TEST_PATH:"+str(rid))
            continue
        file=root/path
        if not file.is_file():
            errors.append("MISSING_TEST_FILE:"+str(rid))
            continue
        tree=ast.parse(file.read_text(encoding="utf-8"))
        methods={node.name for klass in tree.body if isinstance(klass,ast.ClassDef)
                 for node in klass.body if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef))}
        names=row.get("test_functions",[])
        if not names or len(names)!=len(set(names)):
            errors.append("INVALID_TEST_LIST:"+str(rid))
        for name in names:
            if not name.startswith("test_") or name not in methods:
                errors.append("MISSING_TEST_METHOD:"+str(rid)+":"+str(name))
    if len(known)!=96 or len(items)!=96:
        errors.append("SOURCE_REGISTER_NOT_96")
    if bridge.get("schema")!="ama.m0.test-evidence-bridge/v1":
        errors.append("BRIDGE_SCHEMA")
    if bridge.get("status")!="PARTIAL_EVIDENCE_ONLY_NOT_REQUIREMENT_ACCEPTANCE":
        errors.append("FALSE_BRIDGE_STATE")
    return {
        "schema":"ama.m0.test-evidence-assessment/v1",
        "original_requirement_count":len(items),
        "partial_evidence_link_count":len(seen),
        "requirements_without_direct_evidence_links":sorted(known-seen),
        "missing_direct_link_count":len(known-seen),
        "findings":sorted(set(errors)),
        "fully_accepted_requirement_count":0,
        "evidence_means_runtime_readiness":False,
        "test_results_authenticated":False,
    }


def load():
    def read(p):
        return json.loads((ROOT/p).read_text(encoding="utf-8"))
    return inspect(read("packages/agent-model/ama-m0-test-evidence-bridge.json"),
                   read("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json"))


if __name__=="__main__":
    cli=argparse.ArgumentParser()
    cli.add_argument("--output",type=Path)
    args=cli.parse_args()
    r=load()
    output=json.dumps(r,indent=2)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(output,encoding="utf-8")
    else:
        print(output,end="")
    raise SystemExit(1 if r["findings"] else 0)
