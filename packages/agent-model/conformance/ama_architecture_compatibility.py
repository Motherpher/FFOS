"""Offline AMA architecture compatibility report; never authorizes an agent.

Reports v1/v0.2 coexistence, namespace uniqueness and generic architectural
boundary. Synthetic/static conformance only; not a release certification.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from ama_architecture_boundary import validate_boundary

MODEL = Path(__file__).resolve().parents[1]
SCHEMAS = MODEL / "schemas" / "v0.2"


def build_report(model_root=MODEL):
    boundary = json.loads((model_root / "architecture-boundary.json").read_text(encoding="utf-8"))
    violations = validate_boundary(boundary)
    v1 = model_root / "agent-manifest.schema.json"
    if not v1.is_file():
        violations.append("MISSING_LEGACY_V1_SCHEMA")
    else:
        old = json.loads(v1.read_text(encoding="utf-8"))
        if not isinstance(old, dict):
            violations.append("INVALID_LEGACY_V1_SCHEMA")
    candidate = model_root / "schemas" / "v0.2"
    ids, artifacts = set(), []
    if not candidate.is_dir():
        violations.append("MISSING_VNEXT_SCHEMA_DIRECTORY")
    else:
        for path in sorted(candidate.glob("*.schema.json")):
            obj=json.loads(path.read_text(encoding="utf-8"))
            sid=obj.get("$id")
            if not isinstance(sid,str) or not sid.startswith("https://ama.example/contracts/v0.2/"):
                violations.append("NON_CANDIDATE_NAMESPACE:"+path.name)
            if sid in ids:
                violations.append("DUPLICATE_SCHEMA_ID:"+str(sid))
            ids.add(sid)
            if obj.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
                violations.append("SCHEMA_DIALECT_MISMATCH:"+path.name)
            artifacts.append({"path":path.relative_to(model_root).as_posix(),
                              "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
                              "schema_id":sid})
        if not artifacts:
            violations.append("EMPTY_VNEXT_SCHEMA_SUITE")
    if v1.is_file():
        v1_id=json.loads(v1.read_text(encoding="utf-8")).get("$id")
        if v1_id in ids:
            violations.append("LEGACY_V1_NAMESPACE_COLLISION")
    else:
        v1_id=None
    return {"schema":"ama.architecture-compatibility-report/v1",
            "architecture":"AMA","scope":"DOMAIN_AGNOSTIC",
            "report_status":"STATIC_COMPATIBILITY_PASS_CANDIDATE" if not violations else "FAIL",
            "legacy_v1_schema_id":v1_id,
            "candidate_schema_count":len(artifacts),
            "candidate_artifacts":artifacts,
            "violations":sorted(set(violations)),
            "independent_accepted":False,
            "agent_activation_authorized":False,
            "deployment_authorized":False,
            "publication_authorized":False}


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",type=Path)
    args=ap.parse_args()
    report=build_report()
    data=json.dumps(report,indent=2,sort_keys=True)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(data,encoding="utf-8")
    else:
        print(data,end="")
    return 0 if not report["violations"] else 1

if __name__=="__main__":
    raise SystemExit(main())
