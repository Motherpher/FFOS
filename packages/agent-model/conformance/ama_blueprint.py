"""Assemble a non-executing AMA agent blueprint from the existing M1 bundle.

This is a construction artifact: it reuses M0-M7, original M1 schema checks,
and optional F8 integration. It cannot create, register or activate an agent.
"""
import argparse
import json
from pathlib import Path

from ama_vnext import digest, validate_bundle
from ama_milestone_integrity import load as milestone_integrity
from ama_blueprint_semantics import audit as audit_semantics

ROOT = Path(__file__).resolve().parents[3]
MODEL = ROOT / "packages" / "agent-model"


def assemble(bundle, optional_modules=(), use_f8=False, *, at=None, host_trust_domain=None, attestor=None):
    """Return a build blueprint and precise blocking obligations.

    Invalid bundles and unrecognized optional modules fail closed.
    A passing blueprint is not a runtime-implementation readiness finding.
    """
    problems = validate_bundle(bundle)
    stage_report = milestone_integrity()
    if stage_report["errors"]:
        problems.extend("MILESTONE:" + e for e in stage_report["errors"])
    coverage = json.loads((MODEL / "ama-template-coverage.json").read_text(encoding="utf-8"))
    canonical = json.loads((MODEL / "ama-milestones.json").read_text(encoding="utf-8"))
    rows = coverage["modules"]
    allowed = {x["id"] for x in rows if x["requirement"] == "OPTIONAL"}
    requested = list(optional_modules)
    if len(requested) != len(set(requested)):
        problems.append("DUPLICATE_OPTIONAL_MODULE")
    for module in requested:
        if module not in allowed:
            problems.append("UNKNOWN_OR_NON_OPTIONAL_MODULE:" + str(module))

    # Optional bundle records cannot silently evade the construction inventory.
    configured = {
        "knowledgeCatalogs": "knowledge",
        "eventTriggers": "eventing",
        "secretBindings": "secrets",
        "localizationProfiles": "localization",
        "memoryProfiles": "memory",
        "retrievalPolicies": "retrieval",
        "cognitiveBindings": "cognition",
        "contextPolicies": "context",
        "approvalEvents": "human-interaction",
        "operationalProfiles": "operations",
    }
    implicitly_selected = {module for field, module in configured.items()
                           if bundle.get(field) and module in allowed}
    selected = {x["id"] for x in rows if x["requirement"] == "CORE"}
    selected.update(x for x in requested if x in allowed)
    selected.update(implicitly_selected)
    assessment = {
        "schema": "ama.m7.semantic-assessment/v1",
        "checks": {},
        "errors": [],
        "assessment_inputs_required": [],
        "configuration_eligible": False,
        "runtime_authorized": False,
        "host_trust_verified": False,
        "agent_activated": False,
    }
    # Never run semantic validators against structurally malformed bundles.
    if not problems:
        assessment = audit_semantics(bundle, at=at,
                                     host_trust_domain=host_trust_domain,
                                     attestor=attestor)
        problems.extend(assessment["errors"])
    obligations = {}
    stage_summary = {}
    for stage in canonical["milestone_order"]:
        applicable = [x for x in rows
                      if x.get("milestone") == stage and x["id"] in selected]
        stage_summary[stage] = {
            "purpose": canonical["milestones"][stage]["purpose"],
            "modules": [x["id"] for x in applicable],
            "research_requirement_count": stage_report["stages"][stage]["requirement_count"],
        }
        for row in applicable:
            if row["implementation_status"] != "COMPLETE":
                obligations[row["id"]] = {
                    "milestone": stage,
                    "state": row["implementation_status"],
                    "required_work": "COMPLETE_TEMPLATE_CONTRACT" if
                        row["implementation_status"] == "REQUIRES_TEMPLATE_CONTRACT"
                        else "ASSESS_AND_COMPLETE_EXISTING_CONTRACT",
                }
    if use_f8:
        obligations["F8_HOST_BINDING"] = {
            "milestone": "F8",
            "state": "OPTIONAL_EXTERNAL_HOST_INTEGRATION",
            "required_work": "VERIFY_INSTANCE_SPECIFIC_CDX_BINDING_WHEN_DEPLOYED",
        }

    return {
        "schema": "ama.agent-blueprint/v0.2-candidate",
        "architecture": "AMA",
        "subject": "AGENT_DEFINITION_BLUEPRINT_NOT_AN_AGENT",
        "bundle_digest": digest(bundle),
        "bundle_agent_id": bundle.get("agent", {}).get("agentId"),
        "architecture_stages": canonical["milestone_order"],
        "optional_host_integrations": ["F8_CDX"] if use_f8 else [],
        "selected_optional_modules": sorted((set(x for x in requested if x in allowed)) | implicitly_selected),
        "stages": stage_summary,
        "implementation_obligations": obligations,
        "status": ("INVALID_SOURCE" if problems else
                   "ASSESSMENT_INPUT_REQUIRED" if assessment["assessment_inputs_required"] else
                   "CONSTRUCTION_BLUEPRINT_CANDIDATE"),
        "semantic_assessment": assessment,
        "assessment_inputs_required": assessment["assessment_inputs_required"],
        "validation_errors": sorted(set(problems)),
        "template_complete": False if obligations or problems or assessment["assessment_inputs_required"] else stage_report["template_complete"],
        "runtime_accepted": False,
        "effect_authorized": False,
        "agent_registered": False,
        "agent_activated": False,
    }


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("bundle", type=Path, help="Existing AMA v0.2 bundle JSON")
    cli.add_argument("--optional", action="append", default=[],
                     help="Optional inventory module identifier; repeat as required")
    cli.add_argument("--f8-cdx", action="store_true",
                     help="Include F8 host integration requirement, not CDX activation")
    cli.add_argument("--at", help="Trusted host assessment timestamp with timezone")
    cli.add_argument("--host-trust-domain", help="Injected trust-domain label for knowledge checks")
    cli.add_argument("--output", type=Path)
    opts = cli.parse_args()
    obj = json.loads(opts.bundle.read_text(encoding="utf-8"))
    blueprint = assemble(obj, opts.optional, opts.f8_cdx,
                         at=opts.at, host_trust_domain=opts.host_trust_domain)
    text = json.dumps(blueprint, ensure_ascii=False, indent=2) + "\n"
    if opts.output:
        opts.output.parent.mkdir(parents=True, exist_ok=True)
        opts.output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")
    raise SystemExit(1 if blueprint["validation_errors"] or blueprint["assessment_inputs_required"] else 0)
