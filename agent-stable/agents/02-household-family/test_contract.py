#!/usr/bin/env python3
"""Regression: candidate must reject authority escalation and false operational claims."""
import json, unittest
from pathlib import Path
from validate_contract import validate
BASE=json.loads((Path(__file__).resolve().parent/"household-instance.contract.json").read_text())
class HouseholdContractTests(unittest.TestCase):
    def test_candidate_valid(self): self.assertEqual(validate(BASE),[])
    def test_ama_not_agent(self):
        x=json.loads(json.dumps(BASE));x["architecture"]["kind"]="AGENT_INSTANCE";self.assertTrue(validate(x))
    def test_unauthorized_merge(self):
        x=json.loads(json.dumps(BASE));x["governance"]["may_merge"]=True;self.assertTrue(validate(x))
    def test_self_acceptance(self):
        x=json.loads(json.dumps(BASE));x["roles"][2]["may_accept_work"]=True;self.assertTrue(validate(x))
    def test_uncontrolled_wp(self):
        x=json.loads(json.dumps(BASE));x["commands"][0]["requires_director_assignment"]=False;self.assertTrue(validate(x))
    def test_fake_deploy(self):
        x=json.loads(json.dumps(BASE));x["lifecycle"]["production_authorized"]=True;self.assertTrue(validate(x))
    def test_remote_unknown_replay(self):
        x=json.loads(json.dumps(BASE));x["orchestrator"]["unknown_remote_effect"]="AUTO_RETRY";self.assertTrue(validate(x))
if __name__=="__main__":unittest.main()
