"""FIN-02: check completeness of 32 normative module contract candidates.

Only source and executed evidence can promote a module. A candidate catalog
alone never becomes 32/32 complete.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DIMENSIONS = ("contract", "negative", "migration", "blueprint")

def audit(inventory, catalog, *, evidence_attestor=None, exact_head=None):
    """Source audit only unless a separate independent evidence attestor verifies.

    The attestor must validate the provenance of each module's executable
    evidence, review separation and exact immutable git head. A catalog status
    string alone is never evidence.
    """
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
            if (item.get("source_status") != "COMPLETE" or
                original.get("implementation_status") != "COMPLETE"):
                findings.append("PARTIAL_IMPLEMENTATION_CANNOT_COMPLETE:" + key)
            proof = item.get("independent_evidence", {})
            if not isinstance(proof, dict):
                proof = {}
            if proof.get("head_sha") != exact_head or not proof.get("reviewer_ref") or proof.get("reviewer_independent") is not True:
                findings.append("MISSING_INDEPENDENT_EVIDENCE_RECORD:" + key)
            artifacts = proof.get("artifacts", {})
            if not isinstance(artifacts, dict) or any(
                not isinstance(artifacts.get(k), dict) or
                not isinstance(artifacts[k].get("artifact_ref"), str) or
                not artifacts[k]["artifact_ref"].strip() or
                not isinstance(artifacts[k].get("sha256"), str) or
                len(artifacts[k]["sha256"]) != 64 or
                any(c not in "0123456789abcdef" for c in artifacts[k]["sha256"])
                for k in DIMENSIONS
            ):
                findings.append("MISSING_EVIDENCE_ARTIFACT_DIGESTS:" + key)
            if not item.get("source_references"):
                findings.append("MISSING_MODULE_SOURCE_REFERENCES:" + key)
            if any(item.get("verification", {}).get(k) != "VERIFIED_EXECUTED" for k in DIMENSIONS):
                findings.append("UNSUPPORTED_COMPLETE:" + key)
            if not exact_head or not isinstance(exact_head,str) or len(exact_head)!=40 or any(c not in "0123456789abcdef" for c in exact_head):
                findings.append("MISSING_IMMUTABLE_HEAD:" + key)
            elif evidence_attestor is None:
                findings.append("INDEPENDENT_MODULE_ATTESTATION_REQUIRED:" + key)
            else:
                try:
                    independently_verified = evidence_attestor(key,item,exact_head)
                except Exception:
                    independently_verified = False
                if independently_verified is not True:
                    findings.append("INDEPENDENT_MODULE_ATTESTATION_FAILED:" + key)
    complete = sum(
        row.get("release_claim") == "COMPLETE" and
        all(row.get("verification", {}).get(k) == "VERIFIED_EXECUTED" for k in DIMENSIONS) and
        not any(f.endswith(":" + row["id"]) for f in findings)
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
