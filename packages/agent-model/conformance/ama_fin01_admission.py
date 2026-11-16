"""AMA FIN-01 M1 admission evidence: identity separation and disclosure.
Portable, offline contract checks. No agent construction, registration or authority.
"""
from __future__ import annotations

REQUIRED_CARD = (
    "purpose", "intended_users", "limitations",
    "prohibited_applications", "test_profile", "change_history"
)
IDENTITY_KINDS = (
    "agent_definition", "runtime_deployment", "identity_principal",
    "workload_instance", "run"
)

def audit_identity_and_card(payload: object) -> dict:
    errors = []
    if not isinstance(payload, dict):
        return {"errors": ["INVALID_ADMISSION_RECORD"], "admission_eligible": False,
                "effect_authorized": False, "agent_activated": False}
    identities = payload.get("identities")
    if not isinstance(identities, dict):
        errors.append("IDENTITY_MAP_REQUIRED")
        identities = {}
    tokens = []
    for name in IDENTITY_KINDS:
        value = identities.get(name)
        if not isinstance(value, str) or not value.strip():
            errors.append("MISSING_IDENTITY:" + name)
        else:
            tokens.append(value.strip())
    if len(tokens) != len(set(tokens)):
        errors.append("IDENTITIES_NOT_DISTINCT")
    card = payload.get("card")
    if not isinstance(card, dict):
        errors.append("DOCUMENTATION_CARD_REQUIRED")
        card = {}
    for name in REQUIRED_CARD:
        value = card.get(name)
        if not isinstance(value, (str, list)) or not value:
            errors.append("MISSING_CARD_FIELD:" + name)
        elif isinstance(value, str) and not value.strip():
            errors.append("MISSING_CARD_FIELD:" + name)
        elif isinstance(value, list) and not all(isinstance(x, str) and x.strip() for x in value):
            errors.append("INVALID_CARD_FIELD:" + name)
    public = payload.get("discovery")
    if not isinstance(public, dict) or not isinstance(public.get("description"), str) or not public["description"].strip():
        errors.append("DISCOVERABILITY_DESCRIPTION_REQUIRED")
    # Discoverability is descriptive only. Capability/approval statements in a
    # card cannot create rights, including purported high-effect rights.
    claimed = public.get("claimed_effect_class") if isinstance(public, dict) else None
    if claimed is not None:
        errors.append("DISCOVERY_CANNOT_GRANT_EFFECTS")
    if payload.get("card_grants_authority") is True:
        errors.append("DOCUMENTATION_CANNOT_GRANT_AUTHORITY")
    return {"schema": "ama.fin01.admission-evidence/v1",
            "errors": sorted(set(errors)),
            "source_contract_eligible": not errors,
            "admission_eligible": False,
            "effect_authorized": False, "agent_activated": False,
            "assurance": "SYNTHETIC_CONTRACT_CHECK_ONLY"}
