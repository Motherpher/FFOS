"""Negative cases for FIN-01 mission clearance and no next-stage self-dispatch."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/"packages/agent-model/conformance"))
from ama_fin01_mission_clearance import assess,PATH

class MissionClearanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.record=json.loads((ROOT/PATH).read_text(encoding="utf-8"))

    def test_engineering_continuity_does_not_clear_fin01(self):
        result=assess(self.record)
        self.assertEqual(result["errors"],[])
        self.assertEqual(result["engineering_continuity"],"IN_SCOPE_ONLY")
        self.assertFalse(result["formal_fin01_clearance"])
        self.assertFalse(result["may_trigger_fin02"])
        self.assertFalse(result["agent_construction_permitted"])

    def test_false_stage_trigger_rejected(self):
        r=copy.deepcopy(self.record)
        r["status"]["next_stage_automatic_trigger"]="AUTHORIZED"
        self.assertIn("UNAUTHORIZED_STAGE_TRIGGER",assess(r)["errors"])

    def test_false_director_acceptance_rejected(self):
        r=copy.deepcopy(self.record)
        r["status"]["fin01_director_acceptance"]="ACCEPTED"
        self.assertIn("FORGED_DIRECTOR_ACCEPTANCE",assess(r)["errors"])

    def test_j2_source_review_cannot_disappear(self):
        r=copy.deepcopy(self.record)
        next(g for g in r["gap_queue"] if g["id"]=="K02")["household_protocol_classification"]="J1_REGISTERED_REPAIR"
        self.assertIn("J2_SOURCE_HOLD_MISSING:K02",assess(r)["errors"])

    def test_missing_gap_not_closed_by_removal(self):
        r=copy.deepcopy(self.record)
        r["gap_queue"].pop()
        self.assertIn("INCOMPLETE_GAP_QUEUE",assess(r)["errors"])

    def test_agent_scope_drift_rejected(self):
        r=copy.deepcopy(self.record)
        r["scope"]="BUILD_HOUSEHOLD_AGENT"
        self.assertIn("OUT_OF_SCOPE",assess(r)["errors"])

if __name__=="__main__":
    unittest.main()
