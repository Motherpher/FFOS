#!/usr/bin/env python3
"""Validate FFOS DevSecOps assurance register structure and claim discipline.

Does NOT test or certify runtime enforcement, branch settings, production deployments,
vulnerability absence, independent assessment or Director acceptance.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path

SCHEMA = "ffos.devsecops.assurance-register/v1.0"
GATES = [f"G{i}" for i in range(9)]
EVIDENCE = {"NOT_ASSESSED", "PARTIAL", "VERIFIED", "FAILED", "HOLD"}
DECISIONS = {"NOT_DECIDED", "PASS", "FAIL", "HOLD", "WAIVED"}
SHA40 = re.compile(r"^[a-fA-F0-9]{40}$")


def nonblank(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate(register: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(register, dict):
        return ["register: expected JSON object"]
    if register.get("schema") != SCHEMA:
        errors.append("schema: unrecognized/incorrect version")
    if register.get("framework_id") != "FFOS-DSA-001":
        errors.append("framework_id: incorrect")
    if register.get("programme_state") != "PROPOSAL_NOT_ACCEPTED":
        errors.append("programme_state: candidate cannot claim accepted or active")
    if register.get("governed_repository") != "Motherpher/FFOS":
        errors.append("governed_repository: incorrect binding")
    rev = register.get("baseline_source_revision")
    if not nonblank(rev) or SHA40.fullmatch(rev) is None:
        errors.append("baseline_source_revision: full SHA-1 commit required")
    if not nonblank(register.get("baseline_observed_at")):
        errors.append("baseline_observed_at: required")
    maturity = register.get("maturity_assessment")
    if not isinstance(maturity, dict):
        errors.append("maturity_assessment: expected object")
    elif maturity.get("state") == "NOT_ASSESSED" and maturity.get("maturity_level") is not None:
        errors.append("maturity_assessment: cannot assign a level without assessment")

    gates = register.get("gates")
    if not isinstance(gates, list):
        return errors + ["gates: expected array"]
    ids = [g.get("gate_id") if isinstance(g, dict) else None for g in gates]
    if ids != GATES:
        errors.append("gates: expected exactly G0..G8 in order, no duplicates")

    for index, gate in enumerate(gates):
        label = f"gates[{index}]"
        if not isinstance(gate, dict):
            errors.append(f"{label}: expected object")
            continue
        ev = gate.get("evidence_state")
        d = gate.get("assurance_disposition")
        if ev not in EVIDENCE:
            errors.append(f"{label}: invalid evidence_state")
        if d not in DECISIONS:
            errors.append(f"{label}: invalid assurance_disposition")
        if not nonblank(gate.get("gate_name")):
            errors.append(f"{label}: gate_name required")
        if not nonblank(gate.get("observed_at")):
            errors.append(f"{label}: observed_at required")
        if gate.get("source_revision") != rev:
            errors.append(f"{label}: source_revision must match baseline source revision")
        refs = gate.get("evidence_refs")
        if not isinstance(refs, list) or any(not nonblank(r) for r in refs):
            errors.append(f"{label}: evidence_refs must be an array of nonempty strings")
            refs = []
        if not nonblank(gate.get("limitations")):
            errors.append(f"{label}: limitations required (state and scope)")
        if ev == "FAILED" and d not in {"FAIL", "HOLD"}:
            errors.append(f"{label}: failed evidence cannot be passed or undecided")
        if d == "PASS":
            if ev != "VERIFIED":
                errors.append(f"{label}: PASS requires VERIFIED evidence")
            if not refs:
                errors.append(f"{label}: PASS requires evidence references")
            if not nonblank(gate.get("verifier")):
                errors.append(f"{label}: PASS requires named independent verifier")
            if not nonblank(gate.get("decision_ref")):
                errors.append(f"{label}: PASS requires human/authorized decision reference")
            if gate.get("waiver") is not None:
                errors.append(f"{label}: PASS cannot be represented as a waiver")
        if d == "WAIVED":
            w = gate.get("waiver")
            if not isinstance(w, dict) or not all(
                nonblank(w.get(field)) for field in ("authority", "decision_ref", "reason", "scope", "risk", "review_by")
            ):
                errors.append(f"{label}: WAIVED requires authority, decision, reason, scope, risk and review_by")
            if ev == "VERIFIED":
                errors.append(f"{label}: waiver must not replace verified evidence")
        elif gate.get("waiver") is not None:
            errors.append(f"{label}: waiver object only valid when disposition=WAIVED")
    return errors


def self_test(data: dict) -> None:
    """Mutation checks prove the local validator rejects unsupported optimistic states."""
    assert validate(data) == [], "baseline register failed internal checks"
    scenarios = (
        ("unsupported pass", lambda g: g.update(assurance_disposition="PASS")),
        ("unsupported waiver", lambda g: g.update(assurance_disposition="WAIVED")),
        ("failed evidence hidden", lambda g: g.update(evidence_state="FAILED", assurance_disposition="NOT_DECIDED")),
    )
    for name, change in scenarios:
        mutant = copy.deepcopy(data)
        change(mutant["gates"][0])
        assert validate(mutant), f"validator accepted: {name}"
    mutant = copy.deepcopy(data)
    mutant["gates"] = mutant["gates"][1:]
    assert validate(mutant), "validator accepted missing gate"
    mutant = copy.deepcopy(data)
    mutant["programme_state"] = "ENFORCING"
    assert validate(mutant), "validator accepted unapproved activation"
    print("PASS: validator positive and negative mutation tests")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "register", nargs="?", default="docs/governance/devsecops/assurance-register-v1.json"
    )
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    data = json.loads(Path(args.register).read_text(encoding="utf-8"))
    errors = validate(data)
    if errors:
        for error in errors:
            print("ERROR:", error, file=sys.stderr)
        return 1
    if args.self_test:
        self_test(data)
    print(f"PASS: register format and claims validated ({len(data['gates'])} candidate gates)")
    print("NOTICE: No live enforcement, compliance certification or Director acceptance verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
