"""Offline denial and reference-completeness tests; no live approval implied."""
import unittest
from ama_promotion_preflight import preflight


def complete():
    values = {key: f"test:{key}" for key in (
        "agent_id", "agent_version", "ama_version", "static_conformance_ref",
        "runtime_conformance_ref", "negative_effect_test_ref",
        "revocation_test_ref", "cdx_policy_decision_ref", "cdx_policy_pin",
        "durable_registry_ref", "evidence_integrity_ref",
        "independent_verification_ref", "director_acceptance_ref",
        "deployment_binding_ref", "rollback_plan_ref"
    )}
    values.update(
        manifest_sha256="a" * 64,
        executor_principal="test:executor", verifier_principal="test:verifier",
        acceptor_principal="test:human-director",
        requested_transition="DEPLOYABLE_TO_ACTIVE",
        static_conformance_status="STATIC_PASS",
        runtime_conformance_status="PASS",
        independent_verification_status="PASS",
        director_acceptance_status="APPROVED",
        revoked=False,
    )
    return values


class PromotionPreflightTests(unittest.TestCase):
    def test_empty_holds(self):
        report = preflight({})
        self.assertEqual(report["status"], "HOLD")
        self.assertFalse(report["activation_authorized"])

    def test_complete_references_never_activate(self):
        report = preflight(complete())
        self.assertEqual(report["status"], "REFERENCES_COMPLETE_UNVERIFIED")
        self.assertFalse(report["activation_authorized"])
        self.assertEqual(report["assurance"], "REFERENCES_ONLY_NOT_AUTHENTICATED")

    def test_reviewer_not_executor(self):
        data = complete()
        data["verifier_principal"] = data["executor_principal"]
        self.assertIn("SELF_REVIEW:executor_principal:verifier_principal",
                      preflight(data)["findings"])

    def test_director_not_verifier(self):
        data = complete()
        data["acceptor_principal"] = data["verifier_principal"]
        self.assertEqual(preflight(data)["status"], "HOLD")

    def test_revoked_holds(self):
        data = complete()
        data["revoked"] = True
        self.assertIn("REVOCATION_STATUS_NOT_CLEAR", preflight(data)["findings"])

    def test_missing_cdx_reference_holds(self):
        data = complete()
        del data["cdx_policy_decision_ref"]
        self.assertIn("MISSING:cdx_policy_decision_ref", preflight(data)["findings"])

    def test_failed_runtime_test_holds(self):
        data = complete()
        data["runtime_conformance_status"] = "FAIL"
        self.assertIn("RUNTIME_CONFORMANCE_NOT_PASSED", preflight(data)["findings"])

    def test_missing_human_approval_holds(self):
        data = complete()
        data["director_acceptance_status"] = "PENDING"
        self.assertEqual(preflight(data)["status"], "HOLD")

    def test_non_object_holds(self):
        self.assertEqual(preflight([])["status"], "HOLD")


if __name__ == "__main__":
    unittest.main()
