"""M2 secret references and M6 localization stay provider-neutral and inert."""
import copy
import sys
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(HERE))
from ama_support_profiles import check_secret_bindings,check_localization_profiles
from ama_vnext import digest
from test_m1_contracts import fixture,repin,pin


def agent_ref(b):
    a=b["agent"]
    return {"id":a["agentId"],"version":a["agentVersion"],"digest":digest(a)}


def secret_fixture():
    b=fixture()
    b["toolAdapters"][0]["credentialBindingRequired"]=True
    repin(b)
    b["secretBindings"]=[{
        "schema":"ama.secret-binding/v0.2-candidate",
        "bindingId":"SYNTHETIC.SECRET.BINDING",
        "version":"0.2.0",
        "status":"VALIDATED",
        "agentRef":agent_ref(b),
        "capabilityRef":pin(b["capabilities"][0],"capabilityId"),
        "providerRef":"SYNTHETIC.HOST_SECRET_SERVICE",
        "secretRef":"ref:synthetic/credential",
        "resourceScope":"synthetic/item",
        "maxRotationAgeSeconds":86400,
        "revocationCheckRequired":True,
        "accessAuditRequired":True,
        "runtimeInjectionRequired":True,
        "redactionRequired":True,
        "rawSecretMaterialAllowed":False
    }]
    return b


def localization_fixture():
    b=fixture()
    b["localizationProfiles"]=[{
        "schema":"ama.localization-profile/v0.2-candidate",
        "profileId":"SYNTHETIC.LOCALIZATION",
        "version":"0.2.0",
        "status":"VALIDATED",
        "agentRef":agent_ref(b),
        "defaultLocale":"sv-SE",
        "supportedLocales":["sv-SE","en-US"],
        "fallbackLocales":["en-US"],
        "timezonePolicy":"UTC_WITH_EXPLICIT_LOCAL_CONVERSION",
        "accessibility":{"structuredTextRequired":True,
                         "keyboardAccessibleHostRequired":True,
                         "semanticLabelsRequired":True},
        "translation":{"sourceLanguageAttributionRequired":True,
                       "dataClassificationPreserved":True,
                       "translationGrantsAuthority":False,
                       "consequentialOutputReviewRequired":True}
    }]
    return b


class SupportProfilesTests(unittest.TestCase):
    def test_secrets_optional_and_not_runtime_auth(self):
        r=check_secret_bindings(fixture())
        self.assertEqual(r["status"],"STATIC_SECRETS_ELIGIBLE",r)
        self.assertFalse(r["runtime_authorized"])

    def test_secret_pointer_not_material_and_never_verified(self):
        r=check_secret_bindings(secret_fixture())
        self.assertEqual(r["status"],"STATIC_SECRETS_ELIGIBLE",r)
        self.assertFalse(r["credentials_present"])
        self.assertFalse(r["rotation_verified"])
        self.assertFalse(r["revocation_verified"])

    def test_secret_raw_key_rejected(self):
        b=secret_fixture()
        b["secretBindings"][0]["secretRef"]="sk-real-material"
        r=check_secret_bindings(b)
        self.assertIn("INVALID_M1_BUNDLE",r["errors"])

    def test_secret_scope_exceeds_capability(self):
        b=secret_fixture()
        b["secretBindings"][0]["resourceScope"]="synthetic/items"
        r=check_secret_bindings(b)
        self.assertIn("SECRET_SCOPE_EXCEEDS_CAPABILITY",r["errors"])

    def test_secret_binding_requires_credential_aware_adapter(self):
        b=secret_fixture()
        b["toolAdapters"][0]["credentialBindingRequired"]=False
        repin(b)
        b["secretBindings"][0]["agentRef"]=agent_ref(b)
        b["secretBindings"][0]["capabilityRef"]=pin(b["capabilities"][0],"capabilityId")
        r=check_secret_bindings(b)
        self.assertIn("UNNECESSARY_OR_UNSUPPORTED_SECRET_BINDING",r["errors"])

    def test_secret_binding_agent_pin(self):
        b=secret_fixture()
        b["secretBindings"][0]["agentRef"]["digest"]="sha256:"+"0"*64
        self.assertIn("SECRET_AGENT_PIN_MISMATCH",check_secret_bindings(b)["errors"])

    def test_secret_active_claim_rejected(self):
        b=secret_fixture()
        b["secretBindings"][0]["status"]="ACTIVE"
        self.assertIn("SECRET_ACTIVE_CANNOT_BE_SELF_ATTESTED",
                      check_secret_bindings(b)["errors"])

    def test_duplicate_secret_bindings_rejected(self):
        b=secret_fixture()
        b["secretBindings"].append(copy.deepcopy(b["secretBindings"][0]))
        self.assertIn("DUPLICATE_SECRET_BINDING",check_secret_bindings(b)["errors"])

    def test_locale_optional(self):
        self.assertEqual(check_localization_profiles(fixture())["status"],
                         "STATIC_LOCALIZATION_ELIGIBLE")

    def test_locale_profile_without_translation_runtime(self):
        r=check_localization_profiles(localization_fixture())
        self.assertEqual(r["status"],"STATIC_LOCALIZATION_ELIGIBLE",r)
        self.assertFalse(r["translations_verified"])
        self.assertFalse(r["accessibility_verified"])

    def test_unsupported_default_locale(self):
        b=localization_fixture()
        b["localizationProfiles"][0]["defaultLocale"]="fr-FR"
        self.assertIn("DEFAULT_LOCALE_UNSUPPORTED",
                      check_localization_profiles(b)["errors"])

    def test_casefold_duplicate_locale(self):
        b=localization_fixture()
        b["localizationProfiles"][0]["supportedLocales"].append("en-us")
        self.assertIn("DUPLICATE_LOCALE_CANONICAL_CASE",
                      check_localization_profiles(b)["errors"])

    def test_invalid_fallback(self):
        b=localization_fixture()
        b["localizationProfiles"][0]["fallbackLocales"]=["fr-FR"]
        self.assertIn("INVALID_FALLBACK_LOCALE",
                      check_localization_profiles(b)["errors"])

    def test_translation_never_grants_authority(self):
        b=localization_fixture()
        b["localizationProfiles"][0]["translation"]["translationGrantsAuthority"]=True
        self.assertIn("INVALID_M1_BUNDLE",
                      check_localization_profiles(b)["errors"])

    def test_localization_active_claim_rejected(self):
        b=localization_fixture()
        b["localizationProfiles"][0]["status"]="ACTIVE"
        self.assertIn("LOCALIZATION_ACTIVE_REQUIRES_HOST_ACCEPTANCE",
                      check_localization_profiles(b)["errors"])


if __name__=="__main__":
    unittest.main()
