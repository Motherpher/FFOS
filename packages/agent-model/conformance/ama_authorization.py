"""M2 provider-neutral authorization *precheck* -- no runtime authorization.

IMPORTANT: an agent-controlled JSON document cannot prove identity, signatures,
revocation freshness, the policy issuer, independent approval or enforcement.
No outcome of this function is PERMIT/ALLOW. Even a clean precheck requires
an authenticated host policy decision and an independent effect/read gate.
"""
from __future__ import annotations

from datetime import datetime, timezone
from jsonschema import Draft202012Validator, FormatChecker
from ama_vnext import digest, registry, validate_bundle, RANK

CLASS = {"PUBLIC": 0, "INTERNAL": 1, "CONFIDENTIAL": 2, "RESTRICTED": 3}
EFFECT_KIND = {"E0_OBSERVE": "OBSERVE", "E1_INTERNAL_STATE": "STATE_MUTATION",
               "E2_REPOSITORY_CHANGE": "REPOSITORY_MUTATION",
               "E3_EXTERNAL_EFFECT": "EXTERNAL_ACTION",
               "E4_AUTHORITY_CHANGE": "AUTHORITY_CHANGE"}


def _instant(value):
    value = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        raise ValueError("TIMEZONE_REQUIRED")
    return parsed.astimezone(timezone.utc)


def _within(child, parent):
    return child == parent or child.startswith(parent.rstrip("/") + "/")


def _match(grant, request):
    return (grant["actionKind"] == request["actionKind"]
            and grant["effectClass"] == request["effectClass"]
            and _within(request["resourceScope"], grant["resourceScope"])
            and CLASS[request["dataClassification"]] <= CLASS[grant["maxDataClassification"]]
            and request["recipientId"] in grant["allowedRecipients"]
            and (not request["riskContext"]["aggregateRead"] or grant["allowAggregation"])
            and grant["purpose"] == request["purpose"])


def _attenuated(child, parent):
    return (child["actionKind"] == parent["actionKind"]
            and child["effectClass"] == parent["effectClass"]
            and _within(child["resourceScope"], parent["resourceScope"])
            and CLASS[child["maxDataClassification"]] <= CLASS[parent["maxDataClassification"]]
            and set(child["allowedRecipients"]).issubset(set(parent["allowedRecipients"]))
            and (not child["allowAggregation"] or parent["allowAggregation"])
            and child["purpose"] == parent["purpose"]
            and (not parent["requiresHumanReview"] or child["requiresHumanReview"]))


