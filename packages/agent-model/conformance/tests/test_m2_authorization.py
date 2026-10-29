"""M2 tests: identity, sensitive E0 reads, scoped delegation, approval, policy freshness.
Static review only; no test calls an actual policy service or executes effects.
"""
import copy
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ama_vnext import digest
from ama_authorization import validate_authorization_contract
from test_m1_contracts import fixture, task_fixture, pin

NOW = "2026-10-29T12:00:00+00:00"
START = "2026-10-01T00:00:00+00:00"
END = "2027-01-01T00:00:00+00:00"
V = "0.2.0"


def principal(pid, kind, tenant="TENANT.A"):
    return {"schema": "ama.principal/v0.2-candidate", "principalId": pid,
            "version": V, "principalKind": kind, "tenantId": tenant,
            "trustDomain": "synthetic", "identityIssuerRef": "synthetic-root",
            "identityEvidenceDigest": "sha256:" + "a" * 64}


def aref(agent):
    return {"id": agent["agentId"], "version": agent["agentVersion"],
            "digest": digest(agent)}


def grant(scope="synthetic", classification="CONFIDENTIAL", recipient="RECIPIENT.A",
          approval=False):
    return {"actionKind": "OBSERVE", "effectClass": "E0_OBSERVE",
            "resourceScope": scope, "maxDataClassification": classification,
            "allowedRecipients": [recipient], "purpose": "synthetic-analysis",
            "requiresHumanReview": approval, "allowAggregation": False}


def baseline(effect=False):
    b = task_fixture() if effect else fixture()
    issuer = principal("SYNTHETIC.ISSUER", "HUMAN")
    actor = principal("SYNTHETIC.ACTOR", "HUMAN")
    workload = principal("SYNTHETIC.WORKLOAD", "WORKLOAD")
    decider = principal("SYNTHETIC.POLICY", "SERVICE")
    b["principals"] = [issuer, actor, workload, decider]
    m = {"schema": "ama.mandate/v0.2-candidate",
         "mandateId": "SYNTHETIC.MANDATE", "version": V,
         "issuerRef": pin(issuer, "principalId"),
         "subjectRef": pin(workload, "principalId"),
         "agentRef": aref(b["agent"]),
         "issuedAt": START, "expiresAt": END, "status": "ISSUED",
         "delegationDepth": 2, "grants": [grant()],
         "revocationRef": "REVOCATION.SOURCE",
         "issuanceEvidenceDigest": "sha256:" + "b" * 64}
    b["mandates"] = [m]
    b["delegations"] = []
    request = {"schema": "ama.authorization-request/v0.2-candidate",
               "requestId": "SYNTHETIC.REQUEST", "version": V,
               "runId": "SYNTHETIC.RUN",
               "agentRef": aref(b["agent"]),
               "actorRef": pin(actor, "principalId"),
               "workloadRef": pin(workload, "principalId"),
               "mandateRef": pin(m, "mandateId"),
               "capabilityRef": pin(b["capabilities"][0], "capabilityId"),
               "policyRef": {"id": "SYNTHETIC.POLICY.BUNDLE", "version": V,
                             "digest": "sha256:" + "c" * 64},
               "actionKind": "OBSERVE", "effectClass": "E0_OBSERVE",
               "resourceScope": "synthetic/item", "dataClassification": "INTERNAL",
               "recipientId": "RECIPIENT.A", "purpose": "synthetic-analysis",
               "requestedAt": "2026-10-29T11:00:00+00:00",
               "sourceTrust": "TRUSTED_BOUNDARY",
               "riskContext": {"reversibility": "REVERSIBLE", "impact": "LOW",
                               "externalExposure": False, "aggregateRead": False,
                               "financialAmountMinor": 0}}
    if effect:
        request["effectRef"] = pin(b["effects"][0], "effectId")
    b["authorizationRequests"] = [request]
    b["authorizationDecisions"] = [{
        "schema": "ama.authorization-decision/v0.2-candidate",
        "decisionId": "SYNTHETIC.DECISION", "version": V,
        "requestRef": pin(request, "requestId"),
        "policyRef": request["policyRef"],
        "decisionIssuerRef": pin(decider, "principalId"),
        "outcome": "PERMIT", "obligations": [],
        "validFrom": "2026-10-29T10:00:00+00:00",
        "validUntil": "2026-10-30T00:00:00+00:00",
        "revocationEpoch": 3,
        "decisionEvidenceDigest": "sha256:" + "d" * 64
    }]
    b["approvals"] = []
    return b


