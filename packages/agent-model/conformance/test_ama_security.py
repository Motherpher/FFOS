"""AMA security regression suite: synthetic fixtures, no fleet agent or live effect.

Run: python -m unittest discover -s packages/agent-model/conformance -p 'test_ama_security.py'
Requires jsonschema. STATIC_PASS is not operational acceptance.
"""
import copy
import json
import unittest
from pathlib import Path

from ama_conformance import validate_agent

SCHEMA_PATH = Path(__file__).resolve().parents[1] / "agent-manifest.schema.json"
SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def fixture():
    manifest = {
        "schema": "ffos.ama.agent-manifest/v1",
        "agentId": "TEST-AGENT-001",
        "name": "Synthetic agent",
        "agentVersion": "0.1.0",
        "amaVersion": "0.1.0",
        "purpose": "Offline synthetic conformance tests",
        "mandate": {"scope": ["synthetic-resource"], "nonGoals": ["external effects"]},
        "runtimeClass": "REQUEST_RESPONSE",
        "lifecycleState": "DRAFT",
        "authority": {
            "governingAuthority": "TEST_HUMAN",
            "authorityRefRequired": True,
            "mandateRefRequired": True,
            "selfApprovalProhibited": True,
        },
        "effectCeiling": "E1_INTERNAL_STATE",
        "workflows": ["test-flow"],
        "commands": ["test-command"],
        "capabilities": ["test-capability"],
        "statePolicy": {"durableState": False, "memoryMode": "RUN"},
        "evidence": {"runRecordRequired": True, "failedRunRecordRequired": True},
        "conformance": {
            "profile": "test",
            "regressionRequired": True,
            "authorityDenialTestsRequired": True,
        },
    }
    bindings = {
        "schema": "ffos.ama.bindings/v1",
        "workflows": [{
            "workflowId": "test-flow", "version": "1.0.0", "agentId": manifest["agentId"],
            "purpose": "Synthetic", "requiredCapabilities": ["test-capability"],
            "effectCeiling": "E1_INTERNAL_STATE", "authorityRequirements": ["human"],
            "verification": ["independent"], "evidenceRequirements": ["run"],
            "terminalStates": ["PASS", "FAIL"], "status": "DRAFT",
        }],
        "commands": [{
            "commandId": "test-command", "token": "test:run", "agentId": manifest["agentId"],
            "workflowId": "test-flow", "workflowVersion": "1.0.0",
            "activationModes": ["manual"], "status": "DRAFT",
        }],
        "capabilities": [{
            "capabilityId": "test-capability", "agentId": manifest["agentId"],
            "effectClass": "E1_INTERNAL_STATE", "status": "DRAFT",
        }],
    }
    return manifest, bindings


class AMASecurityRegressions(unittest.TestCase):
    def check(self, mutate=None, previous=None):
        manifest, bindings = fixture()
        if mutate:
            mutate(manifest, bindings)
        return validate_agent(manifest, bindings, schema=SCHEMA, previous=previous)

    def assert_code(self, report, code):
        self.assertEqual(report.status, "FAIL", report.data())
        self.assertIn(code, [f.code for f in report.findings])

    def test_clean_fixture_is_static_only(self):
        report = self.check()
        self.assertEqual(report.status, "STATIC_PASS", report.data())
        self.assertEqual(report.assurance, "STATIC_CONTRACT_ONLY")
        self.assertIn("DIRECTOR_ACTIVATION", report.not_proven)

    def test_authority_reference_cannot_be_optional(self):
        self.assert_code(self.check(lambda m, b: m["authority"].update(authorityRefRequired=False)),
                         "AUTHORITY_REFERENCES")

    def test_self_approval_is_forbidden(self):
        self.assert_code(self.check(lambda m, b: m["authority"].update(selfApprovalProhibited=False)),
                         "SCHEMA")

    def test_capability_cannot_exceed_agent(self):
        self.assert_code(self.check(lambda m, b: b["capabilities"][0].update(effectClass="E3_EXTERNAL_EFFECT")),
                         "CAPABILITY_EXCEEDS_AGENT")

    def test_command_version_must_be_pinned(self):
        self.assert_code(self.check(lambda m, b: b["commands"][0].update(workflowVersion="9.9.9")),
                         "WORKFLOW_VERSION_MISMATCH")

    def test_unregistered_capability_is_rejected(self):
        self.assert_code(self.check(lambda m, b: b["workflows"][0].update(requiredCapabilities=["undeclared"])),
                         "UNDECLARED_CAPABILITY")

    def test_disabled_module_blocks_capability(self):
        self.assert_code(self.check(lambda m, b: b["capabilities"][0].update(moduleId="uninstalled")),
                         "MODULE_DISABLED")

    def test_active_agent_cannot_bind_draft_capability(self):
        self.assert_code(self.check(lambda m, b: m.update(lifecycleState="ACTIVE")),
                         "INACTIVE_BINDING")

    def test_scope_change_requires_review(self):
        baseline, _ = fixture()
        self.assert_code(self.check(lambda m, b: m["mandate"]["scope"].append("new-resource"),
                                    previous=copy.deepcopy(baseline)), "DIRECTOR_REVIEW_REQUIRED")

    def test_changed_version_content_requires_increment(self):
        baseline, _ = fixture()
        self.assert_code(self.check(lambda m, b: m.update(purpose="Changed"),
                                    previous=copy.deepcopy(baseline)), "VERSION_IMMUTABILITY")

    def test_duplicate_command_tokens_denied(self):
        def mutate(m, b):
            m["commands"].append("second-command")
            b["commands"].append(dict(b["commands"][0], commandId="second-command"))
        self.assert_code(self.check(mutate), "DUPLICATE_TOKEN")


if __name__ == "__main__":
    unittest.main()
