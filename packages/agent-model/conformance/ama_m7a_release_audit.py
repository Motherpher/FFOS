"""M7-A source-backed architecture readiness assessment, never an acceptance decision.

The counts are deliberately separated: source mapping != implemented tests !=
green CI != architectural adoption. A report containing blockers is a valid
(non-authorizing) audit artifact; inconsistent or forged input fails validation.
"""
from __future__ import annotations
import argparse
import json
import os
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MAP = {"F1": "M1", "F2": "M2", "F3": "M3", "F4": "M3",
       "F5": "M4", "F6": "M5", "F7": "M6"}


def assess(milestones, requirements, bridge, coverage, distribution, gates, *, source_sha="UNATTESTED"):
    findings = []
    rows = requirements.get("items", [])
    ids = [x.get("id") for x in rows]
    refs = bridge.get("entries", [])
    linked = [x.get("requirement_id") for x in refs]
    modules = coverage.get("modules", [])
    if milestones.get("milestone_order") != [f"M{i}" for i in range(8)]:
        findings.append("INVALID_MILESTONE_ORDER")
    if len(ids) != 96 or len(set(ids)) != 96:
        findings.append("REQUIREMENT_SET_NOT_96_UNIQUE")
    if len(linked) != len(set(linked)) or set(linked) - set(ids):
        findings.append("EVIDENCE_LINKS_DUPLICATE_OR_UNKNOWN")
    if any(x.get("relation") != "PARTIAL_TEST_EVIDENCE" for x in refs):
        findings.append("EVIDENCE_OVERCLAIM")
    for row in rows:
        if row.get("package") not in MAP:
            findings.append("UNKNOWN_SOURCE_PACKAGE")
    if coverage.get("coverage_policy") != "SUPPLEMENTARY_WITHIN_M0_M7":
        findings.append("MODULE_INVENTORY_NOT_SUBORDINATE")
    if len(modules) != 32 or len({x.get("id") for x in modules}) != 32:
        findings.append("MODULE_SET_NOT_32_UNIQUE")
    valid_module_states = {"PARTIAL_EXISTING_CONTRACTS", "REQUIRES_TEMPLATE_CONTRACT", "COMPLETE"}
    if any(m.get("implementation_status") not in valid_module_states for m in modules):
        findings.append("UNKNOWN_MODULE_STATE")
    if distribution.get("architecture_version") != gates.get("version"):
        findings.append("CANDIDATE_VERSION_MISMATCH")
    if distribution.get("adoption", {}).get("agent_deployment_authorized") is not False:
        findings.append("FORBIDDEN_DEPLOYMENT_CLAIM")
    if gates.get("gates", {}).get("M7_A", {}).get("host_runtime_required") is not False:
        findings.append("HOST_RUNTIME_COUPLING")
    if gates.get("gates", {}).get("F8_7", {}).get("scope") != "REALM_CONDITIONAL_RUNTIME_BINDING":
        findings.append("F8_NOT_SEPARATE")
    unlinked = [x for x in rows if x.get("id") not in set(linked)]
    by_stage = defaultdict(list)
    for row in unlinked:
        by_stage[MAP.get(row.get("package"), "UNKNOWN")].append(row.get("id"))
    statuses = dict(sorted(Counter(m.get("implementation_status") for m in modules).items()))
    proposal_count = sum(x.get("decision") == "PROPOSED_PENDING_INDEPENDENT_HUMAN_ACCEPTANCE" for x in rows)
    unresolved_tests = sum(x.get("test_status") == "NOT_IMPLEMENTED" or
                           x.get("test_state") == "PLAN_ONLY_NOT_EXECUTED" for x in rows)
    adopted = distribution.get("adoption", {}).get("architecture_accepted") is True
    # A CI-produced self-report cannot attest the outcome of its own workflow.
    # A trusted release reviewer must attach exact-head CI and audit evidence.
    return {
        "schema": "ama.m7a.readiness-audit/v1",
        "architecture": "AMA",
        "source_commit": source_sha,
        "scope": "ARCHITECTURE_BASELINE_ONLY",
        "version": distribution.get("architecture_version"),
        "original_requirement_count": len(rows),
        "direct_partial_test_evidence_links": len(set(linked)),
        "requirements_without_direct_links": [x.get("id") for x in unlinked],
        "unlinked_by_milestone": dict(sorted(by_stage.items())),
        "proposed_requirements_pending_acceptance": proposal_count,
        "historical_unresolved_test_tracking": unresolved_tests,
        "historical_test_tracking_is_execution_proof": False,
        "module_count": len(modules),
        "module_status_counts": statuses,
        "module_contracts_fully_completed": statuses.get("COMPLETE", 0),
        "source_test_bridge_authenticates_ci": False,
        "exact_head_ci_verified": False,
        "independent_technical_audit_accepted": False,
        "architecture_accepted": adopted,
        "activation_authorized": False,
        "production_binding_required_for_architecture": False,
        "structural_findings": sorted(set(findings)),
        "disposition": "INVALID_SOURCE" if findings else
                       "ADOPTED_REVIEW_REQUIRED" if adopted else "M7_A_BLOCKED_PENDING_CI_AUDIT_AND_OWNER_ADOPTION"
    }


def load(root=ROOT):
    def read(path):
        return json.loads((root / path).read_text(encoding="utf-8"))
    return assess(
        read("packages/agent-model/ama-milestones.json"),
        read("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json"),
        read("packages/agent-model/ama-m0-test-evidence-bridge.json"),
        read("packages/agent-model/ama-template-coverage.json"),
        read("packages/agent-model/ama-distribution-manifest.json"),
        read("packages/agent-model/ama-release-gates.json"),
        source_sha=os.getenv("GITHUB_SHA", "UNATTESTED")
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    report = load()
    output = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    else:
        print(output, end="")
    raise SystemExit(1 if report["structural_findings"] else 0)
