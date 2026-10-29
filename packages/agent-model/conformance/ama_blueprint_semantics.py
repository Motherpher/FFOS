"""M7 composition of existing M2-M6 static validators.

A blueprint does not execute or admit agents. Time, trust domain and evidence
attestation are supplied by a host, never fabricated by the architecture.
"""
from ama_authorization import validate_authorization_contract
from ama_cognitive import validate_cognitive_contract
from ama_knowledge import validate_knowledge_catalogs
from ama_durability import validate_durability_contract
from ama_eventing import check_event_triggers
from ama_evaluation import evaluate
from ama_operations import validate_operational_contract
from ama_support_profiles import check_secret_bindings, check_localization_profiles


FIELDS = {
    "M2.authorization": ("principals", "mandates", "delegations",
                         "authorizationRequests", "authorizationDecisions", "approvals"),
    "M2.secrets": ("secretBindings",),
    "M3.cognition": ("modelProfiles", "instructionPackages", "planningProfiles",
                     "contextPolicies", "memoryProfiles", "memoryEntries",
                     "retrievalPolicies", "cognitiveBindings"),
    "M3.knowledge": ("knowledgeCatalogs",),
    "M4.durability": ("runs", "steps", "attempts", "checkpoints",
                      "effectReceipts", "reconciliations", "approvalEvents"),
    "M4.eventing": ("eventTriggers",),
    "M5.evaluation": ("evaluationProfiles", "evaluationCases",
                      "evaluationObservations", "evaluationProvenance",
                      "evaluationReports", "acceptanceAssessments"),
    "M6.operations": ("operationalProfiles", "compatibilityAssessments",
                      "healthSnapshots", "incidentRecords", "releasePlans",
                      "rollbackPlans"),
    "M6.localization": ("localizationProfiles",),
}


def audit(bundle, *, at=None, host_trust_domain=None):
    """Return static pass/fail and required inputs without inferring deployment.

    Partial source evidence, absent external attestation, and missing host
    context are never labeled as production readiness.
    """
    errors, pending, assessments = [], [], {}
    def active(name):
        return any(bundle.get(field) for field in FIELDS[name])
    def invoke(name, fn, *args, **kwargs):
        result = fn(*args, **kwargs)
        findings = result.get("errors", result.get("findings", []))
        bad = result.get("status") in ("REJECTED", "FAIL")
        if bad:
            errors.extend(name + ":" + str(code) for code in findings)
        assessments[name] = {
            "status": result.get("status"),
            "error_count": len(findings) if bad else 0,
            "effect_authorized": False,
            "runtime_verified": False,
        }

    if active("M2.authorization"):
        if at is None:
            pending.append("M2.authorization:HOST_TIME_REQUIRED")
        else:
            invoke("M2.authorization", validate_authorization_contract,
                   bundle, at=at)
    if active("M2.secrets"):
        invoke("M2.secrets", check_secret_bindings, bundle)
    if active("M3.cognition") or active("M3.knowledge"):
        if at is None:
            pending.append("M3.cognition:HOST_TIME_REQUIRED")
        else:
            invoke("M3.cognition", validate_cognitive_contract, bundle, at=at)
    if active("M3.knowledge"):
        if host_trust_domain is None:
            pending.append("M3.knowledge:TRUST_DOMAIN_REQUIRED")
        if at is not None and host_trust_domain is not None:
            invoke("M3.knowledge", validate_knowledge_catalogs, bundle,
                   at=at, host_trust_domain=host_trust_domain)
    if active("M4.durability"):
        invoke("M4.durability", validate_durability_contract, bundle)
    if active("M4.eventing"):
        invoke("M4.eventing", check_event_triggers, bundle)
    if active("M5.evaluation"):
        if at is None:
            pending.append("M5.evaluation:HOST_TIME_REQUIRED")
        else:
            profiles = bundle.get("evaluationProfiles", [])
            if not profiles:
                errors.append("M5.evaluation:PROFILE_REQUIRED")
            for profile in profiles:
                invoke("M5.evaluation:" + profile.get("profileId", "UNKNOWN"),
                       evaluate, bundle, profile_id=profile["profileId"], at=at)
    if active("M6.operations"):
        if at is None:
            pending.append("M6.operations:HOST_TIME_REQUIRED")
        else:
            invoke("M6.operations", validate_operational_contract, bundle, at=at)
    if active("M6.localization"):
        invoke("M6.localization", check_localization_profiles, bundle)
    return {
        "schema": "ama.m7.semantic-assessment/v1",
        "checks": assessments,
        "errors": sorted(set(errors)),
        "assessment_inputs_required": sorted(set(pending)),
        "configuration_eligible": not errors and not pending,
        "runtime_authorized": False,
        "host_trust_verified": False,
        "agent_activated": False,
    }
