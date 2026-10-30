"""M3 knowledge catalogs: typed source inventory, negative and adversarial cases."""
import copy
import sys
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(HERE))
from ama_knowledge import validate_knowledge_catalogs
from test_m3_cognitive import cognitive_fixture
from test_m1_contracts import pin

NOW="2026-10-29T12:00:00+00:00"


def knowledge_fixture():
    bundle=cognitive_fixture(retrieval=True)
    policy=bundle["retrievalPolicies"][0]
    bundle["knowledgeCatalogs"]=[{
        "schema":"ama.knowledge-catalog/v0.2-candidate",
        "catalogId":"SYNTHETIC.KNOWLEDGE.CATALOG",
        "version":"0.2.0","status":"VALIDATED",
        "moduleId":"SYNTHETIC.RETRIEVAL",
        "retrievalPolicyRef":pin(policy,"policyId"),
        "contentGrantsAuthority":False,
        "sourceInstructionsAdmitted":False,
        "sources":[{
            "sourceId":"SYNTHETIC.SOURCE.ONE",
            "sourceRef":"synthetic-source-record",
            "sourceRevision":"revision-001",
            "contentDigest":"sha256:"+"a"*64,
            "sourceScope":"synthetic/item",
            "trustDomain":"synthetic",
            "trustLabel":"VERIFIED",
            "issuerRef":"synthetic-external-issuer",
            "observedAt":"2026-10-29T11:00:00+00:00",
            "maxAgeSeconds":7200,
            "sensitivity":"PUBLIC",
            "admissionState":"ADMITTED",
            "sourceInstructionsAdmitted":False
        }]
    }]
    return bundle


class M3KnowledgeTests(unittest.TestCase):
    def check(self,b,domain="synthetic"):
        return validate_knowledge_catalogs(b,at=NOW,host_trust_domain=domain)
    def must_fail(self,b,code,domain="synthetic"):
        result=self.check(b,domain)
        self.assertEqual(result["status"],"REJECTED",result)
        self.assertIn(code,result["errors"],result)
        self.assertFalse(result["data_access_authorized"])
        self.assertFalse(result["sources_authenticated"])

    def test_optional_absent_catalog(self):
        r=self.check(cognitive_fixture())
        self.assertEqual(r["status"],"STATIC_KNOWLEDGE_ELIGIBLE")
        self.assertEqual(r["catalogs_checked"],0)

    def test_admitted_source_still_requires_external_verification(self):
        r=self.check(knowledge_fixture())
        self.assertEqual(r["status"],"STATIC_KNOWLEDGE_ELIGIBLE",r)
        self.assertFalse(r["data_access_authorized"])
        self.assertFalse(r["sources_authenticated"])
        self.assertFalse(r["source_content_is_authority"])

    def test_quarantined_untrusted_source_can_be_inventoried(self):
        b=knowledge_fixture()
        s=b["knowledgeCatalogs"][0]["sources"][0]
        s["trustLabel"]="UNVERIFIED"
        s["admissionState"]="QUARANTINED"
        self.assertEqual(self.check(b)["status"],"STATIC_KNOWLEDGE_ELIGIBLE")

    def test_untrusted_source_cannot_be_admitted(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["trustLabel"]="UNVERIFIED"
        self.must_fail(b,"UNTRUSTED_KNOWLEDGE_ADMITTED")

    def test_revoked_source_cannot_be_admitted(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["trustLabel"]="REVOKED"
        self.must_fail(b,"UNTRUSTED_KNOWLEDGE_ADMITTED")

    def test_digest_pin_mismatch_rejected(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["retrievalPolicyRef"]["digest"]="sha256:"+"0"*64
        self.must_fail(b,"KNOWLEDGE_RETRIEVAL_PIN_MISMATCH")

    def test_mandate_scope_nonamplification(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["sourceScope"]="outside/item"
        self.must_fail(b,"KNOWLEDGE_OUTSIDE_AGENT_MANDATE")

    def test_scope_boundary_is_not_string_prefix(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["sourceScope"]="synthetic/items"
        self.must_fail(b,"KNOWLEDGE_OUTSIDE_RETRIEVAL_POLICY")

    def test_stale_data_cannot_be_admitted(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["maxAgeSeconds"]=30
        self.must_fail(b,"STALE_KNOWLEDGE_ADMITTED")

    def test_future_observation_detected(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["observedAt"]="2026-10-30T12:00:00+00:00"
        self.must_fail(b,"KNOWLEDGE_FUTURE_SOURCE_TIMESTAMP")

    def test_cross_domain_denied_when_policy_denies(self):
        b=knowledge_fixture()
        self.must_fail(b,"CROSS_DOMAIN_KNOWLEDGE_DENIED","other-trust-domain")

    def test_sensitive_source_requires_host_access_reference(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["sensitivity"]="CONFIDENTIAL"
        self.must_fail(b,"SENSITIVE_KNOWLEDGE_NEEDS_HOST_AUTHORIZATION")

    def test_sensitive_reference_is_not_access_authorization(self):
        b=knowledge_fixture()
        s=b["knowledgeCatalogs"][0]["sources"][0]
        s["sensitivity"]="RESTRICTED"
        s["hostAuthorizationRef"]="HOST_DID_NOT_VERIFY_THIS_REFERENCE"
        r=self.check(b)
        self.assertEqual(r["status"],"STATIC_KNOWLEDGE_ELIGIBLE",r)
        self.assertFalse(r["data_access_authorized"])

    def test_source_instructions_cannot_be_promoted(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"][0]["sourceInstructionsAdmitted"]=True
        self.must_fail(b,"INVALID_M3_BUNDLE")

    def test_duplicate_source_rejected(self):
        b=knowledge_fixture()
        b["knowledgeCatalogs"][0]["sources"].append(copy.deepcopy(
            b["knowledgeCatalogs"][0]["sources"][0]))
        self.must_fail(b,"DUPLICATE_KNOWLEDGE_SOURCE")

    def test_knowledge_needs_retrieval_module(self):
        b=knowledge_fixture()
        b["agent"]["modules"]=[x for x in b["agent"]["modules"]
                                if x["kind"]!="RETRIEVAL"]
        self.must_fail(b,"INVALID_M3_BUNDLE")


if __name__=="__main__":
    unittest.main()
