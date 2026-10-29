"""AMA starter generates valid draft definitions without granting agent standing."""
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
from ama_starter import starter
from ama_blueprint import assemble
from ama_vnext import validate_bundle


def make(id="SYNTHETIC.ALPHA"):
    return starter(id, "Sample", "A synthetic scope-limited task",
                   "synthetic/item", "SYNTHETIC.OWNER", "SYNTHETIC-START")


class StarterTests(unittest.TestCase):
    def test_generated_bundle_is_m1_valid(self):
        bundle = make()
        self.assertEqual(validate_bundle(bundle), [])
        self.assertEqual(bundle["agent"]["lifecycleState"], "DRAFT")
        self.assertEqual(bundle["toolAdapters"][0]["status"], "DRAFT")
        self.assertTrue(bundle["toolAdapters"][0]["credentialBindingRequired"])
        self.assertEqual(bundle["agent"]["modules"], [])
        self.assertEqual(bundle["agent"]["authority"]["approvalMode"], "HUMAN_RESERVED")

    def test_starter_feeds_m0_m7_blueprint(self):
        blueprint = assemble(make())
        self.assertEqual(blueprint["status"], "CONSTRUCTION_BLUEPRINT_CANDIDATE")
        self.assertFalse(blueprint["template_complete"])
        self.assertFalse(blueprint["runtime_accepted"])
        self.assertFalse(blueprint["agent_activated"])

    def test_separate_agent_id_does_not_change_ama_contract(self):
        a = make("SYNTHETIC.ALPHA")
        b = make("SYNTHETIC.BETA")
        self.assertNotEqual(a["agent"]["agentId"], b["agent"]["agentId"])
        self.assertNotEqual(a["agent"]["workflowRefs"][0]["digest"],
                            b["agent"]["workflowRefs"][0]["digest"])
        self.assertEqual(validate_bundle(a), [])
        self.assertEqual(validate_bundle(b), [])

    def test_invalid_identifier_fails_closed(self):
        with self.assertRaises(ValueError):
            make("bad id")

    def test_external_authority_cannot_be_omitted(self):
        with self.assertRaises(ValueError):
            starter("SYNTHETIC.ALPHA", "Sample", "Task", "synthetic/item", "",
                    "SYNTHETIC-START")


if __name__ == "__main__":
    unittest.main()
