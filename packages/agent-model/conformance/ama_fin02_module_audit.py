"""AMA FIN-02 deterministic module gap reporter. Never promotes candidate modules."""
from __future__ import annotations
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REQUIRED_DIMENSIONS = (
    "normative_contract", "validation", "negative_regression",
    "construction_blueprint", "compatibility", "host_obligations"
)
VALID = {"CORE", "OPTIONAL"}


def inspect(coverage: dict, root: Path = ROOT) -> dict:
    modules = coverage.get("modules", [])
    findings = []
    if len(modules) != 32 or len({m.get("id") for m in modules}) != 32:
        findings.append("INVALID_32_MODULE_INVENTORY")
    results = []
    for m in modules:
        key = m.get("id")
        if m.get("requirement") not in VALID:
            findings.append(f"INVALID_REQUIREMENT:{key}")
        paths = list(m.get("evidence_contracts", []))
        if m.get("evidence_contract"):
            paths.append(m["evidence_contract"])
        contracts = [{"path": p, "exists": (root / p).is_file()} for p in paths]
        validator = m.get("evidence_validator")
        tests = m.get("evidence_tests")
        missing = [c["path"] for c in contracts if not c["exists"]]
        if missing:
            findings.extend(f"MISSING_CONTRACT:{key}:{p}" for p in missing)
        gaps = {
            "normative_contract": "CANDIDATE_PARTIAL" if paths and not missing else "UNMAPPED_OR_MISSING",
            "validation": "REFERENCE_DECLARED" if validator and (root / validator).is_file() else "UNVERIFIED",
            "negative_regression": "REFERENCE_DECLARED" if tests and (root / tests).is_file() else "UNVERIFIED",
            "construction_blueprint": "UNVERIFIED",
            "compatibility": "UNVERIFIED",
            "host_obligations": "DECLARED_NOT_DISCHARGED" if m.get("remaining_host_obligations") else "REQUIRES_ASSESSMENT",
        }
        if m.get("implementation_status") == "COMPLETE":
            # Provenance and execution evidence are intentionally not part of this source audit.
            findings.append(f"UNSUPPORTED_COMPLETE_CLAIM:{key}")
        results.append({
            "id": key, "milestone": m.get("milestone"), "requirement": m.get("requirement"),
            "source_status": m.get("implementation_status"), "contracts": contracts,
            "dimensions": gaps, "remaining_host_obligations": m.get("remaining_host_obligations", []),
            "release_disposition": "BLOCKED_PENDING_SEMANTIC_AND_EXECUTED_EVIDENCE",
        })
    return {
        "schema": "ama.fin02.module-assessment/v1",
        "architecture": "AMA",
        "target_version": "1.0.0",
        "assurance": "STATIC_SOURCE_MAPPING_ONLY",
        "count": len(results),
        "core_count": sum(x["requirement"] == "CORE" for x in results),
        "optional_count": sum(x["requirement"] == "OPTIONAL" for x in results),
        "completed_verified": 0,
        "module_assessments": results,
        "structural_findings": sorted(findings),
        "run_status": "FAIL" if findings else "IN_PROGRESS_NOT_ACCEPTED",
        "director_acceptance": False,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    data = json.loads((ROOT / "packages/agent-model/ama-template-coverage.json").read_text())
    report = inspect(data)
    output = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output)
    else:
        print(output, end="")
    raise SystemExit(bool(report["structural_findings"]))
