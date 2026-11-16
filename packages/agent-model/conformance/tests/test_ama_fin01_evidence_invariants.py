"""FIN-01 I06/I07 negative tests: telemetry cannot erase mandatory audit evidence."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_fin01_evidence_invariants import check_metrics,check_audit_sampling

def metrics():
    return {"token_count":None,"cost_minor":4,"latency_ms":0,
            "latency_ms_observed_zero":True}

def audit():
    return {"mandatory_event_kinds":["POLICY_DECISION","EFFECT_ATTEMPT","EFFECT_OUTCOME"],
            "sampled_event_kinds":["PERFORMANCE_SPAN"],
            "evidence_custody":"APPEND_ONLY_INDEPENDENT",
            "retention_policy_ref":"synthetic:retention"}

class EvidenceInvariants(unittest.TestCase):
    def test_I06_unknown_is_explicitly_not_zero(self):
        self.assertTrue(check_metrics(metrics())["contract_valid"])
        self.assertIsNone(metrics()["token_count"])

    def test_I06_unobserved_zero_rejected(self):
        m=metrics();m["token_count"]=0
        self.assertIn("ZERO_WITHOUT_OBSERVATION:token_count",check_metrics(m)["errors"])

    def test_I06_negative_and_boolean_metrics_rejected(self):
        m=metrics();m["cost_minor"]=-1;m["latency_ms"]=False
        self.assertIn("INVALID_METRIC:cost_minor",check_metrics(m)["errors"])
        self.assertIn("INVALID_METRIC:latency_ms",check_metrics(m)["errors"])

    def test_I07_sampling_does_not_remove_required_audit(self):
        self.assertTrue(check_audit_sampling(audit())["contract_valid"])

    def test_I07_sampled_policy_denial_evidence_rejected(self):
        p=audit();p["sampled_event_kinds"].append("POLICY_DECISION")
        self.assertIn("MANDATORY_AUDIT_EVENTS_SAMPLED",check_audit_sampling(p)["errors"])

    def test_I07_audit_cannot_depend_on_mutable_session(self):
        p=audit();p["evidence_custody"]="SESSION_MEMORY"
        self.assertIn("AUDIT_CUSTODY_NOT_INDEPENDENT",check_audit_sampling(p)["errors"])

    def test_I07_missing_mandatory_effect_record_rejected(self):
        p=audit();p["mandatory_event_kinds"].remove("EFFECT_OUTCOME")
        self.assertIn("MANDATORY_EVENTS_NOT_DECLARED",check_audit_sampling(p)["errors"])

if __name__=="__main__":
    unittest.main()
