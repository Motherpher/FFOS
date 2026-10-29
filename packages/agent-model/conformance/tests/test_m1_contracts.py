"""AMA M1: vNext schema composition and adversarial compatibility regression.

All fixtures are synthetic, offline, and non-production. Passing this suite
never verifies policy authorization, runtime effects or human acceptance.
"""
import copy
import json
import sys
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE))
from ama_vnext import digest, registry, validate_bundle, migration_review

AGENT = "SYNTHETIC.AGENT"
FLOW = "SYNTHETIC.FLOW"
CAP = "SYNTHETIC.READ"
CMD = "SYNTHETIC.CMD"
TOOL = "SYNTHETIC.ADAPTER"
V = "0.2.0"


def pin(row, key):
    return {"id": row[key], "version": row["version"], "digest": digest(row)}


def fixture():
    io = {"type": "object", "additionalProperties": False,
          "properties": {"value": {"type": "string"}}}
    adapter = {"schema": "ama.tool-adapter/v0.2-candidate",
               "adapterId": TOOL, "version": V, "status": "VALIDATED",
               "invocationKind": "IN_PROCESS", "supportedEffects": ["E0_OBSERVE"],
               "credentialBindingRequired": False, "inputSchema": io, "outputSchema": io}
    cap = {"schema": "ama.capability/v0.2-candidate",
           "agentId": AGENT, "capabilityId": CAP, "version": V, "status": "VALIDATED",
           "effectClass": "E0_OBSERVE", "resourceScopes": ["synthetic/item"],
           "adapterRef": pin(adapter, "adapterId"), "permissionRefs": [],
           "inputSchema": io, "outputSchema": io}
    cref = pin(cap, "capabilityId")
    wf = {"schema": "ama.workflow/v0.2-candidate",
          "agentId": AGENT, "workflowId": FLOW, "version": V, "status": "VALIDATED",
          "effectCeiling": "E0_OBSERVE", "requiredCapabilities": [cref],
          "entryStep": "SYNTHETIC.START", "steps": [
              {"stepId": "SYNTHETIC.START", "kind": "ACTION", "dependsOn": [],
               "capabilityRef": cref},
              {"stepId": "SYNTHETIC.END", "kind": "END",
               "dependsOn": ["SYNTHETIC.START"]}],
          "terminalStepIds": ["SYNTHETIC.END"],
          "inputSchema": io, "outputSchema": io}
    cmd = {"schema": "ama.command/v0.2-candidate",
           "agentId": AGENT, "commandId": CMD, "version": V,
           "token": "SYNTHETIC-STATUS", "workflowRef": pin(wf, "workflowId"),
           "inputSchema": io}
    agent = {"schema": "ama.agent/v0.2-candidate",
             "agentId": AGENT, "agentVersion": V, "amaVersion": V,
             "name": "Anonymous synthetic conformance fixture",
             "purpose": "Validate the generic contract with non-sensitive dummy input",
             "mandate": {"scope": ["synthetic"], "nonGoals": ["No external side effects"]},
             "authority": {"governingPrincipalRef": "EXTERNAL_REVIEWER",
                           "mandateRequired": True, "selfApprovalProhibited": True,
                           "approvalMode": "INDEPENDENT"},
             "runtimeClass": "REQUEST_RESPONSE", "lifecycleState": "VALIDATED",
             "effectCeiling": "E0_OBSERVE", "workflowRefs": [pin(wf, "workflowId")],
             "commandRefs": [pin(cmd, "commandId")],
             "capabilityRefs": [cref],
             "modules": [{"moduleId": "SYNTHETIC.MEMORY", "version": V,
                          "kind": "MEMORY", "enabled": False}]}
    return {"schema": "ama.bundle/v0.2-candidate", "agent": agent,
            "workflows": [wf], "commands": [cmd], "capabilities": [cap],
            "toolAdapters": [adapter], "profiles": []}


def repin(bundle):
    """Regenerate all downstream references after modifying a definition."""
    b = bundle
    c = b["capabilities"][0]
    c["adapterRef"] = pin(b["toolAdapters"][0], "adapterId")
    w = b["workflows"][0]
    ref = pin(c, "capabilityId")
    w["requiredCapabilities"] = [ref]
    for step in w["steps"]:
        if step["kind"] == "ACTION" and "capabilityRef" in step:
            step["capabilityRef"] = ref
    b["commands"][0]["workflowRef"] = pin(w, "workflowId")
    a = b["agent"]
    a["workflowRefs"] = [pin(w, "workflowId")]
    a["commandRefs"] = [pin(b["commands"][0], "commandId")]
    a["capabilityRefs"] = [ref]
    return b


