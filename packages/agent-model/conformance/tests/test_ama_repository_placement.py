"""AMA canonical repository placement, preserving the v0.1 foundation and v0.2 candidate."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]

class RepositoryPlacementTests(unittest.TestCase):
    def test_canonical_foundation_not_replaced_by_candidate(self):
        foundation=(ROOT/"agent-stable/ama/README.md").read_text(encoding="utf-8")
        candidate=(ROOT/"agent-stable/ama/ARCHITECTURE-v0.2-CANDIDATE.md").read_text(encoding="utf-8")
        pointer=(ROOT/"docs/architecture/AMA.md").read_text(encoding="utf-8")
        self.assertIn("**Version:** 0.1.0", foundation)
        self.assertIn("ARCHITECTURE-v0.2-CANDIDATE.md", foundation)
        self.assertIn("## 15. Non-goals", candidate)
        self.assertIn("**Canonical current location:** `agent-stable/ama/README.md`",pointer)
        self.assertLess(len(pointer),500)
    def test_reusable_contracts_not_agent_implementation(self):
        self.assertTrue((ROOT/"packages/agent-model/ama-milestones.json").is_file())
        self.assertTrue((ROOT/"packages/agent-model/conformance/ama_m7a_release_audit.py").is_file())
        self.assertTrue((ROOT/"packages/agent-runtime/src/stable-registry.ts").is_file())
        self.assertTrue((ROOT/"agent-stable/registry.json").is_file())
        m=json.loads((ROOT/"packages/agent-model/ama-milestones.json").read_text())
        self.assertEqual(m["milestone_order"], [f"M{i}" for i in range(8)])
        self.assertIs(m["f8"]["core_milestone"],False)
        d=json.loads((ROOT/"packages/agent-model/ama-distribution-manifest.json").read_text())
        self.assertFalse(d["adoption"]["architecture_accepted"])
        self.assertFalse(d["adoption"]["agent_deployment_authorized"])
    def test_restructure_workflow_watches_canonical_architecture(self):
        workflow=(ROOT/".github/workflows/ama-conformance.yml").read_text()
        self.assertIn('agent-stable/ama/**',workflow)
        self.assertIn("ama_m7a_release_audit.py",workflow)

if __name__=="__main__":
    unittest.main()