def repin(b):
    principals = {p["principalId"]: p for p in b["principals"]}
    mandates = {m["mandateId"]: m for m in b["mandates"]}
    for m in mandates.values():
        for key in ("issuerRef","subjectRef"):
            pid=m[key]["id"]
            if pid in principals:
                m[key]=pin(principals[pid], "principalId")
        m["agentRef"]=aref(b["agent"])
    for e in b["delegations"]:
        for key in ("parentMandateRef","childMandateRef"):
            mid=e[key]["id"]
            if mid in mandates:
                e[key]=pin(mandates[mid], "mandateId")
        pid=e["issuedByRef"]["id"]
        if pid in principals:
            e["issuedByRef"]=pin(principals[pid], "principalId")
    requests={r["requestId"]:r for r in b["authorizationRequests"]}
    for r in requests.values():
        r["agentRef"]=aref(b["agent"])
        for key in ("actorRef","workloadRef"):
            pid=r[key]["id"]
            if pid in principals:r[key]=pin(principals[pid],"principalId")
        mid=r["mandateRef"]["id"]
        if mid in mandates:r["mandateRef"]=pin(mandates[mid],"mandateId")
        r["capabilityRef"]=pin(b["capabilities"][0], "capabilityId")
    for d in b["authorizationDecisions"]:
        rid=d["requestRef"]["id"]
        if rid in requests:
            d["requestRef"]=pin(requests[rid],"requestId")
        did=d["decisionIssuerRef"]["id"]
        if did in principals:
            d["decisionIssuerRef"]=pin(principals[did],"principalId")
    for a in b["approvals"]:
        rid=a["requestRef"]["id"]
        if rid in requests:
            a["requestRef"]=pin(requests[rid],"requestId")
        pid=a["approvedByRef"]["id"]
        if pid in principals:
            a["approvedByRef"]=pin(principals[pid],"principalId")
    return b


def approval(b, reviewer="SYNTHETIC.ISSUER"):
    obj={"schema":"ama.approval/v0.2-candidate","approvalId":"SYNTHETIC.APPROVAL",
         "version":V,"requestRef":pin(b["authorizationRequests"][0],"requestId"),
         "approvedByRef":pin(next(p for p in b["principals"] if p["principalId"]==reviewer),"principalId"),
         "outcome":"APPROVE","issuedAt":"2026-10-29T11:15:00+00:00",
         "expiresAt":"2026-10-29T18:00:00+00:00",
         "approvalEvidenceDigest":"sha256:"+"e"*64}
    b["approvals"]=[obj]
    return b