def validate_authorization_contract(bundle, *, at):
    """Validate static authorization declarations; status is NEVER a policy permit.

    at: explicit, timezone-qualified observation time; not an untrusted
    request timestamp. Production host must supply clock, identity and policy.
    """
    errors = set()
    def fail(code):
        errors.add(code)

    try:
        now = _instant(at)
    except (ValueError, TypeError, AttributeError):
        return {"status": "REJECTED", "errors": ["INVALID_HOST_TIME"],
                "external_verification_required": True, "authority_granted": False}
    structural = validate_bundle(bundle)
    if structural:
        return {"status": "REJECTED", "errors": ["BUNDLE_INVALID"] + structural,
                "external_verification_required": True, "authority_granted": False}

    reg, schemas = registry()
    groups = {
        "principals": ("principal", "principalId"),
        "mandates": ("mandate", "mandateId"),
        "delegations": ("delegation", "delegationId"),
        "authorizationRequests": ("authorization-request", "requestId"),
        "authorizationDecisions": ("authorization-decision", "decisionId"),
        "approvals": ("approval", "approvalId"),
    }
    for collection, (name, _) in groups.items():
        for i, value in enumerate(bundle.get(collection, [])):
            validator = Draft202012Validator(schemas[name], registry=reg,
                                               format_checker=FormatChecker())
            for error in validator.iter_errors(value):
                fail("SCHEMA:" + collection + ":" + str(i))
    if errors:
        return {"status": "REJECTED", "errors": sorted(errors),
                "external_verification_required": True, "authority_granted": False}

    idx = {}
    for group, (_, id_field) in groups.items():
        idx[group] = {}
        for row in bundle.get(group, []):
            if row[id_field] in idx[group]:
                fail("DUPLICATE_" + group.upper())
            idx[group][row[id_field]] = row

    def resolve(ref, group):
        row = idx[group].get(ref["id"])
        if row is None:
            fail("UNRESOLVED_" + group.upper())
            return None
        if ref["version"] != row["version"]:
            fail("VERSION_MISMATCH_" + group.upper())
        if ref["digest"] != digest(row):
            fail("DIGEST_MISMATCH_" + group.upper())
        return row

    def is_valid(start, end, moment):
        try:
            lo, hi = _instant(start), _instant(end)
            if lo >= hi:
                fail("INVALID_VALIDITY_WINDOW")
                return False
            return lo <= moment < hi
        except (ValueError, TypeError):
            fail("INVALID_VALIDITY_WINDOW")
            return False

    agent = bundle["agent"]
    principal = idx["principals"]
    requests = idx["authorizationRequests"]
    mandates = idx["mandates"]
    edges = idx["delegations"]
    decision_list = idx["authorizationDecisions"]
    approval_list = idx["approvals"]
    links = {k: [] for k in mandates}
    for edge in edges.values():
        parent = resolve(edge["parentMandateRef"], "mandates")
        child = resolve(edge["childMandateRef"], "mandates")
        issuer = resolve(edge["issuedByRef"], "principals")
        if parent is None or child is None or issuer is None:
            continue
        links[child["mandateId"]].append(parent["mandateId"])
        if parent["mandateId"] == child["mandateId"]:
            fail("DELEGATION_SELF_CYCLE")
        if child["issuerRef"] != edge["issuedByRef"] or parent["subjectRef"] != edge["issuedByRef"]:
            fail("DELEGATION_ISSUER_MISMATCH")
        if parent["agentRef"] != child["agentRef"]:
            fail("DELEGATION_AGENT_MISMATCH")
        if child["delegationDepth"] >= parent["delegationDepth"]:
            fail("DELEGATION_DEPTH_EXCEEDED")
        if not (_instant(parent["issuedAt"]) <= _instant(child["issuedAt"])
                and _instant(child["expiresAt"]) <= _instant(parent["expiresAt"])):
            fail("DELEGATION_TIME_AMPLIFICATION")
        if parent["status"] != "ISSUED":
            fail("PARENT_MANDATE_REVOKED")
        for child_grant in child["grants"]:
            if not any(_attenuated(child_grant, p) for p in parent["grants"]):
                fail("DELEGATION_PERMISSION_AMPLIFICATION")
        if issuer["principalKind"] not in ("WORKLOAD", "SERVICE"):
            fail("INVALID_DELEGATING_PRINCIPAL")

    for mandate in mandates.values():
        issuer = resolve(mandate["issuerRef"], "principals")
        subject = resolve(mandate["subjectRef"], "principals")
        if issuer is None or subject is None:
            continue
        if issuer["principalId"] == subject["principalId"]:
            fail("SELF_ISSUED_MANDATE")
        if issuer["tenantId"] != subject["tenantId"]:
            fail("CROSS_TENANT_MANDATE")
        if (mandate["agentRef"]["id"] != agent["agentId"]
                or mandate["agentRef"]["version"] != agent["agentVersion"]
                or mandate["agentRef"]["digest"] != digest(agent)):
            fail("MANDATE_AGENT_MISMATCH")
        if mandate["status"] != "ISSUED":
            fail("REVOKED_OR_EXPIRED_MANDATE")
        if not is_valid(mandate["issuedAt"], mandate["expiresAt"], now):
            fail("MANDATE_NOT_CURRENT")
        parents = links.get(mandate["mandateId"], [])
        if len(parents) > 1:
            fail("AMBIGUOUS_DELEGATION_CHAIN")
        if not parents and issuer["principalKind"] != "HUMAN":
            fail("ROOT_MANDATE_ISSUER_NOT_HUMAN")
        if parents and issuer["principalKind"] == "HUMAN":
            fail("DELEGATED_MANDATE_ISSUER_INVALID")

    # Parent graph must be acyclic; every non-root subject depends on the root.
    def ancestry(mid, visiting):
        if mid in visiting:
            fail("DELEGATION_CYCLE")
            return
        for parent_id in links.get(mid, []):
            ancestry(parent_id, visiting | {mid})
    for mid in mandates:
        ancestry(mid, set())

    effect_map = {e["effectId"]: e for e in bundle.get("effects", [])}
    used_effects = set()
    if effect_map and not requests:
        fail("MISSING_AUTHORIZATION_REQUEST")
    for req in requests.values():
        actor = resolve(req["actorRef"], "principals")
        workload = resolve(req["workloadRef"], "principals")
        mandate = resolve(req["mandateRef"], "mandates")
        cap = next((x for x in bundle["capabilities"]
                    if x["capabilityId"] == req["capabilityRef"]["id"]), None)
        if cap is None or (req["capabilityRef"]["version"] != cap["version"]
                           or req["capabilityRef"]["digest"] != digest(cap)):
            fail("UNRESOLVED_OR_STALE_CAPABILITY")
        if (req["agentRef"]["id"] != agent["agentId"]
                or req["agentRef"]["version"] != agent["agentVersion"]
                or req["agentRef"]["digest"] != digest(agent)):
            fail("REQUEST_AGENT_MISMATCH")
        if actor is None or workload is None or mandate is None:
            continue
        if workload["principalKind"] != "WORKLOAD":
            fail("REQUEST_WORKLOAD_IDENTITY_INVALID")
        if actor["tenantId"] != workload["tenantId"]:
            fail("CROSS_TENANT_REQUEST")
        if mandate["subjectRef"] != req["workloadRef"]:
            fail("REQUEST_MANDATE_SUBJECT_MISMATCH")
        if req["sourceTrust"] != "TRUSTED_BOUNDARY":
            fail("UNTRUSTED_CONTENT_CANNOT_AUTHORIZE")
        if RANK[req["effectClass"]] > RANK[agent["effectCeiling"]]:
            fail("REQUEST_EXCEEDS_AGENT_EFFECT")
        if req["actionKind"] != EFFECT_KIND[req["effectClass"]]:
            fail("REQUEST_ACTION_KIND_MISMATCH")
        if cap and (cap["effectClass"] != req["effectClass"] or not any(
                _within(req["resourceScope"], s) for s in cap["resourceScopes"])):
            fail("REQUEST_OUTSIDE_CAPABILITY")
        try:
            requested_at = _instant(req["requestedAt"])
        except (TypeError, ValueError):
            fail("INVALID_REQUEST_TIME")
            continue
        if requested_at > now:
            fail("REQUEST_FROM_FUTURE")
        if not is_valid(mandate["issuedAt"], mandate["expiresAt"], requested_at):
            fail("REQUEST_MANDATE_TIME_INVALID")
        risk = req["riskContext"]
        if risk["aggregateRead"] and req["actionKind"] != "OBSERVE":
            fail("INVALID_AGGREGATION_CONTEXT")
        if risk["aggregateRead"] and not any(
                g["allowAggregation"] for g in mandate["grants"]):
            fail("AGGREGATION_NOT_AUTHORIZED")
        if risk["financialAmountMinor"] > 0 and not risk.get("currency"):
            fail("FINANCIAL_CURRENCY_REQUIRED")
        if (req["dataClassification"] in ("CONFIDENTIAL", "RESTRICTED")
                or req["effectClass"] in ("E3_EXTERNAL_EFFECT", "E4_AUTHORITY_CHANGE")):
            if risk["impact"] == "UNKNOWN" or risk["reversibility"] == "UNKNOWN":
                fail("UNCLASSIFIED_CONSEQUENTIAL_RISK")
        risk_review = (risk["impact"] in ("HIGH", "CRITICAL")
                       or risk["externalExposure"] and req["dataClassification"] == "RESTRICTED"
                       or risk["financialAmountMinor"] > 0)
        matched = [g for g in mandate["grants"] if _match(g, req)]
        if not matched:
            fail("REQUEST_OUTSIDE_MANDATE")
        approvals = [a for a in approval_list.values() if a["requestRef"]["id"] == req["requestId"]]
        if risk_review or any(g["requiresHumanReview"] for g in matched) or req["effectClass"] in (
                "E3_EXTERNAL_EFFECT","E4_AUTHORITY_CHANGE"):
            if not approvals:
                fail("INDEPENDENT_APPROVAL_REQUIRED")
        if req.get("effectRef"):
            effect = effect_map.get(req["effectRef"]["id"])
            if effect is None:
                fail("MISSING_EFFECT_REFERENCE")
            else:
                used_effects.add(effect["effectId"])
                if (req["effectRef"]["version"] != effect["version"]
                        or req["effectRef"]["digest"] != digest(effect)):
                    fail("EFFECT_REFERENCE_MISMATCH")
                if (effect["runId"] != req["runId"] or
                        effect["capabilityRef"] != req["capabilityRef"] or
                        effect["effectClass"] != req["effectClass"] or
                        effect["actionKind"] != req["actionKind"] or
                        effect["resourceScope"] != req["resourceScope"]):
                    fail("REQUEST_EFFECT_MISMATCH")

    for e in effect_map.values():
        if e["effectId"] not in used_effects:
            fail("EFFECT_MISSING_AUTHORIZATION_CONTEXT")
    # A request without a declared decision is not a completed policy path.
    # Declarations remain untrusted until externally attested at the host.
    decision_counts = {}
    for decision in decision_list.values():
        rid = decision["requestRef"]["id"]
        decision_counts[rid] = decision_counts.get(rid, 0) + 1
    for rid in requests:
        if decision_counts.get(rid, 0) == 0:
            fail("MISSING_POLICY_DECISION")
        if decision_counts.get(rid, 0) > 1:
            fail("AMBIGUOUS_POLICY_DECISIONS")
    for decision in decision_list.values():
        req = resolve(decision["requestRef"], "authorizationRequests")
        issuer = resolve(decision["decisionIssuerRef"], "principals")
        if req is None or issuer is None:
            continue
        if issuer["principalKind"] != "SERVICE":
            fail("POLICY_DECIDER_NOT_SERVICE")
        if (issuer["principalId"] in
                (req["actorRef"]["id"], req["workloadRef"]["id"])):
            fail("SELF_POLICY_DECISION")
        if decision["policyRef"] != req["policyRef"]:
            fail("POLICY_PIN_MISMATCH")
        if not is_valid(decision["validFrom"], decision["validUntil"], now):
            fail("POLICY_DECISION_NOT_CURRENT")
        if decision["outcome"] == "PERMIT_WITH_OBLIGATIONS" and not decision["obligations"]:
            fail("MISSING_POLICY_OBLIGATIONS")
        if decision["outcome"] == "PERMIT" and decision["obligations"]:
            fail("UNRESOLVED_POLICY_OBLIGATIONS")
        if decision["outcome"] in ("DENY", "HOLD", "STOP", "REQUIRE_HUMAN"):
            fail("RESTRICTIVE_POLICY_OUTCOME")
    for approval in approval_list.values():
        req = resolve(approval["requestRef"], "authorizationRequests")
        approver = resolve(approval["approvedByRef"], "principals")
        if req is None or approver is None:
            continue
        if approver["principalKind"] != "HUMAN":
            fail("APPROVAL_NOT_INDEPENDENT_HUMAN")
        if approver["principalId"] in (req["actorRef"]["id"], req["workloadRef"]["id"]):
            fail("SELF_APPROVAL_PROHIBITED")
        if approval["outcome"] != "APPROVE":
            fail("APPROVAL_REJECTED")
        if not is_valid(approval["issuedAt"], approval["expiresAt"], now):
            fail("APPROVAL_NOT_CURRENT")

    return {"status": "REJECTED" if errors else "STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION",
            "errors": sorted(errors), "authority_granted": False,
            "external_verification_required": True,
            "unverified": ["IDENTITY_ATTESTATION", "MANDATE_SIGNATURE",
                           "DELEGATION_SIGNATURE", "POLICY_ISSUER_AND_REVOCATION",
                           "DECISION_EVIDENCE", "APPROVAL_AUTHENTICITY",
                           "READ_AND_EFFECT_ENFORCEMENT", "DENIAL_EVIDENCE_CUSTODY"]}
