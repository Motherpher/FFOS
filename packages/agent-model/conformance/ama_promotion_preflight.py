"""AMA release evidence preflight (not an activation or approval service).

A PASS here means only that required independently issued references are present
and internally consistent. Authenticity and live service state remain unproven until
the receiving trust-boundary verifies the references using its own credentials.
No registry mutation or external effects are performed.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

REQUIRED = {
    "agent_id", "agent_version", "ama_version", "manifest_sha256",
    "static_conformance_ref", "runtime_conformance_ref",
    "negative_effect_test_ref", "revocation_test_ref",
    "cdx_policy_decision_ref", "cdx_policy_pin",
    "durable_registry_ref", "evidence_integrity_ref",
    "independent_verification_ref", "director_acceptance_ref",
    "deployment_binding_ref", "rollback_plan_ref",
}
NO_SELF_REVIEW = (
    ("executor_principal", "verifier_principal"),
    ("executor_principal", "acceptor_principal"),
    ("verifier_principal", "acceptor_principal"),
)


def preflight(data: object) -> dict:
    findings: list[str] = []
    if not isinstance(data, dict):
        return {"status": "HOLD", "assurance": "REFERENCES_ONLY_NOT_AUTHENTICATED",
                "findings": ["Input must be a JSON object."], "activation_authorized": False}
    missing = sorted(key for key in REQUIRED
                     if not isinstance(data.get(key), str) or not data[key].strip())
    findings.extend(f"MISSING:{key}" for key in missing)
    for left, right in NO_SELF_REVIEW:
        a, b = data.get(left), data.get(right)
        if not isinstance(a, str) or not a.strip() or not isinstance(b, str) or not b.strip():
            findings.append(f"SEPARATION_UNPROVEN:{left}:{right}")
        elif a.strip() == b.strip():
            findings.append(f"SELF_REVIEW:{left}:{right}")
    if data.get("requested_transition") not in ("VALIDATED_TO_DEPLOYABLE", "DEPLOYABLE_TO_ACTIVE"):
        findings.append("UNRECOGNIZED_TRANSITION")
    if data.get("static_conformance_status") != "STATIC_PASS":
        findings.append("STATIC_CONFORMANCE_NOT_PASSED")
    if data.get("runtime_conformance_status") != "PASS":
        findings.append("RUNTIME_CONFORMANCE_NOT_PASSED")
    if data.get("independent_verification_status") != "PASS":
        findings.append("INDEPENDENT_VERIFICATION_NOT_PASSED")
    if data.get("director_acceptance_status") != "APPROVED":
        findings.append("DIRECTOR_ACCEPTANCE_NOT_APPROVED")
    if data.get("revoked") is not False:
        findings.append("REVOCATION_STATUS_NOT_CLEAR")
    if data.get("manifest_sha256") and (
        not isinstance(data["manifest_sha256"], str)
        or len(data["manifest_sha256"]) != 64
        or any(ch not in "0123456789abcdefABCDEF" for ch in data["manifest_sha256"])
    ):
        findings.append("MANIFEST_HASH_INVALID")
    return {
        "contract": "ffos.ama.promotion-preflight/v1",
        "status": "HOLD" if findings else "REFERENCES_COMPLETE_UNVERIFIED",
        "assurance": "REFERENCES_ONLY_NOT_AUTHENTICATED",
        "findings": sorted(findings),
        "activation_authorized": False,
        "next_gate": "INDEPENDENT_AUTHENTICATED_POLICY_REGISTRY_AND_DIRECTOR_VERIFICATION",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="AMA offline release preflight, never activation")
    parser.add_argument("--evidence", required=True, type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    try:
        output = preflight(json.loads(args.evidence.read_text(encoding="utf-8")))
    except (OSError, ValueError) as exc:
        output = {"status": "HOLD", "assurance": "REFERENCES_ONLY_NOT_AUTHENTICATED",
                  "activation_authorized": False, "findings": ["INPUT_ERROR:" + str(exc)]}
    serialized = json.dumps(output, indent=2) + "\n"
    if args.report:
        args.report.write_text(serialized, encoding="utf-8")
    print(serialized, end="")
    return 0 if output["status"] == "REFERENCES_COMPLETE_UNVERIFIED" else 1


if __name__ == "__main__":
    raise SystemExit(main())
