"""Reject accidental host coupling or operational authorization."""
import copy
import json
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from ama_release_gates import check
BASE=json.loads((ROOT.parent/"ama-release-gates.json").read_text())
class GateSeparationTests(unittest.TestCase):
    def test_reference(self): self.assertEqual(check(BASE),[])
    def test_host_coupling(self):
        d=copy.deepcopy(BASE);d["gates"]["M7_A"]["host_runtime_required"]=True
        self.assertIn("M7_A_HOST_COUPLING",check(d))
    def test_ama_agent_promotion(self):
        d=copy.deepcopy(BASE);d["architecture_not_agent"]=False
        self.assertIn("ARCHITECTURE_NOT_AGENT",check(d))
    def test_instance_activation(self):
        d=copy.deepcopy(BASE);d["gates"]["M7_O"]["activation_authorized"]=True
        self.assertIn("ACTIVATION_CLAIM",check(d))
    def test_cdx_host_is_not_ama(self):
        d=copy.deepcopy(BASE);d["gates"]["F8_7"]["scope"]="ARCHITECTURE_BASELINE"
        self.assertIn("F8_7_SCOPE",check(d))
if __name__=="__main__":unittest.main()
