"""AMA M5 universal evaluation and assurance candidate.

Reports compare declared and observed outcomes, but NEVER certify source authenticity,
real-world correctness, governance acceptance, or runtime permission. External evidence
verification is injected; no verifier = NO independently verified observations.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from datetime import datetime, timezone
from math import ceil
from jsonschema import Draft202012Validator, FormatChecker
from ama_vnext import validate_bundle, registry, digest

COLLECTIONS = {
    "evaluationProfiles": ("evaluation-profile", "profileId"),
    "evaluationCases": ("evaluation-case", "caseId"),
    "evaluationObservations": ("evaluation-observation", "observationId"),
    "evaluationProvenance": ("evaluation-provenance", "provenanceId"),
    "evaluationReports": ("evaluation-report", "reportId"),
    "acceptanceAssessments": ("acceptance-assessment", "assessmentId"),
}
POLICY_DENIAL = {"DENY", "HOLD", "STOP"}
def _time(x):
    dt = datetime.fromisoformat(x.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        raise ValueError("TIMEZONE_REQUIRED")
    return dt.astimezone(timezone.utc)

def _ref(ref, row, key="version"):
    return (row is not None and ref["id"] in
            (row.get("profileId"), row.get("caseId"), row.get("observationId"),
             row.get("reportId"), row.get("agentId"))
            and ref["version"] == row[key] and ref["digest"] == digest(row))

def _result(status, findings, metrics=None, axes=None):
    return {"status": status, "findings": sorted(set(findings)),
            "metrics": metrics or {}, "axes": sorted(axes or []),
            "independent_accepted": False, "runtime_authorized": False,
            "live_c4_c5_verified": False}

def evaluate(bundle, *, profile_id, at, attestor=None):
    """Return deterministic metrics and conservative candidate outcome.

    attestor must be a trusted *external* callable injected by the host:
    attestor(provenance, observation) -> bool. Self-reported trust labels are
    insufficient. Injected CI test doubles prove harness behavior, not live trust.
    """
    findings = set()
    try:
        now = _time(at)
    except (ValueError, AttributeError, TypeError):
        return _result("FAIL", ["INVALID_HOST_TIME"])
    base = validate_bundle(bundle)
    if base:
        return _result("FAIL", ["INVALID_BUNDLE", *base])
    reg, schemas = registry()
    indexed = {}
    for group, (name, key) in COLLECTIONS.items():
        values = bundle.get(group, [])
        idx = {}
        for item in values:
            try:
                errors = list(Draft202012Validator(
                    schemas[name], registry=reg,
                    format_checker=FormatChecker()).iter_errors(item))
            except Exception:
                errors = [object()]
            if errors:
                findings.add("INVALID_SCHEMA:" + name)
                continue
            if item[key] in idx:
                findings.add("DUPLICATE:" + name)
            idx[item[key]] = item
        indexed[group] = idx
    if findings:
        return _result("FAIL", findings)
    profiles = indexed["evaluationProfiles"]
    profile = profiles.get(profile_id)
    if not profile:
        return _result("FAIL", ["MISSING_EVALUATION_PROFILE"])
    agent = bundle["agent"]
    if not _ref(profile["agentRef"], agent, key="agentVersion"):
        findings.add("EVALUATION_AGENT_PIN_MISMATCH")
    cases = indexed["evaluationCases"]
    obs = indexed["evaluationObservations"]
    provenance = indexed["evaluationProvenance"]
    selected = []
    for case in cases.values():
        if _ref(case["profileRef"], profile):
            selected.append(case)
        else:
            findings.add("CASE_PROFILE_MISMATCH")
    if len(selected) < profile["minCases"]:
        findings.add("MIN_CASES_NOT_MET")
    axes = {c["axis"] for c in selected}
    if not set(profile["requiredAxes"]).issubset(axes):
        findings.add("AXIS_COVERAGE_GAP")
    if profile["holdoutRequired"] and not any(c["holdout"] for c in selected):
        findings.add("NO_HOLDOUT_CASES")
    if profile["holdoutRequired"] and not any(not c["holdout"] for c in selected):
        findings.add("NO_DEVELOPMENT_CASES")
    seen_case = {c["caseId"]: c for c in selected}
    observations_by_case = defaultdict(list)
    seen_obs_keys = set()
    for o in obs.values():
        case = cases.get(o["caseRef"]["id"])
        if not _ref(o["caseRef"], case):
            findings.add("UNPINNED_OBSERVATION_CASE")
            continue
        k = (case["caseId"], o["repeatIndex"])
        if k in seen_obs_keys:
            findings.add("DUPLICATE_REPETITION")
        seen_obs_keys.add(k)
        if o["caseRef"]["id"] not in seen_case:
            findings.add("ORPHAN_OBSERVATION")
            continue
        try:
            if _time(o["observedAt"]) > now:
                findings.add("OBSERVATION_FROM_FUTURE")
        except (ValueError, TypeError):
            findings.add("INVALID_OBSERVATION_TIME")
        observations_by_case[case["caseId"]].append(o)
    for c in selected:
        observed = observations_by_case[c["caseId"]]
        indices = {o["repeatIndex"] for o in observed}
        if len(observed) < profile["minRepetitions"] or indices != set(range(len(observed))):
            findings.add("REPETITION_COVERAGE_GAP")
    obs_proof = defaultdict(list)
    for p in provenance.values():
        o = obs.get(p["observationRef"]["id"])
        if not _ref(p["observationRef"], o):
            findings.add("INVALID_PROVENANCE_BINDING")
            continue
        obs_proof[o["observationId"]].append(p)
        try:
            if _time(p["recordedAt"]) > now:
                findings.add("FUTURE_PROVENANCE")
        except (ValueError, TypeError):
            findings.add("INVALID_PROVENANCE_TIME")
    for r in indexed["evaluationReports"].values():
        if r["profileRef"]["id"] not in profiles or not _ref(
                r["profileRef"], profiles.get(r["profileRef"]["id"])):
            findings.add("REPORT_PROFILE_PIN_MISMATCH")
        if r["independentAccepted"] is not False:
            findings.add("SELF_ACCEPTED_REPORT")
    for a in indexed["acceptanceAssessments"].values():
        if not _ref(a["reportRef"], indexed["evaluationReports"].get(a["reportRef"]["id"])):
            findings.add("ASSESSMENT_REPORT_PIN_MISMATCH")
        if a["activationAuthorized"] is not False:
            findings.add("SELF_AUTHORIZED_ACTIVATION")
        if a["decision"] == "REFER_TO_AUTHORIZED_AUTHORITY" and not a.get("attestationRef"):
            findings.add("ASSESSMENT_MISSING_EXTERNAL_ATTESTATION_REF")
    if findings:
        return _result("FAIL", findings, axes=axes)
    false_allows = false_denies = policy_deny = policy_allow = 0
    final_ok = final_count = covered = 0
    latencies = []
    total_cost = 0
    mismatches = 0
    verified_observations = 0
    inconsistent = 0
    for case in selected:
        performances = set()
        for o in observations_by_case[case["caseId"]]:
            expected = case["expectedDecision"]
            actual = o["actualDecision"]
            if expected in POLICY_DENIAL:
                policy_deny += 1
                if actual == "ALLOW":
                    false_allows += 1
            if expected == "ALLOW":
                policy_allow += 1
                if actual in POLICY_DENIAL:
                    false_denies += 1
            decision_correct = expected == actual
            target_correct = (o["targetRef"] == case["expectedTargetRef"])
            final_correct = (case["expectedFinalState"] ==
                             o["actualFinalState"])
            performances.add((actual, o["actualFinalState"], o["targetRef"]))
            if not decision_correct or not target_correct or not final_correct:
                mismatches += 1
            if case["expectedDecision"] == "NOT_APPLICABLE" and actual != "NOT_APPLICABLE":
                findings.add("UNEXPECTED_POLICY_DECISION")
            if o["sourceKind"] == "MOCK" and profile["scope"] != "STATIC_CANDIDATE":
                findings.add("MOCK_DATA_IN_NONSTATIC_ASSURANCE")
            if o["sourceKind"] == "DISPOSABLE_INTEGRATION" and profile["scope"] == "LIVE_INDEPENDENT":
                findings.add("INTEGRATION_DATA_CANNOT_PROVE_LIVE")
            if o["sourceKind"] == "LIVE_HOST" and profile["scope"] != "LIVE_INDEPENDENT":
                findings.add("LIVE_OBSERVATION_SCOPE_MISMATCH")
            if o["redacted"] is False and case["dataClassification"] in (
                    "CONFIDENTIAL", "RESTRICTED"):
                findings.add("SENSITIVE_EVIDENCE_NOT_REDACTED")
            verified = False
            for p in obs_proof.get(o["observationId"], []):
                if (p["trustStatus"] == "ATTESTED_BY_EXTERNAL_VERIFIER"
                    and p["collectorKind"] in ("INDEPENDENT_SERVICE","HUMAN_REVIEWER")
                    and p.get("attestationRef") and attestor is not None):
                    try:
                        verified = bool(attestor(p, o)) or verified
                    except Exception:
                        findings.add("ATTESTATION_SERVICE_FAILED")
            if verified:
                verified_observations += 1
                if o["evidenceRefs"] and o.get("policyEvidenceRef") and (
                    case["expectedFinalState"] == "NOT_APPLICABLE" or
                    o.get("finalStateEvidenceRef")):
                    covered += 1
                if case["expectedFinalState"] != "NOT_APPLICABLE" and final_correct and (
                    o.get("finalStateEvidenceRef")):
                    final_ok += 1
            if case["expectedFinalState"] != "NOT_APPLICABLE":
                final_count += 1
            latencies.append(o["latencyMs"])
            total_cost += o["costMinor"]
        if len(performances) != 1:
            inconsistent += 1
    observation_count = len(obs)
    latencies.sort()
    latency95 = latencies[max(0, ceil(len(latencies) * .95) - 1)] if latencies else 0
    metrics = {
        "cases": len(selected), "repetitions": observation_count,
        "falseAllows": false_allows, "falseDenies": false_denies,
        "policyDenyCases": policy_deny, "policyAllowCases": policy_allow,
        "verifiedFinalStates": final_ok, "finalStateCases": final_count,
        "evidenceCovered": covered, "totalObservations": observation_count,
        "latencyP95Ms": latency95, "totalCostMinor": total_cost,
        "mismatches": mismatches, "inconsistentCases": inconsistent,
        "attestedObservations": verified_observations
    }
    t = profile["thresholds"]
    if policy_deny == 0 or policy_allow == 0:
        findings.add("INSUFFICIENT_ALLOW_DENY_DENOMINATOR")
    if policy_deny and false_allows / policy_deny > t["maxFalseAllowRate"]:
        findings.add("FALSE_ALLOW_RATE_EXCEEDED")
    if policy_allow and false_denies / policy_allow > t["maxFalseDenyRate"]:
        findings.add("FALSE_DENY_RATE_EXCEEDED")
    if mismatches:
        findings.add("ORACLE_OUTCOME_MISMATCH")
    if inconsistent:
        findings.add("REPEATED_RUN_VARIANCE")
    if latency95 > t["maxLatencyP95Ms"]:
        findings.add("LATENCY_P95_EXCEEDED")
    if total_cost > t["maxCostMinor"]:
        findings.add("COST_BUDGET_EXCEEDED")
    if final_count and final_ok/final_count < t["minVerifiedFinalStateRate"]:
        findings.add("FINAL_STATE_VERIFICATION_BELOW_THRESHOLD")
    if observation_count and covered/observation_count < t["minEvidenceCoverage"]:
        findings.add("EVIDENCE_COVERAGE_BELOW_THRESHOLD")
    if not attestor:
        findings.add("INDEPENDENT_ATTESTATION_NOT_BOUND")
    if profile["scope"] == "LIVE_INDEPENDENT":
        findings.add("LIVE_INDEPENDENT_ACCEPTANCE_NOT_PERFORMED")
    return _result("FAIL" if findings else "CANDIDATE_METRICS_PASS",
                   findings, metrics, axes)


def compare_baseline(candidate, baseline, *, baseline_verified=False):
    """No 'no regression' result without independently verified baseline."""
    if not baseline_verified or not baseline:
        return {"status":"NOT_VERIFIED","release_authorized":False}
    keys = ("falseAllows","falseDenies","mismatches","inconsistentCases")
    if any(candidate.get(k, 0) > baseline.get(k, 0) for k in keys):
        return {"status":"REGRESSION","release_authorized":False}
    return {"status":"NO_DETECTED_REGRESSION","release_authorized":False}
