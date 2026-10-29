#!/usr/bin/env python3
"""Fail-closed structural checks for Household Family's AMA agent-instance candidate."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
def validate(obj):
    issues = []
    def req(ok, reason):
        if not ok: issues.append(reason)
    req(obj.get("kind") == "AGENT_INSTANCE", "Household must be an agent instance")
    arch = obj.get("architecture", {})
    req(arch.get("name") == "AMA" and arch.get("kind") == "ARCHITECTURE_NOT_AGENT", "AMA must remain architecture")
    gov = obj.get("governance", {})
    req(gov.get("governing_authority") == "FFOS_DIRECTOR", "Director must govern")
    req(gov.get("security_authority") == "CDX_EXTERNAL", "CDX security must stay external")
    for flag in ["self_acceptance", "may_reprioritize", "may_modify_authority", "may_merge", "may_publish", "may_deploy"]:
        req(gov.get(flag) is False, f"forbidden governance flag: {flag}")
    roles = obj.get("roles", [])
    req(isinstance(roles, list) and {x.get("name") for x in roles if isinstance(x, dict)} == {"JANITOR","HANDYMAN","VERIFIER"}, "exact three bounded roles required")
    verifier = next((x for x in roles if isinstance(x,dict) and x.get("name")=="VERIFIER"), {})
    req(verifier.get("independent_from_executor") is True and verifier.get("may_accept_work") is False,"Verifier must not accept own work")
    interface = obj.get("interface", {})
    req(interface.get("target") == "CHATGPT_COMPATIBLE_MCP" and interface.get("status") == "SPECIFIED_NOT_DEPLOYED","no false MCP deployment claim")
    orch=obj.get("orchestrator",{})
    req(orch.get("unknown_remote_effect") == "HOLD_RECONCILE" and orch.get("status") == "NOT_LIVE_VERIFIED","durability must fail closed")
    commands=obj.get("commands", [])
    req(bool(commands) and all(isinstance(c,dict) and c.get("requires_director_assignment") is True for c in commands),"commands require Director mandate")
    req(all(isinstance(c,dict) and c.get("mode") in {"READ_ONLY","DRAFT_PR_ONLY","INDEPENDENT_EVIDENCE"} for c in commands), "forbidden effect mode")
    required=obj.get("work_package_required_fields", [])
    req(isinstance(required,list) and len(required)==len(set(required)) and all(x in required for x in ["wp_id","director_order_ref","source_pin","scope_paths","dependency_refs","effect_ceiling","acceptance_criteria","evidence_target"]), "missing WP mandate fields")
    life=obj.get("lifecycle",{})
    req(life.get("production_authorized") is False and life.get("release_binding") == "HOLD_EXTERNAL_GOVERNANCE","no implicit production authorization")
    evidence=obj.get("evidence",{})
    req(evidence.get("no_self_attestation") is True and evidence.get("independent_custody") == "REQUIRED_FOR_PRODUCTION","independent evidence missing")
    return issues

if __name__ == "__main__":
    errors=validate(json.loads((ROOT/"household-instance.contract.json").read_text()))
    if errors: raise SystemExit("FAIL: " + "; ".join(errors))
    print("PASS: Household candidate contract is an AMA-built, Director-governed, fail-closed agent instance (not deployed)")
