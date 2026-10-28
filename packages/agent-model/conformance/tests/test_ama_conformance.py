"""Regression/negative tests for AMA-06. No external API or agent execution."""
import copy
import json
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
from ama_conformance import validate_agent  # noqa: E402


class AMAConformanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        cls.manifest = read(HERE / "fixtures/agent.json")
        cls.bindings = read(HERE / "fixtures/bindings.json")
        cls.schema = read(HERE.parent / "agent-manifest.schema.json")

    def check(self, change=None, link_change=None, previous=None):
        agent = copy.deepcopy(self.manifest)
        links = copy.deepcopy(self.bindings)
        if change:
            change(agent)
        if link_change:
            link_change(links)
        return validate_agent(agent, links, schema=self.schema, previous=previous)

    def assert_code(self, report, code):
        self.assertEqual(report.status, "FAIL", report.data())
        self.assertIn(code, [f.code for f in report.findings], report.data())

    def test_valid_contract_is_only_static_pass(self):
        r = self.check()
        self.assertEqual("STATIC_PASS", r.status, r.data())
        self.assertIn("CDX_RUNTIME_BINDING", r.not_proven)
        self.assertNotIn("C4", r.checked_gates)

    def test_invalid_schema_version(self):
        self.assert_code(self.check(lambda a: a.update(agentVersion="latest")), "SCHEMA")

    def test_evidence_required(self):
        self.assert_code(self.check(lambda a: a["evidence"].update(runRecordRequired=False)), "SCHEMA")

    def test_missing_workflow(self):
        self.assert_code(self.check(lambda a: a["workflows"].append("MISSING")), "UNRESOLVED_WORKFLOW")

    def test_command_version_pin(self):
        self.assert_code(self.check(link_change=lambda b: b["commands"][0].update(workflowVersion="9.0.0")), "WORKFLOW_VERSION_MISMATCH")

    def test_unregistered_tool(self):
        self.assert_code(self.check(link_change=lambda b: b["workflows"][0]["requiredCapabilities"].append("UNREGISTERED_TOOL")), "UNDECLARED_CAPABILITY")

    def test_tool_exceeds_agent(self):
        self.assert_code(self.check(link_change=lambda b: b["capabilities"][0].update(effectClass="E2_REPOSITORY_CHANGE")), "CAPABILITY_EXCEEDS_AGENT")

    def test_workflow_exceeds_agent(self):
        self.assert_code(self.check(link_change=lambda b: b["workflows"][0].update(effectCeiling="E3_EXTERNAL_EFFECT")), "WORKFLOW_EXCEEDS_AGENT")

    def test_false_mandate_requirement_denied(self):
        self.assert_code(self.check(lambda a: a["authority"].update(mandateRefRequired=False)), "AUTHORITY_REFERENCES")

    def test_disabled_module_denied(self):
        self.assert_code(self.check(link_change=lambda b: b["capabilities"][0].update(moduleId="external_connector")), "MODULE_DISABLED")

    def test_duplicate_command_token(self):
        def add(a): a["commands"].append("EXTRA_COMMAND")
        def add_link(b): b["commands"].append({**b["commands"][0], "commandId": "EXTRA_COMMAND"})
        self.assert_code(self.check(add, add_link), "DUPLICATE_TOKEN")

    def test_wrong_owner(self):
        self.assert_code(self.check(link_change=lambda b: b["workflows"][0].update(agentId="OTHER.AGENT")), "OWNER_MISMATCH")

    def test_protected_scope_change_needs_review(self):
        previous = copy.deepcopy(self.manifest)
        self.assert_code(self.check(lambda a: a["mandate"]["scope"].append("external"), previous=previous), "DIRECTOR_REVIEW_REQUIRED")

    def test_changed_same_version_denied(self):
        previous = copy.deepcopy(self.manifest)
        self.assert_code(self.check(lambda a: a.update(name="Altered"), previous=previous), "VERSION_IMMUTABILITY")

    def test_compatible_version_increment(self):
        previous = copy.deepcopy(self.manifest)
        r = self.check(lambda a: a.update(agentVersion="0.1.1", name="Revised label"), previous=previous)
        self.assertEqual("STATIC_PASS", r.status, r.data())

    def test_activation_disallows_inactive_capability(self):
        def activate(a): a["lifecycleState"] = "ACTIVE"
        self.assert_code(self.check(activate), "INACTIVE_BINDING")

    def test_high_effect_never_self_admitted(self):
        self.assert_code(self.check(lambda a: a.update(effectCeiling="E3_EXTERNAL_EFFECT")), "HIGH_EFFECT_REVIEW")

    def test_missing_bindings_fail_closed(self):
        self.assert_code(validate_agent(self.manifest, {}, schema=self.schema), "BINDINGS_SCHEMA")


if __name__ == "__main__":
    unittest.main()
