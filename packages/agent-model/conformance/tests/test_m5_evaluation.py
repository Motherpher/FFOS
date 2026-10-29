"""M5 synthetic independent-assurance harness tests, no live agent or external effects."""
import copy, sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_vnext import digest
from ama_evaluation import evaluate, compare_baseline
from test_m1_contracts import fixture, pin
V="0.2.0"
AT="2026-10-29T11:00:00+00:00"
AXES=["STRUCTURAL","AUTHORITY","TOOL_TARGET","FINAL_STATE","RELIABILITY",
      "ADVERSARIAL","PRIVACY","DURABILITY","COST","EVIDENCE"]

def sample():
    b=fixture();a=b["agent"]
    profile={"schema":"ama.evaluation-profile/v0.2-candidate",
             "profileId":"SYNTHETIC.EVALUATION","version":V,
             "agentRef":{"id":a["agentId"],"version":a["agentVersion"],
                         "digest":digest(a)},
             "suiteVersion":"synthetic/1.0.0","scope":"STATIC_CANDIDATE",
             "requiredAxes":list(AXES),"minCases":10,"minRepetitions":2,
             "thresholds":{"maxFalseAllowRate":0,"maxFalseDenyRate":0,
                           "minVerifiedFinalStateRate":1,
                           "minEvidenceCoverage":1,"maxLatencyP95Ms":2000,
                           "maxCostMinor":10000,"currency":"USD"},
             "holdoutRequired":True,"independentApprovalRequired":True}
    b["evaluationProfiles"]=[profile]
    b["evaluationCases"]=[];b["evaluationObservations"]=[]
    b["evaluationProvenance"]=[]
    b["evaluationReports"]=[];b["acceptanceAssessments"]=[]
    for i,axis in enumerate(AXES):
        allowed=i%2==0
        decision="ALLOW" if allowed else "DENY"
        final="SUCCESS" if allowed else "HOLD"
        case={"schema":"ama.evaluation-case/v0.2-candidate",
              "caseId":"SYNTHETIC.CASE."+str(i),"version":V,
              "profileRef":pin(profile,"profileId"),
              "axis":axis,"scenarioClass":({"ADVERSARIAL":"INJECTION",
                "RELIABILITY":"OUTAGE","DURABILITY":"RECOVERY"}.get(axis,
                 "HAPPY_PATH" if allowed else "DENIAL")),
              "repeatGroup":"RG."+str(i),"perturbationId":"PERT."+str(i),
              "holdout":bool(i%3==0),"expectedDecision":decision,
              "expectedFinalState":final,"expectedTargetRef":"synthetic/item",
              "dataClassification":"CONFIDENTIAL" if axis=="PRIVACY" else "INTERNAL",
              "inputDigest":"sha256:"+"a"*64,"oracleRef":"synthetic-oracle:"+str(i)}
        b["evaluationCases"].append(case)
        for rep in range(2):
            observation={"schema":"ama.evaluation-observation/v0.2-candidate",
                         "observationId":"SYNTHETIC.OBS."+str(i)+"."+str(rep),
                         "version":V,"caseRef":pin(case,"caseId"),
                         "repeatIndex":rep,"actualDecision":decision,
                         "actualFinalState":final,"targetRef":"synthetic/item",
                         "finalStateEvidenceRef":"synthetic-final-evidence",
                         "policyEvidenceRef":"synthetic-policy-evidence",
                         "runCorrelationId":"synthetic-run-"+str(i)+"-"+str(rep),
                         "latencyMs":100,"costMinor":5,"redacted":True,
                         "evidenceRefs":["synthetic-audit-"+str(rep)],
                         "observedAt":"2026-10-29T10:00:00+00:00",
                         "sourceKind":"MOCK"}
            b["evaluationObservations"].append(observation)
            b["evaluationProvenance"].append({
                "schema":"ama.evaluation-provenance/v0.2-candidate",
                "provenanceId":"SYNTHETIC.PROV."+str(i)+"."+str(rep),
                "version":V,"observationRef":pin(observation,"observationId"),
                "sourceRef":"synthetic-test-run", "contentDigest":"sha256:"+"f"*64,
                "collectorRef":"synthetic-test-verifier",
                "collectorKind":"INDEPENDENT_SERVICE",
                "trustStatus":"ATTESTED_BY_EXTERNAL_VERIFIER",
                "attestationRef":"synthetic-attestation-only",
                "recordedAt":"2026-10-29T10:05:00+00:00",
                "redacted":True})
    return b

