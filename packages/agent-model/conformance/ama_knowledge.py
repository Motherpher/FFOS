"""AMA M3 optional knowledge-catalog contract and conservative static admission.

This module does not read sources, verify their issuers, or grant access.
An ADMITTED label is only an untrusted configuration claim until a host
independently authenticates data, policy, and the request principal.
"""
from datetime import datetime, timezone
from jsonschema import Draft202012Validator, FormatChecker

from ama_vnext import digest, registry
from ama_cognitive import validate_cognitive_contract, _scope_inside, _time


def _report(errors, count):
    return {
        "status": "REJECTED" if errors else "STATIC_KNOWLEDGE_ELIGIBLE",
        "errors": sorted(set(errors)),
        "catalogs_checked": count,
        "sources_authenticated": False,
        "data_access_authorized": False,
        "runtime_verified": False,
        "source_content_is_authority": False,
        "requires_host_validation": [
            "SOURCE_ISSUER_AND_DIGEST", "ACCESS_POLICY_AND_DATA_CLASSIFICATION",
            "SOURCE_FRESHNESS_AND_REVOCATION", "QUERY_PRINCIPAL_AND_RECIPIENT",
        ],
    }


def validate_knowledge_catalogs(bundle, *, at, host_trust_domain):
    """Validate a bundle's *optional* knowledge source declarations.

    Host trust domain and time are injected. No network or host credentials
    are used; source/provider metadata alone is not an attestation.
    """
    errors = []
    base = validate_cognitive_contract(bundle, at=at)
    if base["status"] == "REJECTED":
        return _report(["INVALID_M3_BUNDLE"] + base["errors"],
                       len(bundle.get("knowledgeCatalogs", [])))
    try:
        now = _time(at)
    except (ValueError, TypeError, AttributeError):
        return _report(["INVALID_HOST_TIME"], len(bundle.get("knowledgeCatalogs", [])))
    if not isinstance(host_trust_domain, str) or not host_trust_domain.strip():
        return _report(["HOST_TRUST_DOMAIN_REQUIRED"], len(bundle.get("knowledgeCatalogs", [])))
    catalogs = bundle.get("knowledgeCatalogs", [])
    if not catalogs:
        return _report([], 0)
    reg, schemas = registry()
    validator = Draft202012Validator(schemas["knowledge-catalog"], registry=reg,
                                    format_checker=FormatChecker())
    for row in catalogs:
        if list(validator.iter_errors(row)):
            errors.append("SCHEMA:KNOWLEDGE_CATALOG")
    if errors:
        return _report(errors, len(catalogs))
    agent = bundle["agent"]
    modules = {m["moduleId"]: m for m in agent["modules"]}
    policies = {p["policyId"]: p for p in bundle.get("retrievalPolicies", [])}
    catalog_ids = [c["catalogId"] for c in catalogs]
    if len(set(catalog_ids)) != len(catalog_ids):
        errors.append("DUPLICATE_KNOWLEDGE_CATALOG")
    source_ids = set()
    for catalog in catalogs:
        module = modules.get(catalog["moduleId"])
        if (not module or not module["enabled"] or module["kind"] != "RETRIEVAL"):
            errors.append("KNOWLEDGE_MODULE_DISABLED")
        if catalog["status"] in ("DRAFT", "DEPRECATED", "SUSPENDED"):
            errors.append("KNOWLEDGE_CATALOG_NOT_ADMITTED")
        ref = catalog["retrievalPolicyRef"]
        policy = policies.get(ref["id"])
        if policy is None:
            errors.append("UNKNOWN_KNOWLEDGE_RETRIEVAL_POLICY")
            continue
        if policy["version"] != ref["version"] or digest(policy) != ref["digest"]:
            errors.append("KNOWLEDGE_RETRIEVAL_PIN_MISMATCH")
        if policy["moduleId"] != catalog["moduleId"]:
            errors.append("KNOWLEDGE_MODULE_POLICY_MISMATCH")
        for source in catalog["sources"]:
            if source["sourceId"] in source_ids:
                errors.append("DUPLICATE_KNOWLEDGE_SOURCE")
            source_ids.add(source["sourceId"])
            if not any(_scope_inside(source["sourceScope"], scope)
                       for scope in agent["mandate"]["scope"]):
                errors.append("KNOWLEDGE_OUTSIDE_AGENT_MANDATE")
            if not any(_scope_inside(source["sourceScope"], scope)
                       for scope in policy["allowedScopes"]):
                errors.append("KNOWLEDGE_OUTSIDE_RETRIEVAL_POLICY")
            try:
                observed = _time(source["observedAt"])
                if observed > now:
                    errors.append("KNOWLEDGE_FUTURE_SOURCE_TIMESTAMP")
                if (now - observed).total_seconds() > source["maxAgeSeconds"]:
                    if source["admissionState"] == "ADMITTED":
                        errors.append("STALE_KNOWLEDGE_ADMITTED")
            except (ValueError, TypeError):
                errors.append("KNOWLEDGE_SOURCE_TIME_INVALID")
            if source["admissionState"] == "ADMITTED":
                if source["trustLabel"] != "VERIFIED":
                    errors.append("UNTRUSTED_KNOWLEDGE_ADMITTED")
                if source["trustLabel"] not in policy["allowedTrustLabels"]:
                    errors.append("KNOWLEDGE_TRUST_NOT_ALLOWED")
                if (source["trustDomain"] != host_trust_domain
                        and policy["crossTrustDomain"] == "DENY"):
                    errors.append("CROSS_DOMAIN_KNOWLEDGE_DENIED")
                if source["sensitivity"] in ("CONFIDENTIAL", "RESTRICTED"):
                    if not source.get("hostAuthorizationRef"):
                        errors.append("SENSITIVE_KNOWLEDGE_NEEDS_HOST_AUTHORIZATION")
    return _report(errors, len(catalogs))