class AuthorizationContracts(unittest.TestCase):
    def check(self,b):
        return validate_authorization_contract(b,at=NOW)

    def assert_bad(self,b,code):
        report=self.check(b)
        self.assertEqual(report["status"],"REJECTED",report)
        self.assertIn(code,report["errors"],report)
        self.assertFalse(report["authority_granted"])

    def test_valid_e0_is_only_precheck_not_permission(self):
        r=self.check(baseline())
        self.assertEqual("STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION",r["status"],r)
        self.assertFalse(r["authority_granted"])
        self.assertTrue(r["external_verification_required"])
        self.assertIn("POLICY_ISSUER_AND_REVOCATION",r["unverified"])

    def test_effect_included_requires_bounded_request(self):
        self.assertEqual("STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION",
                         self.check(baseline(effect=True))["status"])

    def test_effect_without_authorization_context_denied(self):
        b=baseline(effect=True);b["authorizationRequests"]=[];b["authorizationDecisions"]=[]
        self.assert_bad(b,"MISSING_AUTHORIZATION_REQUEST")

    def test_sensitive_e0_not_safe_by_effect_class(self):
        b=baseline();b["authorizationRequests"][0]["dataClassification"]="RESTRICTED"
        self.assert_bad(b,"REQUEST_OUTSIDE_MANDATE")

    def test_unauthorized_observation_recipient(self):
        b=baseline();b["authorizationRequests"][0]["recipientId"]="RECIPIENT.EXTERNAL"
        self.assert_bad(b,"REQUEST_OUTSIDE_MANDATE")

    def test_resource_crosses_segment_boundary(self):
        b=baseline();b["authorizationRequests"][0]["resourceScope"]="synthetic-other"
        self.assert_bad(b,"REQUEST_OUTSIDE_MANDATE")

    def test_untrusted_content_cannot_claim_authority(self):
        b=baseline();b["authorizationRequests"][0]["sourceTrust"]="UNTRUSTED_CONTENT"
        self.assert_bad(b,"UNTRUSTED_CONTENT_CANNOT_AUTHORIZE")

    def test_mandate_grant_cannot_exceed_agent_scope(self):
        b=baseline();b["mandates"][0]["grants"][0]["resourceScope"]="other"
        self.assert_bad(repin(b),"MANDATE_GRANT_OUTSIDE_AGENT_SCOPE")

    def test_mandate_grant_cannot_exceed_agent_effect(self):
        b=baseline();g=b["mandates"][0]["grants"][0]
        g["effectClass"]="E3_EXTERNAL_EFFECT"
        g["actionKind"]="EXTERNAL_ACTION"
        self.assert_bad(repin(b),"MANDATE_GRANT_EXCEEDS_AGENT_EFFECT")

    def test_mandate_grant_wrong_action_kind(self):
        b=baseline();b["mandates"][0]["grants"][0]["actionKind"]="AUTHORITY_CHANGE"
        self.assert_bad(repin(b),"MANDATE_GRANT_ACTION_MISMATCH")

    def test_mandate_revoked(self):
        b=baseline();b["mandates"][0]["status"]="REVOKED"
        self.assert_bad(repin(b),"REVOKED_OR_EXPIRED_MANDATE")

    def test_mandate_expired(self):
        b=baseline();b["mandates"][0]["expiresAt"]="2026-10-28T00:00:00+00:00"
        self.assert_bad(repin(b),"MANDATE_NOT_CURRENT")

    def test_policy_decision_expired(self):
        b=baseline();b["authorizationDecisions"][0]["validUntil"]="2026-10-29T11:30:00+00:00"
        self.assert_bad(b,"POLICY_DECISION_NOT_CURRENT")

    def test_policy_pin_mismatch(self):
        b=baseline();b["authorizationDecisions"][0]["policyRef"]=copy.deepcopy(b["authorizationDecisions"][0]["policyRef"])
        b["authorizationDecisions"][0]["policyRef"]["digest"]="sha256:"+"0"*64
        self.assert_bad(b,"POLICY_PIN_MISMATCH")

    def test_no_unknown_principal(self):
        b=baseline();b["authorizationRequests"][0]["actorRef"]["id"]="SYNTHETIC.UNKNOWN"
        self.assert_bad(b,"UNRESOLVED_PRINCIPALS")

    def test_workload_cannot_self_issue_mandate(self):
        b=baseline();b["mandates"][0]["issuerRef"]=b["mandates"][0]["subjectRef"]
        self.assert_bad(repin(b),"SELF_ISSUED_MANDATE")

    def test_principal_tenant_confusion(self):
        b=baseline();b["principals"][2]["tenantId"]="TENANT.B"
        self.assert_bad(repin(b),"CROSS_TENANT_MANDATE")

    def test_e0_human_review_obligation(self):
        b=baseline();b["mandates"][0]["grants"][0]["requiresHumanReview"]=True
        self.assert_bad(repin(b),"INDEPENDENT_APPROVAL_REQUIRED")

    def test_separate_human_approval_is_only_claim(self):
        b=baseline();b["mandates"][0]["grants"][0]["requiresHumanReview"]=True
        repin(b);approval(b)
        r=self.check(b);self.assertEqual("STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION",r["status"],r)
        self.assertFalse(r["authority_granted"])

    def test_self_approval_denied(self):
        b=baseline();b["mandates"][0]["grants"][0]["requiresHumanReview"]=True
        repin(b);approval(b,reviewer="SYNTHETIC.ACTOR")
        self.assert_bad(b,"SELF_APPROVAL_PROHIBITED")

    def test_model_forged_policy_decider(self):
        b=baseline();b["authorizationDecisions"][0]["decisionIssuerRef"]=pin(b["principals"][2],"principalId")
        self.assert_bad(b,"POLICY_DECIDER_NOT_SERVICE")

    def test_conditional_permit_needs_obligations(self):
        b=baseline();b["authorizationDecisions"][0]["outcome"]="PERMIT_WITH_OBLIGATIONS"
        self.assert_bad(b,"MISSING_POLICY_OBLIGATIONS")

    def test_policy_deny_never_survives_precheck(self):
        b=baseline();b["authorizationDecisions"][0]["outcome"]="DENY"
        self.assert_bad(b,"RESTRICTIVE_POLICY_OUTCOME")

    def test_policy_stop_never_survives_precheck(self):
        b=baseline();b["authorizationDecisions"][0]["outcome"]="STOP"
        self.assert_bad(b,"RESTRICTIVE_POLICY_OUTCOME")

    def test_human_review_policy_requires_independent_review(self):
        b=baseline();b["authorizationDecisions"][0]["outcome"]="REQUIRE_HUMAN"
        self.assert_bad(b,"RESTRICTIVE_POLICY_OUTCOME")

    def test_missing_policy_decision_is_fail_closed(self):
        b=baseline();b["authorizationDecisions"]=[]
        self.assert_bad(b,"MISSING_POLICY_DECISION")

    def test_ambiguous_policy_decisions_are_fail_closed(self):
        b=baseline();second=copy.deepcopy(b["authorizationDecisions"][0])
        second["decisionId"]="SYNTHETIC.OTHER.DECISION"
        b["authorizationDecisions"].append(second)
        self.assert_bad(b,"AMBIGUOUS_POLICY_DECISIONS")

    def test_aggregated_read_denied_unless_granted(self):
        b=baseline();b["authorizationRequests"][0]["riskContext"]["aggregateRead"]=True
        self.assert_bad(b,"AGGREGATION_NOT_AUTHORIZED")

    def test_aggregate_read_granted_still_not_runtime_permit(self):
        b=baseline();b["mandates"][0]["grants"][0]["allowAggregation"]=True
        b["authorizationRequests"][0]["riskContext"]["aggregateRead"]=True
        self.assertEqual("STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION",
                         self.check(repin(b))["status"])

    def test_high_impact_read_needs_human_review(self):
        b=baseline();b["authorizationRequests"][0]["riskContext"]["impact"]="CRITICAL"
        self.assert_bad(repin(b),"INDEPENDENT_APPROVAL_REQUIRED")

    def test_fiscal_exposure_needs_currency_and_review(self):
        b=baseline();b["authorizationRequests"][0]["riskContext"]["financialAmountMinor"]=2000
        self.assert_bad(repin(b),"FINANCIAL_CURRENCY_REQUIRED")

    def test_restricted_data_undetermined_risk_denied(self):
        b=baseline();b["mandates"][0]["grants"][0]["maxDataClassification"]="RESTRICTED"
        req=b["authorizationRequests"][0]
        req["dataClassification"]="RESTRICTED"
        req["riskContext"]["reversibility"]="UNKNOWN"
        self.assert_bad(repin(b),"UNCLASSIFIED_CONSEQUENTIAL_RISK")

    def test_future_request_denied(self):
        b=baseline();b["authorizationRequests"][0]["requestedAt"]="2026-10-30T11:00:00+00:00"
        self.assert_bad(repin(b),"REQUEST_FROM_FUTURE")

    def test_delegation_grants_cannot_amplify(self):
        b=baseline()
        second=principal("SYNTHETIC.CHILD","WORKLOAD")
        b["principals"].append(second)
        parent=b["mandates"][0]
        child=copy.deepcopy(parent)
        child.update(mandateId="SYNTHETIC.CHILD.MANDATE",issuerRef=pin(b["principals"][2],"principalId"),
                     subjectRef=pin(second,"principalId"),delegationDepth=1,
                     grants=[grant(classification="RESTRICTED")])
        b["mandates"].append(child)
        edge={"schema":"ama.delegation/v0.2-candidate","delegationId":"SYNTHETIC.DELEGATION","version":V,
              "parentMandateRef":pin(parent,"mandateId"),"childMandateRef":pin(child,"mandateId"),
              "issuedByRef":pin(b["principals"][2],"principalId"),
              "evidenceDigest":"sha256:"+"f"*64}
        b["delegations"]=[edge]
        self.assert_bad(repin(b),"DELEGATION_PERMISSION_AMPLIFICATION")

    def test_invalid_host_time_cannot_authorize(self):
        r=validate_authorization_contract(baseline(),at="not-a-date")
        self.assertEqual("REJECTED",r["status"])
        self.assertFalse(r["authority_granted"])

if __name__=="__main__":
    unittest.main()