def repin_provenance(b):
    """Update synthetic fixture's observer provenance after legitimate test edit."""
    obs={o["observationId"]:o for o in b["evaluationObservations"]}
    for p in b["evaluationProvenance"]:
        p["observationRef"]=pin(obs[p["observationRef"]["id"]],"observationId")
    return b

def test_only_attestor(provenance, observation, case):
    """Explicit test double; cannot certify real independent evidence."""
    return provenance["collectorRef"]=="synthetic-test-verifier"

class M5Evaluation(unittest.TestCase):
    def check(self,b,attestor=test_only_attestor):
        return evaluate(b,profile_id="SYNTHETIC.EVALUATION",at=AT,attestor=attestor)
    def reject(self,b,code,attestor=test_only_attestor):
        r=self.check(b,attestor)
        self.assertEqual("FAIL",r["status"],r)
        self.assertIn(code,r["findings"],r)
        self.assertFalse(r["independent_accepted"])
        self.assertFalse(r["runtime_authorized"])
        self.assertFalse(r["live_c4_c5_verified"])

    def test_clean_synthetic_suite_reports_candidate_only(self):
        r=self.check(sample())
        self.assertEqual("CANDIDATE_METRICS_PASS",r["status"],r)
        self.assertEqual(20,r["metrics"]["totalObservations"])
        self.assertEqual(10,r["metrics"]["cases"])
        self.assertEqual(0,r["metrics"]["mismatches"])
        self.assertFalse(r["independent_accepted"])
        self.assertFalse(r["live_c4_c5_verified"])

    def test_without_independent_attestation_fail_closed(self):
        self.reject(sample(),"INDEPENDENT_ATTESTATION_NOT_BOUND",attestor=None)
    def test_provenance_claim_alone_cannot_attest(self):
        b=sample()
        for p in b["evaluationProvenance"]:
            p["trustStatus"]="DECLARED"
            p.pop("attestationRef")
        self.reject(b,"EVIDENCE_COVERAGE_BELOW_THRESHOLD")
    def test_false_allow_is_blocker(self):
        b=sample();b["evaluationObservations"][2]["actualDecision"]="ALLOW"
        self.reject(repin_provenance(b),"FALSE_ALLOW_RATE_EXCEEDED")
    def test_false_deny_is_blocker(self):
        b=sample();b["evaluationObservations"][0]["actualDecision"]="DENY"
        self.reject(repin_provenance(b),"FALSE_DENY_RATE_EXCEEDED")
    def test_inconsistent_repetition_is_blocker(self):
        b=sample();b["evaluationObservations"][1]["actualFinalState"]="HOLD"
        self.reject(repin_provenance(b),"REPEATED_RUN_VARIANCE")
    def test_wrong_tool_target_fails(self):
        b=sample();b["evaluationObservations"][0]["targetRef"]="synthetic/other"
        self.reject(repin_provenance(b),"ORACLE_OUTCOME_MISMATCH")
    def test_wrong_final_state_fails(self):
        b=sample();b["evaluationObservations"][0]["actualFinalState"]="UNKNOWN"
        self.reject(repin_provenance(b),"FINAL_STATE_VERIFICATION_BELOW_THRESHOLD")
    def test_missing_axis_denies_even_with_good_other_results(self):
        b=sample();b["evaluationCases"][0]["axis"]="EVIDENCE"
        self.reject(b,"AXIS_COVERAGE_GAP")
    def test_adversarial_outage_recovery_required(self):
        b=sample()
        for case in b["evaluationCases"]:
            case["scenarioClass"]="HAPPY_PATH" if case["expectedDecision"]=="ALLOW" else "DENIAL"
        self.reject(b,"ADVERSARIAL_OUTAGE_RECOVERY_COVERAGE_GAP")

    def test_injection_mislabel_denied(self):
        b=sample()
        next(c for c in b["evaluationCases"] if c["axis"]=="ADVERSARIAL")["scenarioClass"]="BOUNDARY"
        self.reject(b,"ADVERSARIAL_SCENARIO_MISCLASSIFIED")

    def test_missing_holdout_denies(self):
        b=sample()
        for case in b["evaluationCases"]:case["holdout"]=False
        self.reject(b,"NO_HOLDOUT_CASES")
    def test_duplicate_repetition_denies(self):
        b=sample();b["evaluationObservations"][1]["repeatIndex"]=0
        self.reject(b,"DUPLICATE_REPETITION")
    def test_case_version_tampering_denies(self):
        b=sample();b["evaluationCases"][0]["oracleRef"]="changed"
        self.reject(b,"UNPINNED_OBSERVATION_CASE")
    def test_provenance_content_tampering_denies(self):
        b=sample();b["evaluationProvenance"][0]["observationRef"]["digest"]="sha256:"+"0"*64
        self.reject(b,"INVALID_PROVENANCE_BINDING")
    def test_secret_evidence_without_redaction_denied(self):
        b=sample()
        x=next(o for o in b["evaluationObservations"]
               if o["caseRef"]["id"]=="SYNTHETIC.CASE.6")
        x["redacted"]=False
        self.reject(repin_provenance(b),"SENSITIVE_EVIDENCE_NOT_REDACTED")
    def test_latency_and_cost_limits(self):
        b=sample();b["evaluationObservations"][0]["latencyMs"]=10000
        b["evaluationObservations"][1]["latencyMs"]=10000
        b["evaluationObservations"][1]["costMinor"]=20000
        self.reject(repin_provenance(b),"LATENCY_P95_EXCEEDED")
        self.reject(repin_provenance(b),"COST_BUDGET_EXCEEDED")
    def test_evidence_service_failure_denies(self):
        def offline(*args): raise OSError("unavailable")
        self.reject(sample(),"ATTESTATION_SERVICE_FAILED",attestor=offline)
    def test_mock_data_cannot_prove_disposable_integration(self):
        b=sample();b["evaluationProfiles"][0]["scope"]="DISPOSABLE_INTEGRATION"
        for case in b["evaluationCases"]:
            case["profileRef"]=pin(b["evaluationProfiles"][0],"profileId")
        cases={c["caseId"]:c for c in b["evaluationCases"]}
        for obs in b["evaluationObservations"]:
            obs["caseRef"]=pin(cases[obs["caseRef"]["id"]],"caseId")
        observations={o["observationId"]:o for o in b["evaluationObservations"]}
        for prov in b["evaluationProvenance"]:
            prov["observationRef"]=pin(observations[prov["observationRef"]["id"]],"observationId")
        self.reject(b,"MOCK_DATA_IN_NONSTATIC_ASSURANCE")
    def test_static_profile_cannot_self_claim_live_acceptance(self):
        b=sample()
        report={"schema":"ama.evaluation-report/v0.2-candidate",
                "reportId":"SYNTHETIC.REPORT","version":V,
                "profileRef":pin(b["evaluationProfiles"][0],"profileId"),
                "candidateDigest":digest(b["agent"]),
                "result":"CANDIDATE_METRICS_PASS","assurance":"STATIC_SYNTHETIC",
                "metrics":{"cases":10,"repetitions":20,"falseAllows":0,"falseDenies":0,
                           "policyDenyCases":10,"policyAllowCases":10,
                           "verifiedFinalStates":20,"finalStateCases":20,
                           "evidenceCovered":20,"totalObservations":20,
                           "latencyP95Ms":100,"totalCostMinor":100},
                "findings":[],"provenanceRefs":[],"baselineComparison":"NOT_VERIFIED",
                "generatedAt":AT,"independentAccepted":True}
        b["evaluationReports"]=[report]
        self.reject(b,"INVALID_BUNDLE")
    def test_no_release_from_better_than_unverified_baseline(self):
        a=self.check(sample())["metrics"]
        self.assertEqual("NOT_VERIFIED",compare_baseline(a,a,baseline_verified=False)["status"])
        self.assertFalse(compare_baseline(a,a,baseline_verified=True)["release_authorized"])
    def test_external_baseline_regression_blocks(self):
        b=self.check(sample())["metrics"].copy()
        b["falseAllows"]=0
        c=b.copy();c["falseAllows"]=1
        self.assertEqual("REGRESSION",compare_baseline(c,b,baseline_verified=True)["status"])
    def test_unknown_future_observation_denied(self):
        b=sample();b["evaluationObservations"][0]["observedAt"]="2028-01-01T10:00:00Z"
        self.reject(b,"OBSERVATION_FROM_FUTURE")
    def test_unknown_evaluator_profile_rejected(self):
        b=sample()
        r=evaluate(b,profile_id="OTHER",at=AT,attestor=test_only_attestor)
        self.assertEqual("FAIL",r["status"])
        self.assertIn("MISSING_EVALUATION_PROFILE",r["findings"])
if __name__=="__main__":unittest.main()
