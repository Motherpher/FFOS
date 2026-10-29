"""M1/M2: explicit realm and governance anchor, with F8 required in FF estate.

This is a static consumer-context check. Neither a declared CDX anchor nor an
external-policy pointer verifies a live authority, signature or revocation.
"""
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from ama_vnext import digest, registry

ROOT=Path(__file__).resolve().parents[3]
POLICY_PATH=ROOT/"integrations/cdx/f8/realm-binding-policy.json"


def declare_realm(bundle, *, realm_id, realm_owner_ref, governing_principal_ref,
                  policy_authority_ref, security_anchor_ref, mode, category,
                  external_export_allowed=False):
    """Attach one unverified realm declaration without changing agent digests."""
    agent=bundle["agent"]
    bundle["operatingRealm"]={
        "schema":"ama.operating-realm/v0.2-candidate",
        "agentRef":{"id":agent["agentId"],"version":agent["agentVersion"],
                    "digest":digest(agent)},
        "realmId":realm_id,"realmCategory":category,
        "realmOwnerRef":realm_owner_ref,
        "governingPrincipalRef":governing_principal_ref,
        "policyAuthorityRef":policy_authority_ref,
        "securityAnchorRef":security_anchor_ref,
        "securityBindingMode":mode,
        "bindingStatus":"DECLARED_NOT_RUNTIME_VERIFIED",
        "externalExportAllowed":external_export_allowed,
    }
    return bundle


def check_realm(bundle, *, policy=None):
    errors=[]
    realm=bundle.get("operatingRealm")
    if realm is None:
        return _report(["OPERATING_REALM_REQUIRED"],None,False)
    if policy is None:
        policy=json.loads(POLICY_PATH.read_text(encoding="utf-8"))
    reg, schemas=registry()
    validator=Draft202012Validator(schemas["operating-realm"],
                                   registry=reg,format_checker=FormatChecker())
    if list(validator.iter_errors(realm)):
        return _report(["REALM_SCHEMA_INVALID"],realm,False)
    agent=bundle.get("agent",{})
    ref=realm["agentRef"]
    if not agent or ref["id"]!=agent.get("agentId") or (
            ref["version"]!=agent.get("agentVersion") or
            ref["digest"]!=digest(agent)):
        errors.append("REALM_AGENT_PIN_MISMATCH")
    if realm["governingPrincipalRef"] != agent.get("authority",{}).get("governingPrincipalRef"):
        errors.append("REALM_GOVERNING_PRINCIPAL_MISMATCH")
    root=policy["estate_root"]
    internal=realm["realmId"]==root or realm["realmId"].startswith(root+"/")
    if internal:
        if realm["realmCategory"]!=policy["realm_category"]:
            errors.append("INTERNAL_REALM_MISCLASSIFIED")
        if realm["securityBindingMode"]!=policy["required_mode"]:
            errors.append("CDX_DETACHMENT_FORBIDDEN_IN_FF_ESTATE")
        if realm["securityAnchorRef"]!=policy["required_security_anchor_ref"]:
            errors.append("CDX_ANCHOR_REQUIRED_IN_FF_ESTATE")
        if realm["policyAuthorityRef"]!=policy["required_policy_authority_ref"]:
            errors.append("CDX_POLICY_AUTHORITY_REQUIRED_IN_FF_ESTATE")
        if realm["externalExportAllowed"]:
            errors.append("INTERNAL_INSTANCE_CANNOT_EXPORT_ITS_REALM_BINDING")
    else:
        if realm["realmCategory"]!="EXTERNAL_CONSUMER":
            errors.append("EXTERNAL_REALM_MISCLASSIFIED")
        if realm["securityBindingMode"]=="DETACHED_EXTERNAL":
            if realm["securityAnchorRef"]==policy["required_security_anchor_ref"]:
                errors.append("DETACHED_CANNOT_REFERENCE_CDX_ANCHOR")
            if realm["policyAuthorityRef"]==policy["required_policy_authority_ref"]:
                errors.append("DETACHED_CANNOT_KEEP_CDX_POLICY_AUTHORITY")
        if realm["securityBindingMode"]=="MANDATORY" and (
            realm["securityAnchorRef"]==policy["required_security_anchor_ref"]):
            # Other organizations may elect the CDX provider, but this is not FF admission.
            pass
    return _report(errors,realm,internal)


def _report(errors,realm,internal):
    return {
        "schema":"ama.operating-realm-assessment/v1",
        "status":"REJECTED" if errors else "STATIC_REALM_ELIGIBLE",
        "errors":sorted(set(errors)),
        "realm_id":realm.get("realmId") if realm else None,
        "realm_category":realm.get("realmCategory") if realm else None,
        "governance_anchor":realm.get("securityAnchorRef") if realm else None,
        "f8_required_for_realm":internal,
        "f8_detachment_allowed":not internal,
        "runtime_cdx_verified":False,
        "external_authority_verified":False,
        "effect_authorized":False,
        "agent_activated":False,
    }
