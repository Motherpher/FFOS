"""Portable construction must never silently enable optional or partial modules."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/"packages/agent-model/conformance"))
from ama_module_configuration import default_config,validate

class ModuleConstructionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inventory=json.loads((ROOT/"packages/agent-model/ama-template-coverage.json").read_text())

    def test_default_is_fail_closed_while_source_partial(self):
        config=default_config(self.inventory)
        self.assertEqual(len(config["modules"]),32)
        self.assertEqual(sum(x["enabled"] for x in config["modules"]),13)
        report=validate(config,self.inventory)
        self.assertEqual(report["status"],"HOLD")
        self.assertFalse(report["activation_authorized"])
        self.assertIn("ENABLED_MODULE_CONTRACT_NOT_COMPLETE:identity",report["errors"])

    def test_unknown_or_missing_module_is_rejected(self):
        config=default_config(self.inventory)
        config["modules"].pop()
        self.assertIn("MODULE_INVENTORY_MUST_BE_EXACT",validate(config,self.inventory)["errors"])

    def test_optional_activation_requires_explicit_approval(self):
        config=default_config(self.inventory)
        row=next(x for x in config["modules"] if x["id"]=="memory")
        row["enabled"]=True
        self.assertIn("OPTIONAL_ACTIVATION_WITHOUT_APPROVAL:memory",validate(config,self.inventory)["errors"])

    def test_core_cannot_be_disabled(self):
        config=default_config(self.inventory)
        config["modules"][0]["enabled"]=False
        self.assertIn("CORE_MODULE_DISABLED:identity",validate(config,self.inventory)["errors"])

    def test_validated_complete_fixture_does_not_authorize_runtime(self):
        inventory=copy.deepcopy(self.inventory)
        for row in inventory["modules"]:
            row["implementation_status"]="COMPLETE"
        report=validate(default_config(inventory),inventory)
        self.assertEqual(report["status"],"CONFIGURATION_VALID_ONLY")
        self.assertFalse(report["activation_authorized"])
        self.assertFalse(report["host_verified"])

    def test_host_obligations_must_be_declared(self):
        inventory=copy.deepcopy(self.inventory)
        for row in inventory["modules"]:
            row["implementation_status"]="COMPLETE"
        config=default_config(inventory)
        row=next(x for x in config["modules"] if x["id"]=="secrets")
        row.update(enabled=True,config_version="1.0.0",approval_ref="synthetic:approval",host_obligations=[])
        self.assertIn("UNDECLARED_HOST_OBLIGATIONS:secrets",validate(config,inventory)["errors"])

if __name__=="__main__":
    unittest.main()
