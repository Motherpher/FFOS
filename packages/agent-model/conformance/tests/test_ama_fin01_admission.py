"""FIN-01 A04/A06/A07 negative contract tests: no admission or authority."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_fin01_admission import audit_identity_and_card

def fixture():
    return {"identities":{
        "agent_definition":"synthetic:definition:1",
        "runtime_deployment":"synthetic:deployment:1",
        "identity_principal":"synthetic:principal:1",
        "workload_instance":"synthetic:instance:1",
        "run":"synthetic:run:1"},
        "card":{
            "purpose":"Synthetic architecture verification only",
            "intended_users":["Conformance test"],
            "limitations":["No effect authorization"],
            "prohibited_applications":["Real deployments"],
            "test_profile":"synthetic:no-runtime",
            "change_history":["v1 synthetic fixture"]},
        "discovery":{"description":"Architecture synthetic reference"}}

class AdmissionContractTests(unittest.TestCase):
    def test_distinct_identities_and_full_card_only_eligibility(self):
        r=audit_identity_and_card(fixture())
        self.assertEqual([],r["errors"])
        self.assertTrue(r["source_contract_eligible"])
        self.assertFalse(r["effect_authorized"])
        self.assertFalse(r["admission_eligible"])

    def test_A04_cross_boundary_identity_collision_denied(self):
        x=fixture()
        x["identities"]["identity_principal"]=x["identities"]["run"]
        self.assertIn("IDENTITIES_NOT_DISTINCT",audit_identity_and_card(x)["errors"])

    def test_A04_missing_runtime_identity_denied(self):
        x=fixture()
        del x["identities"]["runtime_deployment"]
        self.assertIn("MISSING_IDENTITY:runtime_deployment",audit_identity_and_card(x)["errors"])

    def test_A06_discovery_effect_promotion_denied(self):
        x=fixture()
        x["discovery"]["claimed_effect_class"]="E3_EXTERNAL_EFFECT"
        r=audit_identity_and_card(x)
        self.assertIn("DISCOVERY_CANNOT_GRANT_EFFECTS",r["errors"])
        self.assertFalse(r["effect_authorized"])

    def test_A06_documentation_cannot_mint_authority(self):
        x=fixture()
        x["card_grants_authority"]=True
        self.assertIn("DOCUMENTATION_CANNOT_GRANT_AUTHORITY",audit_identity_and_card(x)["errors"])

    def test_A07_missing_limitations_denied(self):
        x=fixture()
        del x["card"]["limitations"]
        self.assertIn("MISSING_CARD_FIELD:limitations",audit_identity_and_card(x)["errors"])

    def test_A07_missing_test_profile_denied(self):
        x=fixture()
        x["card"]["test_profile"]=" "
        self.assertIn("MISSING_CARD_FIELD:test_profile",audit_identity_and_card(x)["errors"])

    def test_A07_no_discovery_description_denied(self):
        x=fixture()
        x["discovery"]["description"]=""
        self.assertIn("DISCOVERABILITY_DESCRIPTION_REQUIRED",audit_identity_and_card(x)["errors"])

if __name__=="__main__":
    unittest.main()
