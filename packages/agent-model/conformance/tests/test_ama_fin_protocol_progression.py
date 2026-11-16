"""AMA stage nomination retains Director/Verifier separation and J2 stop."""
import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_fin_protocol_progression import evaluate

def fixture():
    evidence={k:{"status":"VERIFIED_PASS","ref":"evidence:synthetic:"+k}
              for k in ("janitor_inspection","handyman_scope","verifier_evidence")}
    return {"current_stage":"FIN-01","classification":"J0",
            "mandate_ref":"director:synthetic:current",
            "mandate_validation":"EXTERNALLY_VERIFIED",
            "next_stage_mandate":"FIN-02",
            "next_stage_mandate_validation":"EXTERNALLY_VERIFIED",
            "director_acceptance":{"stage":"FIN-01","decision":"ACCEPT",
                                   "source":"EXTERNAL_DIRECTOR",
                                   "external_evidence_ref":"director:synthetic:accepted",
                                   "validation":"EXTERNALLY_VERIFIED",
                                   "signature_verification_ref":"test:signature"},
            "evidence":evidence}

class ProtocolProgression(unittest.TestCase):
    def test_synthetic_nomination_never_triggers_or_accepts(self):
        r=evaluate(fixture())
        self.assertEqual(r["result"],"ELIGIBLE_FOR_DIRECTOR_AUTHORIZED_NEXT_STAGE")
        self.assertEqual(r["candidate_next_stage"],"FIN-02")
        self.assertFalse(r["actual_next_stage_triggered"])
        self.assertFalse(r["automatic_stage_acceptance"])

    def test_current_fin01_hold_not_eligible(self):
        c=fixture()
        c["evidence"]["verifier_evidence"]["status"]="HOLD"
        self.assertIn("MISSING_VERIFIED_EVIDENCE:verifier_evidence",evaluate(c)["errors"])

    def test_j2_is_hard_stop(self):
        c=fixture()
        c["classification"]="J2"
        self.assertIn("J2_CONSTITUTIONAL_STOP",evaluate(c)["errors"])

    def test_j1_must_use_registered_recipe(self):
        c=fixture()
        c["classification"]="J1"
        self.assertIn("J1_RECIPE_REQUIRED",evaluate(c)["errors"])

    def test_director_must_be_independently_verified(self):
        c=fixture()
        c["director_acceptance"]["validation"]="UNVERIFIED"
        self.assertIn("EXTERNAL_DIRECTOR_ACCEPTANCE_REQUIRED",evaluate(c)["errors"])

    def test_next_mandate_must_be_verified(self):
        c=fixture()
        c["next_stage_mandate_validation"]="UNVERIFIED"
        self.assertIn("NEXT_STAGE_MANDATE_REQUIRED",evaluate(c)["errors"])

    def test_no_acceptance_by_internal_role(self):
        c=fixture()
        c["director_acceptance"]["source"]="VERIFIER"
        self.assertIn("SELF_ACCEPTANCE_FORBIDDEN",evaluate(c)["errors"])

    def test_finish_requires_distinct_release_gate(self):
        c=fixture()
        c["current_stage"]="FIN-05"
        c["director_acceptance"]["stage"]="FIN-05"
        self.assertIn("TERMINAL_STAGE_REQUIRES_DIRECTOR_RELEASE",evaluate(c)["errors"])

    def test_exact_head_tests_cannot_be_skipped(self):
        c=fixture()
        c["exact_head_tests_required"]=True
        self.assertIn("EXACT_HEAD_TESTS_NOT_VERIFIED",evaluate(c)["errors"])

if __name__=="__main__":
    unittest.main()
