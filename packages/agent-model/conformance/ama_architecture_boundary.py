"""AMA architecture boundary conformance: architecture, never agent instance."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REQUIRED_CONTRACTS={"agent","command","workflow","capability","tool-adapter","task","effect","run","evidence","evaluation","operational-lifecycle"}
REQUIRED_EXCLUSIONS={"INSTANTIATE_NAMED_AGENTS","SELECT_DOMAIN_POLICIES","PUBLISH_AGENT_RELEASES","DEPLOY_AGENTS","ACCEPT_OWN_CONFORMANCE"}
REQUIRED_INJECTIONS={"host_policy_injected","agent_identity_injected","domain_pack_optional","independent_acceptance_required","external_effects_deny_by_default"}

def validate_boundary(data):
    errors=[]
    def check(condition,code):
        if not condition: errors.append(code)
    check(data.get("schema")=="ama.architecture-boundary/v1","SCHEMA")
    check(data.get("architecture_id")=="AMA" and data.get("kind")=="REUSABLE_AGENT_ARCHITECTURE","ARCHITECTURE_NOT_AGENT")
    check(data.get("scope")=="DOMAIN_AGNOSTIC","DOMAIN_AGNOSTIC")
    for key in ("template_is_agent","production_authorized","conformance_is_deployment_authorization"):
        check(data.get(key) is False,"FORBIDDEN_TRUE:"+key)
    for key in ("default_domain","default_agent_instance","default_governing_authority","default_security_provider"):
        check(data.get(key) is None,"HOST_OR_AGENT_HARDCODED:"+key)
    contracts=data.get("contracts",[])
    check(isinstance(contracts,list) and len(contracts)==len(set(contracts)) and REQUIRED_CONTRACTS<=set(contracts),"MISSING_OR_DUPLICATE_CONTRACT")
    exclusions=data.get("excluded_responsibilities",[])
    check(isinstance(exclusions,list) and REQUIRED_EXCLUSIONS<=set(exclusions),"AGENT_SIDE_EFFECT_EXCLUSION")
    boundaries=data.get("boundaries",{})
    check(isinstance(boundaries,dict) and all(boundaries.get(k) is True for k in REQUIRED_INJECTIONS),"MISSING_EXTERNAL_BOUNDARY")
    check(data.get("contract_status") in {"CANDIDATE","REVIEWED","STABLE"},"INVALID_CONTRACT_STATUS")
    return errors

if __name__=="__main__":
    obj=json.loads((ROOT/"architecture-boundary.json").read_text(encoding="utf-8"))
    errors=validate_boundary(obj)
    if errors: raise SystemExit("FAIL: "+", ".join(errors))
    print("PASS: AMA architecture is generic, non-agent, non-deploying and externally governed")
