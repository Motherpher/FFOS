"""M7-A audit must report gaps truthfully and never self-adopt an architecture."""
import copy
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from ama_m7a_release_audit import assess, load


class M7AReadinessTests(unittest.TestCase):
    def test_current_candidate_has_no_false_release_claim(self):
        report = load()
        self.assertEqual(report["original_requirement_count"], 96)
        self.assertEqual(report["direct_partial_test_evidence_links"], 65)
        self.assertEqual(len(report["requirements_without_direct_links"]), 31)
        self.assertEqual(report["module_count"], 32)
        self.assertEqual(report["module_contracts_fully_completed"], 0)
        self.assertEqual(report["proposed_requirements_pending_acceptance"], 96)
        self.assertFalse(report["architecture_accepted"])
        self.assertFalse(report["exact_head_ci_verified"])
        self.assertFalse(report["activation_authorized"])
        self.assertEqual(report["structural_findings"], [])
        self.assertEqual(report["disposition"], "M7_A_BLOCKED_PENDING_CI_AUDIT_AND_OWNER_ADOPTION")

    def test_unattested_source_cannot_become_ci_attestation(self):
        report = load()
        self.assertEqual(report["source_commit"], "UNATTESTED")
        self.assertFalse(report["source_test_bridge_authenticates_ci"])
        self.assertFalse(report["independent_technical_audit_accepted"])

    def test_requirement_links_are_partial_evidence_not_passes(self):
        root = Path(__file__).resolve().parents[3]
        import json
        def read(path):
            return json.loads((root / path).read_text(encoding="utf-8"))
        values = [
            read("packages/agent-model/ama-milestones.json"),
            read("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json"),
            read("packages/agent-model/ama-m0-test-evidence-bridge.json"),
            read("packages/agent-model/ama-template-coverage.json"),
            read("packages/agent-model/ama-distribution-manifest.json"),
            read("packages/agent-model/ama-release-gates.json")
        ]
        corrupted = copy.deepcopy(values)
        corrupted[2]["entries"][0]["relation"] = "COMPLETE"
        self.assertIn("EVIDENCE_OVERCLAIM", assess(*corrupted)["structural_findings"])
        corrupted = copy.deepcopy(values)
        corrupted[2]["entries"].append(corrupted[2]["entries"][0])
        self.assertIn("EVIDENCE_LINKS_DUPLICATE_OR_UNKNOWN",
                      assess(*corrupted)["structural_findings"])
        corrupted = copy.deepcopy(values)
        corrupted[5]["gates"]["M7_A"]["host_runtime_required"] = True
        self.assertIn("HOST_RUNTIME_COUPLING", assess(*corrupted)["structural_findings"])
        corrupted = copy.deepcopy(values)
        corrupted[4]["adoption"]["agent_deployment_authorized"] = True
        self.assertIn("FORBIDDEN_DEPLOYMENT_CLAIM", assess(*corrupted)["structural_findings"])


if __name__ == "__main__":
    unittest.main()
