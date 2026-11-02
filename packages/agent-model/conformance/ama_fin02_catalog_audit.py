"""FIN-02: check completeness of 32 normative module contract candidates.

Only source and executed evidence can promote a module. A candidate catalog
alone never becomes 32/32 complete.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DIMENSIONS = ("contract", "negative", "migration", "blueprint")

def audit(inventory, catalog):
    findings = []
    originals = {row["id"]: row for row in inventory.get("modules", [])}
    rows = catalog.get("modules", [])
    ids = [x.get("id") for x in rows]
    if len(originals) != 32 or len(rows) != 32 or len(set(ids)) != 32 or set(ids) != set(originals):
        findings.append("CATALOG_32_IDENTITY_MISMATCH")
    for item in rows:
        key = item.get("id")
        original = originals.get(key)
        if not original:
            continue
        if item.get("stage") != original["milestone"]:
            findings.append("STAGE_MISMATCH:" + key)
        if item.get("classification") != original["requirement"]:
            findings.append("CLASSIFICATION_MISMATCH:" + key)
        if item.get("default_enabled") is not (original["requirement"] == "CORE"):
            findings.append("INVALID_DEFAULT:" + key)
        if not item.get("normative_capability") or not item.get("mandatory_denial_case"):
            findings.append("MISSING_NORMATIVE_OR_DENIAL:" + key)
        if set(item.get("contract_requirements", [])) != {
                "version_pinned_configuration", "explicit_authority_scope",
                "typed_input_output", "denial_evidence",
                "change_impact_and_rollback", "host_dependency_declaration"}:
            findings.append("INCOMPLETE_CONTRACT_DIMENSIONS:" + key)
        if item.get("source_status") != original["implementation_status"]:
            findings.append("UNSUPPORTED_STATUS_CHANGE:" + key)
        if item.get("release_claim") == "COMPLETE":
            if any(item.get("verification", {}).get(k) != "VERIFIED_EXECUTED" for k in DIMENSIONS):
                findings.append("UNSUPPORTED_COMPLETE:" + key)
    complete = sum(
        row.get("release_claim") == "COMPLETE" and
        all(row.get("verification", {}).get(k) == "VERIFIED_EXECUTED" for k in DIMENSIONS)
        for row in rows
    )
    return {"schema": "ama.fin02.catalog-audit/v1",
            "module_count": len(rows), "candidate_contracts": len(rows),
            "verified_complete": complete,
            "findings": sorted(set(findings)),
            "status": "FAIL" if findings else "IN_PROGRESS" if complete < 32 else "EVIDENCE_ATTESTATION_REQUIRED",
            "external_authority_granted": False, "agent_activation_authorized": False}

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--output", type=Path)
    args = p.parse_args()
    base = json.loads((ROOT/"packages/agent-model/ama-template-coverage.json").read_text())
    catalog = json.loads((ROOT/"packages/agent-model/ama-v1-module-contract-catalog.json").read_text())
    report = audit(base,catalog)
    output=json.dumps(report,indent=2)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(output)
    print(output,end="")
    raise SystemExit(bool(report["findings"]))
