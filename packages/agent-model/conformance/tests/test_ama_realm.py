"""Realm boundaries: FF estate requires CDX, external reuse can detach F8.

All fixtures use synthetic agent identities. No runtime authority is established.
"""
import copy
import json
import sys
import unittest
from pathlib import Path
HERE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(HERE))
from test_m1_contracts import fixture
from ama_realm import declare_realm,check_realm,validate_stewardship


def sample(realm_id="FF_ESTATE/PIUS",internal=True):
    b=fixture()
    declare_realm(
        b,realm_id=realm_id,
        realm_owner_ref="FORM_FLODE" if internal else "EXTERNAL_ORG",
        governing_principal_ref=b["agent"]["authority"]["governingPrincipalRef"],
        policy_authority_ref="CDX:POLICY" if internal else "HOST:POLICY",
        security_anchor_ref="CDX:F8" if internal else "HOST:SECURITY",
        mode="MANDATORY" if internal else "DETACHED_EXTERNAL",
        category="OWNER_ESTATE" if internal else "EXTERNAL_CONSUMER")
    return b


class RealmBindingTests(unittest.TestCase):
    def deny(self,b,code):
        r=check_realm(b)
        self.assertEqual(r["status"],"REJECTED",r)
        self.assertIn(code,r["errors"])
        self.assertFalse(r["runtime_cdx_verified"])
        self.assertFalse(r["effect_authorized"])

    def test_ama_stewardship_is_internal_and_cdx_anchored(self):
        root=HERE.parents[2]
        stewardship=json.loads((root/"packages/agent-model/ama-stewardship-realm.json").read_text())
        policy=json.loads((root/"integrations/cdx/f8/realm-binding-policy.json").read_text())
        distribution=json.loads((root/"packages/agent-model/ama-distribution-manifest.json").read_text())
        result=validate_stewardship(stewardship,policy,distribution)
        self.assertEqual(result["status"],"STATIC_STEWARDSHIP_CONSISTENT",result)
        self.assertTrue(result["internal_cdx_required"])
        self.assertTrue(result["external_distribution_detachable"])
        self.assertFalse(result["cdx_runtime_verified"])
        stewardship["governance_anchor"]="OTHER:SECURITY"
        self.assertIn("STEWARDSHIP_MISSING_CDX",
                      validate_stewardship(stewardship,policy,distribution)["errors"])

    def test_no_declared_realm_fails(self):
        self.deny(fixture(),"OPERATING_REALM_REQUIRED")
    def test_ff_organization_realm_is_mandatorily_cdx(self):
        r=check_realm(sample())
        self.assertEqual(r["status"],"STATIC_REALM_ELIGIBLE",r)
        self.assertTrue(r["f8_required_for_realm"])
        self.assertFalse(r["f8_detachment_allowed"])
        self.assertFalse(r["runtime_cdx_verified"])
    def test_ff_subsidiary_inherits_required_cdx(self):
        r=check_realm(sample("FF_ESTATE/SUBSIDIARIES/ENTITY"))
        self.assertEqual(r["status"],"STATIC_REALM_ELIGIBLE",r)
        self.assertTrue(r["f8_required_for_realm"])
    def test_external_consumer_has_explicit_local_policy(self):
        r=check_realm(sample("EXTERNAL/CLIENT_A",False))
        self.assertEqual(r["status"],"STATIC_REALM_ELIGIBLE",r)
        self.assertTrue(r["f8_detachment_allowed"])
        self.assertFalse(r["f8_required_for_realm"])
    def test_ff_cdx_cannot_be_detached(self):
        b=sample();b["operatingRealm"]["securityBindingMode"]="DETACHED_EXTERNAL"
        self.deny(b,"CDX_DETACHMENT_FORBIDDEN_IN_FF_ESTATE")
    def test_ff_cdx_cannot_be_replaced(self):
        b=sample();b["operatingRealm"]["securityAnchorRef"]="OTHER:SECURITY"
        self.deny(b,"CDX_ANCHOR_REQUIRED_IN_FF_ESTATE")
    def test_ff_policy_cannot_be_bypassed(self):
        b=sample();b["operatingRealm"]["policyAuthorityRef"]="OTHER:POLICY"
        self.deny(b,"CDX_POLICY_AUTHORITY_REQUIRED_IN_FF_ESTATE")
    def test_pius_internal_cannot_be_reclassified_external(self):
        b=sample();b["operatingRealm"]["realmCategory"]="EXTERNAL_CONSUMER"
        self.deny(b,"INTERNAL_REALM_MISCLASSIFIED")
    def test_export_of_internal_agent_realm_not_allowed(self):
        b=sample();b["operatingRealm"]["externalExportAllowed"]=True
        self.deny(b,"INTERNAL_INSTANCE_CANNOT_EXPORT_ITS_REALM_BINDING")
    def test_external_detached_cannot_retain_cdx_anchor(self):
        b=sample("EXTERNAL/CLIENT_A",False)
        b["operatingRealm"]["securityAnchorRef"]="CDX:F8"
        self.deny(b,"DETACHED_CANNOT_REFERENCE_CDX_ANCHOR")
    def test_external_detached_cannot_retain_cdx_policy(self):
        b=sample("EXTERNAL/CLIENT_A",False)
        b["operatingRealm"]["policyAuthorityRef"]="CDX:POLICY"
        self.deny(b,"DETACHED_CANNOT_KEEP_CDX_POLICY_AUTHORITY")
    def test_agent_ref_is_pinned(self):
        b=sample();b["operatingRealm"]["agentRef"]["digest"]="sha256:"+"0"*64
        self.deny(b,"REALM_AGENT_PIN_MISMATCH")
    def test_governing_principal_is_bound(self):
        b=sample();b["operatingRealm"]["governingPrincipalRef"]="OTHER_PRINCIPAL"
        self.deny(b,"REALM_GOVERNING_PRINCIPAL_MISMATCH")
    def test_malformed_context_is_not_silently_defaulted(self):
        b=sample();del b["operatingRealm"]["policyAuthorityRef"]
        self.deny(b,"REALM_SCHEMA_INVALID")


if __name__=="__main__":
    unittest.main()
