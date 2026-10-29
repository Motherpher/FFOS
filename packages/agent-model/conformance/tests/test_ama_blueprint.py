"""Blueprint generation reuses M1 and canonical milestones, never an agent launch."""
import copy
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE / "tests"))
from ama_blueprint import assemble
from test_m1_contracts import fixture
from test_m4_eventing import event_fixture
from test_ama_support_profiles import secret_fixture, localization_fixture


class BlueprintTests(unittest.TestCase):
    def test_valid_m1_bundle_generates_m0_to_m7_blueprint(self):
        blueprint = assemble(fixture())
        self.assertEqual(blueprint["status"], "CONSTRUCTION_BLUEPRINT_CANDIDATE")
        self.assertEqual(blueprint["architecture_stages"],
                         ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7"])
        self.assertEqual(blueprint["stages"]["M0"]["research_requirement_count"], 96)
        self.assertFalse(blueprint["template_complete"])
        self.assertFalse(blueprint["agent_registered"])
        self.assertFalse(blueprint["agent_activated"])
        self.assertFalse(blueprint["runtime_accepted"])
        self.assertFalse(blueprint["effect_authorized"])

    def test_f8_is_opt_in_host_profile(self):
        self.assertEqual(assemble(fixture())["optional_host_integrations"], [])
        with_f8 = assemble(fixture(), use_f8=True)
        self.assertEqual(with_f8["optional_host_integrations"], ["F8_CDX"])
        self.assertIn("F8_HOST_BINDING", with_f8["implementation_obligations"])
        self.assertNotIn("F8_HOST_BINDING", assemble(fixture())["implementation_obligations"])
        self.assertFalse(with_f8["runtime_accepted"])

    def test_optional_modules_are_selected_explicitly(self):
        b = assemble(fixture(), optional_modules=["memory", "retrieval"])
        self.assertEqual(b["selected_optional_modules"], ["memory", "retrieval"])
        self.assertIn("memory", b["implementation_obligations"])
        self.assertNotIn("knowledge", b["implementation_obligations"])

    def test_event_trigger_implicitly_selects_m4_module(self):
        b=assemble(event_fixture())
        self.assertEqual(b["status"],"CONSTRUCTION_BLUEPRINT_CANDIDATE",b)
        self.assertIn("eventing",b["selected_optional_modules"])
        self.assertIn("eventing",b["implementation_obligations"])

    def test_invalid_event_trigger_is_caught_by_m7(self):
        bad=event_fixture()
        bad["eventTriggers"][0]["maxEffectClass"]="E3_EXTERNAL_EFFECT"
        b=assemble(bad)
        self.assertEqual(b["status"],"INVALID_SOURCE")
        self.assertIn("eventTriggers:TRIGGER_EFFECT_ESCALATION",b["validation_errors"])

    def test_secret_binding_implicitly_selects_m2_module(self):
        b=assemble(secret_fixture())
        self.assertEqual(b["status"],"CONSTRUCTION_BLUEPRINT_CANDIDATE",b)
        self.assertIn("secrets",b["selected_optional_modules"])

    def test_secret_scope_problem_cannot_hide_from_blueprint(self):
        bad=secret_fixture()
        bad["secretBindings"][0]["resourceScope"]="synthetic/items"
        b=assemble(bad)
        self.assertIn("secretBindings:SECRET_SCOPE_EXCEEDS_CAPABILITY",b["validation_errors"])

    def test_locale_profile_implicitly_selects_m6_module(self):
        b=assemble(localization_fixture())
        self.assertEqual(b["status"],"CONSTRUCTION_BLUEPRINT_CANDIDATE",b)
        self.assertIn("localization",b["selected_optional_modules"])

    def test_bad_locale_fallback_is_rejected_in_m7(self):
        bad=localization_fixture()
        bad["localizationProfiles"][0]["fallbackLocales"]=["fr-FR"]
        b=assemble(bad)
        self.assertIn("localizationProfiles:INVALID_FALLBACK_LOCALE",b["validation_errors"])

    def test_unknown_module_is_not_accepted(self):
        b = assemble(fixture(), optional_modules=["imaginary-module"])
        self.assertEqual(b["status"], "INVALID_SOURCE")
        self.assertIn("UNKNOWN_OR_NON_OPTIONAL_MODULE:imaginary-module",
                      b["validation_errors"])

    def test_core_module_cannot_be_optional(self):
        b = assemble(fixture(), optional_modules=["capability"])
        self.assertEqual(b["status"], "INVALID_SOURCE")

    def test_invalid_bundle_is_not_blueprint_pass(self):
        x = copy.deepcopy(fixture())
        x["schema"] = "incorrect"
        b = assemble(x)
        self.assertEqual(b["status"], "INVALID_SOURCE")
        self.assertTrue(b["validation_errors"])

    def test_duplicate_optional_rejected(self):
        b = assemble(fixture(), optional_modules=["memory", "memory"])
        self.assertIn("DUPLICATE_OPTIONAL_MODULE", b["validation_errors"])


if __name__ == "__main__":
    unittest.main()
