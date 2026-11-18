"""AMA FIN-02 cross-module construction conformance (non-executing).

32-module semantic configuration contract, preserving M0-M7 and optional OFF.
Checks independently declared controls; it does not attest a policy provider,
validate real credentials, instantiate any agent, or certify module completion.
"""
from __future__ import annotations
import re

# Contract controls are portable interface obligations, not host implementations.
CONTROLS = {
 "identity":("definition_id","deployment_id","principal_id","instance_id","run_id"),
 "mandate":("owner_ref","scope","expiry_rule","revocation_rule"),
 "instruction":("priority_order","untrusted_input_rule","conflict_rule"),
 "capability":("registry_ref","effect_ceiling","resource_scope_rule"),
 "workflow":("step_graph_ref","terminal_rule","cycle_denial_rule"),
 "command":("token_registry_ref","workflow_binding_rule","input_validation_rule"),
 "adapter":("interface_ref","credential_boundary_rule","failure_rule"),
 "authorization":("policy_decision_ref","deny_rule","approval_separation_rule"),
 "task-execution":("state_machine_ref","retry_rule","cancellation_rule","unknown_effect_rule"),
 "evidence":("provenance_rule","immutable_custody_ref","correlation_rule"),
 "conformance":("schema_test_ref","negative_test_ref","independent_verification_rule"),
 "lifecycle":("version_policy","migration_rule","rollback_rule","retirement_rule"),
 "cognition":("model_pin_rule","reasoning_budget","untrusted_output_rule"),
 "context":("context_budget","source_trust_rule","injection_boundary"),
 "memory":("retention_rule","consent_rule","retrieval_scope_rule"),
 "retrieval":("source_authorization_rule","freshness_rule","citation_rule"),
 "knowledge":("catalog_ref","source_provenance_rule","trust_tier_rule"),
 "multi-agent":("delegation_scope_rule","identity_binding","revocation_rule"),
 "eventing":("trigger_registry","idempotency_rule","replay_denial_rule"),
 "durability":("checkpoint_rule","lease_fence_rule","reconciliation_rule"),
 "human-interaction":("handoff_rule","approval_identity_rule","timeout_rule"),
 "observability":("correlation_rule","telemetry_schema","redaction_rule"),
 "evaluation":("gold_dataset_ref","negative_suite_ref","independent_grader_rule"),
 "safety":("threat_model_ref","effect_denial_rule","incident_stop_rule"),
 "privacy":("classification_rule","retention_rule","erasure_boundary"),
 "secrets":("secret_reference_rule","rotation_rule","no_plaintext_rule"),
 "interoperability":("protocol_version_pin","authorization_boundary","capability_negotiation_rule"),
 "deployment":("immutable_build_ref","readiness_gate","rollback_gate"),
 "operations":("monitoring_rule","incident_escalation","stale_state_stop"),
 "cost-control":("cost_ceiling","unknown_cost_rule","overrun_stop"),
 "localization":("locale_policy","fallback_rule","accessibility_rule"),
 "governance":("accountable_owner","risk_register_ref","external_acceptance_rule"),
}
VERSION=re.compile(r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[A-Za-z0-9.-]+)?$")

def validate_module_contracts(inventory:dict, configuration:dict)->dict:
    """Fail closed on malformed/incomplete per-module semantic declarations.

    This is candidate interface conformance, not executable module semantics.
    """
    findings=[]
    originals=inventory.get("modules") if isinstance(inventory,dict) else None
    rows=configuration.get("modules") if isinstance(configuration,dict) else None
    if not isinstance(originals,list) or not isinstance(rows,list):
        return _result(["INVALID_SOURCE_STRUCTURE"],0,0)
    ids=[x.get("id") for x in originals if isinstance(x,dict)]
    keys=[x.get("id") for x in rows if isinstance(x,dict)]
    if (len(originals)!=32 or len(rows)!=32 or len(set(ids))!=32 or
        len(set(keys))!=32 or set(ids)!=set(CONTROLS) or set(keys)!=set(CONTROLS)):
        findings.append("NONCANONICAL_MODULE_SET")
    sources={x["id"]:x for x in originals if isinstance(x,dict) and isinstance(x.get("id"),str)}
    configs={x["id"]:x for x in rows if isinstance(x,dict) and isinstance(x.get("id"),str)}
    evaluated=0
    selected=0
    for name, required in CONTROLS.items():
        source=sources.get(name)
        row=configs.get(name)
        if not source or not row:
            findings.append("MODULE_MISSING:"+name)
            continue
        evaluated+=1
        core=source.get("requirement")=="CORE"
        if source.get("requirement") not in ("CORE","OPTIONAL"):
            findings.append("INVALID_CLASSIFICATION:"+name)
        if type(row.get("enabled")) is not bool:
            findings.append("INVALID_ENABLED:"+name)
            continue
        if core and not row["enabled"]:
            findings.append("CORE_DISABLED:"+name)
        if not row["enabled"]:
            continue
        selected+=1
        if not isinstance(row.get("version"),str) or not VERSION.fullmatch(row["version"]):
            findings.append("VERSION_UNPINNED:"+name)
        controls=row.get("controls")
        if not isinstance(controls,dict):
            findings.append("CONTROL_MAP_REQUIRED:"+name)
            controls={}
        for field in required:
            value=controls.get(field)
            if not isinstance(value,(str,list,dict)) or not value:
                findings.append("CONTROL_MISSING:"+name+":"+field)
            elif isinstance(value,str) and not value.strip():
                findings.append("CONTROL_MISSING:"+name+":"+field)
        if not core:
            if not isinstance(row.get("approval_ref"),str) or not row["approval_ref"].strip():
                findings.append("OPTIONAL_APPROVAL_REQUIRED:"+name)
            if row.get("approval_attested") is not True:
                findings.append("OPTIONAL_APPROVAL_UNATTESTED:"+name)
        required_host=source.get("remaining_host_obligations",[])
        host=row.get("host_obligations")
        if not isinstance(required_host,list) or not isinstance(host,list) or any(not isinstance(x,str) for x in required_host+host):
            findings.append("HOST_DECLARATION_INVALID:"+name)
        elif not set(required_host).issubset(set(host)):
            findings.append("HOST_OBLIGATIONS_UNDECLARED:"+name)
        if row.get("implementation_complete") is True or row.get("effect_authorized") is True:
            findings.append("UNSUPPORTED_COMPLETENESS_OR_AUTHORITY:"+name)
    return _result(sorted(set(findings)),evaluated,selected)

def _result(findings,evaluated,selected):
    return {"schema":"ama.fin02.semantic-module-preflight/v1",
            "status":"REJECTED" if findings else "CANDIDATE_INTERFACE_VALID_ONLY",
            "findings":findings,"modules_evaluated":evaluated,"modules_selected":selected,
            "module_semantics_executed":False,"independent_verified_complete":0,
            "external_authority_verified":False,"agent_constructed":False,
            "agent_activation_authorized":False,"fin02_accepted":False}
