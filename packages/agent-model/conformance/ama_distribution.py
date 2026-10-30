"""Portable AMA distribution manifest validation (static; no agent activation)."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"ama-distribution-manifest.json"
REQUIRED={"manifest","workflow","command","capability","tool-adapter","task","effect","evidence","authorization","cognition","memory","durability","evaluation","operations"}
REQUIRED_HOST={"agent_identity","mandate","policy_authority","credentials","evidence_custody","runtime_host","deployment_control"}
def validate(data):
    errors=[]
    def check(x,c):
        if not x: errors.append(c)
    check(data.get("schema")=="ama.distribution-manifest/v1","SCHEMA")
    check(data.get("name")=="AMA" and data.get("artifact_kind")=="ARCHITECTURE_SDK_CANDIDATE","NOT_ARCHITECTURE")
    for k in ("not_an_agent","portable","domain_agnostic"):
        check(data.get(k) is True,"MISSING_TRUE:"+k)
    check(data.get("status")=="ENGINEERING_CANDIDATE","PREMATURE_STABLE")
    check(data.get("legacy_contract",{}).get("change_policy")=="PRESERVE_V1","LEGACY_POLICY")
    check(data.get("candidate_contracts",{}).get("offline_resolvable") is True,"OFFLINE_REQUIRED")
    check(REQUIRED<=set(data.get("interfaces",[])),"INTERFACE_COVERAGE")
    check(REQUIRED_HOST<=set(data.get("host_provided",[])),"HOST_INJECTION")
    check(data.get("conformance",{}).get("assurance_level")=="STATIC_SYNTHETIC_NON_AUTHORIZING","FALSE_ASSURANCE")
    adoption=data.get("adoption",{})
    for k in ("architecture_accepted","agent_deployment_authorized"):
        check(adoption.get(k) is False,"PREMATURE_ACCEPTANCE:"+k)
    check(adoption.get("owner_review_and_acceptance_required") is True,"OWNER_ACCEPTANCE_REQUIRED")
    check(data.get("template_complete") is False,"FALSE_TEMPLATE_COMPLETION")
    check(data.get("template_coverage")=="packages/agent-model/ama-template-coverage.json","COVERAGE_BINDING")
    check(data.get("canonical_milestones")=="packages/agent-model/ama-milestones.json","M0_M7_BOUNDARY")
    check(data.get("f8_integration_mode")=="MANDATORY_FOR_FF_ESTATE_DETACHABLE_FOR_EXTERNAL","F8_REALM_POLICY")
    check(data.get("internal_stewardship_realm")=="packages/agent-model/ama-stewardship-realm.json","AMA_STEWARDSHIP_REALM")
    check(data.get("f8_realm_policy")=="integrations/cdx/f8/realm-binding-policy.json","F8_REALM_BINDING")
    check(data.get("require_agent_operating_realm_at_construction") is True,"REALM_REQUIRED_FOR_AGENT")
    check(data.get("external_distribution_requires_explicit_host_governance") is True,"NO_UNGOVERNED_EXPORT")
    check({"HOUSEHOLD","MESSI","CDX_WORK_PACKAGE_EXECUTOR"}<=set(data.get("excluded",[])),"INSTANCE_SCOPE_LEAK")
    return errors

if __name__=="__main__":
    issues=validate(json.loads(MANIFEST.read_text(encoding="utf-8")))
    if issues: raise SystemExit("FAIL: "+", ".join(issues))
    print("PASS: portable AMA architecture distribution candidate; not an agent")