class M1Contracts(unittest.TestCase):
    def assert_invalid(self, b, code):
        errors = validate_bundle(b)
        self.assertTrue(any(e == code or e.startswith(code + ":") for e in errors), errors)

    def test_schemas_are_valid_and_registered(self):
        reg, sources = registry()
        self.assertEqual(10, len(sources))
        for schema in sources.values():
            Draft202012Validator.check_schema(schema)
            self.assertIn("v0.2", schema["$id"])

    def test_synthetic_minimal_bundle_passes(self):
        self.assertEqual([], validate_bundle(fixture()))

    def test_absent_optional_memory_is_valid(self):
        b = fixture()
        b["agent"]["modules"] = []
        self.assertEqual([], validate_bundle(b))

    def test_unsupported_payload_extension_denied(self):
        b = fixture()
        b["agent"]["extraAuthorizer"] = "model"
        self.assert_invalid(b, "SCHEMA")

    def test_mutated_definition_with_old_digest_fails(self):
        b = fixture()
        b["workflows"][0]["outputSchema"]["title"] = "Different"
        self.assert_invalid(b, "DIGEST_MISMATCH")

    def test_unregistered_workflow_denied(self):
        b = fixture()
        b["agent"]["workflowRefs"][0]["id"] = "SYNTHETIC.UNREGISTERED"
        self.assert_invalid(b, "REFERENCE_COVERAGE_MISMATCH")

    def test_stale_version_denied(self):
        b = fixture()
        b["commands"][0]["workflowRef"]["version"] = "9.9.9"
        self.assert_invalid(b, "VERSION_MISMATCH")

    def test_orphan_tool_adapter_denied(self):
        b = fixture()
        dup = copy.deepcopy(b["toolAdapters"][0])
        dup["adapterId"] = "SYNTHETIC.EXTRA"
        b["toolAdapters"].append(dup)
        self.assert_invalid(b, "ORPHAN_ADAPTER")

    def test_cross_agent_owner_denied(self):
        b = fixture()
        b["capabilities"][0]["agentId"] = "SYNTHETIC.OTHER"
        self.assert_invalid(repin(b), "OWNER_MISMATCH")

    def test_capability_outside_mandate_denied(self):
        b = fixture()
        b["capabilities"][0]["resourceScopes"] = ["synthetic-other"]
        self.assert_invalid(repin(b), "CAPABILITY_OUTSIDE_MANDATE")

    def test_capability_higher_effect_denied(self):
        b = fixture()
        b["capabilities"][0]["effectClass"] = "E3_EXTERNAL_EFFECT"
        self.assert_invalid(repin(b), "CAPABILITY_EXCEEDS_AGENT")

    def test_adapter_effect_mismatch_denied(self):
        b = fixture()
        b["toolAdapters"][0]["supportedEffects"] = ["E1_INTERNAL_STATE"]
        self.assert_invalid(repin(b), "ADAPTER_EFFECT_MISMATCH")

    def test_disabled_module_reference_denied(self):
        b = fixture()
        b["capabilities"][0]["moduleId"] = "SYNTHETIC.MEMORY"
        self.assert_invalid(repin(b), "MODULE_DISABLED")

    def test_workflow_cycle_denied(self):
        b = fixture()
        b["workflows"][0]["steps"][0]["dependsOn"] = ["SYNTHETIC.END"]
        self.assert_invalid(repin(b), "CYCLIC_WORKFLOW")

    def test_unreachable_step_denied(self):
        b = fixture()
        b["workflows"][0]["steps"].append(
            {"stepId": "SYNTHETIC.EXTRA", "kind": "END", "dependsOn": []})
        self.assert_invalid(repin(b), "UNREACHABLE_STEP")

    def test_nonterminal_deadend_denied(self):
        b = fixture()
        b["workflows"][0]["steps"].append(
            {"stepId": "SYNTHETIC.EXTRA", "kind": "CHECK",
             "dependsOn": ["SYNTHETIC.START"]})
        self.assert_invalid(repin(b), "DEAD_END_STEP")

    def test_required_capability_unresolved_denied(self):
        b = fixture()
        b["workflows"][0]["steps"][0]["capabilityRef"]["id"] = "SYNTHETIC.UNKNOWN"
        self.assert_invalid(b, "STEP_CAPABILITY_UNDECLARED")

    def test_active_agent_disallows_unready_bindings(self):
        b = fixture()
        b["agent"]["lifecycleState"] = "ACTIVE"
        self.assert_invalid(b, "INACTIVE_BINDING")

    def test_missing_required_authority_contract_denied(self):
        b = fixture()
        b["agent"]["authority"]["selfApprovalProhibited"] = False
        self.assert_invalid(b, "SCHEMA")

    def test_invalid_io_schema_denied(self):
        b = fixture()
        b["toolAdapters"][0]["inputSchema"] = {"type": "alien"}
        self.assert_invalid(repin(b), "INVALID_IO_SCHEMA")

    def test_migration_never_automatically_activates(self):
        b = fixture()
        old = {"agentId": AGENT, "effectCeiling": "E0_OBSERVE",
               "mandate": {"scope": ["synthetic"]},
               "runtimeClass": "REQUEST_RESPONSE",
               "workflows": [FLOW], "capabilities": [CAP]}
        assessment = migration_review(old, b)
        self.assertEqual("MIGRATION_REVIEW_REQUIRED", assessment["status"])
        self.assertFalse(assessment["automatic_activation"])
        self.assertEqual(1, len(assessment["reasons"]))
        old["effectCeiling"] = "E2_REPOSITORY_CHANGE"
        self.assertIn("EFFECT_CEILING_CHANGED", migration_review(old, b)["reasons"])

    def test_v1_manifest_stays_distinct(self):
        old = json.loads((HERE / "fixtures" / "agent.json").read_text())
        self.assertEqual("ffos.ama.agent-manifest/v1", old["schema"])
        self.assert_invalid(old, "SCHEMA")


if __name__ == "__main__":
    unittest.main()
