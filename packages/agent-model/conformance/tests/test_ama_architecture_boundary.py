"""Negative conformance cases for the universal AMA architecture."""
import copy
import json
import sys
import unittest
from pathlib import Path
PARENT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(PARENT))
from ama_architecture_boundary import validate_boundary

BASE=json.loads((PARENT.parent/"architecture-boundary.json").read_text(encoding="utf-8"))

class ArchitectureBoundaryTests(unittest.TestCase):
    def test_generic_reference_passes(self):
        self.assertEqual(validate_boundary(BASE),[])
    def test_ama_cannot_become_agent(self):
        obj=copy.deepcopy(BASE);obj["kind"]="AGENT_INSTANCE"
        self.assertIn("ARCHITECTURE_NOT_AGENT",validate_boundary(obj))
    def test_no_default_domain(self):
        obj=copy.deepcopy(BASE);obj["default_domain"]="finance"
        self.assertIn("HOST_OR_AGENT_HARDCODED:default_domain",validate_boundary(obj))
    def test_no_default_security_provider(self):
        obj=copy.deepcopy(BASE);obj["default_security_provider"]="specific-security-engine"
        self.assertIn("HOST_OR_AGENT_HARDCODED:default_security_provider",validate_boundary(obj))
    def test_no_embedded_governor(self):
        obj=copy.deepcopy(BASE);obj["default_governing_authority"]="specific-director"
        self.assertIn("HOST_OR_AGENT_HARDCODED:default_governing_authority",validate_boundary(obj))
    def test_no_self_acceptance(self):
        obj=copy.deepcopy(BASE);obj["excluded_responsibilities"].remove("ACCEPT_OWN_CONFORMANCE")
        self.assertIn("AGENT_SIDE_EFFECT_EXCLUSION",validate_boundary(obj))
    def test_no_implicit_deployment(self):
        obj=copy.deepcopy(BASE);obj["conformance_is_deployment_authorization"]=True
        self.assertIn("FORBIDDEN_TRUE:conformance_is_deployment_authorization",validate_boundary(obj))
    def test_missing_contract_rejected(self):
        obj=copy.deepcopy(BASE);obj["contracts"].remove("workflow")
        self.assertIn("MISSING_OR_DUPLICATE_CONTRACT",validate_boundary(obj))
    def test_required_host_policy_injection(self):
        obj=copy.deepcopy(BASE);obj["boundaries"]["host_policy_injected"]=False
        self.assertIn("MISSING_EXTERNAL_BOUNDARY",validate_boundary(obj))

if __name__=="__main__":
    unittest.main()
