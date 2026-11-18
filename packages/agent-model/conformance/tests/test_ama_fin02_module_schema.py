"""FIN-02 normative candidate JSON Schema coverage for all 32 module controls."""
import copy,json,sys,unittest
from pathlib import Path
from jsonschema import Draft202012Validator
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/"packages/agent-model/conformance/tests"))
from test_ama_fin02_semantic_modules import fixture, activate
SCHEMA_PATH=ROOT/"packages/agent-model/schemas/v0.2/fin02-module-controls.schema.json"

class ModuleContractSchemaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema=json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(cls.schema)
        cls.validator=Draft202012Validator(cls.schema)
    def deny(self,config):
        self.assertTrue(list(self.validator.iter_errors(config)))
    def test_default_32_configuration_schema_valid(self):
        _,config=fixture()
        self.assertEqual(list(self.validator.iter_errors(config)),[])
    def test_all_optional_active_with_explicit_approval_schema_valid(self):
        _,config=fixture()
        for name in ("memory","eventing","localization"):
            activate(config,name)
        self.assertEqual(list(self.validator.iter_errors(config)),[])
    def test_core_disabled_rejected(self):
        _,config=fixture()
        config["modules"][0]["enabled"]=False
        self.deny(config)
    def test_missing_core_specific_contract_denied(self):
        _,config=fixture()
        config["modules"][0]["controls"].pop("definition_id")
        self.deny(config)
    def test_optional_enabled_without_approval_denied(self):
        _,config=fixture()
        row=activate(config,"retrieval")
        row.pop("approval_ref")
        self.deny(config)
    def test_malformed_version_denied(self):
        _,config=fixture()
        config["modules"][0]["version"]="latest"
        self.deny(config)
    def test_schema_does_not_claim_live_authority(self):
        self.assertIn("not a runtime authorization",self.schema["description"])
        self.assertNotIn("activationAuthorized",self.schema["properties"])


    def test_duplicate_module_substituting_another_id_denied(self):
        _,config=fixture()
        config["modules"][1]=copy.deepcopy(config["modules"][0])
        self.deny(config)

    def test_duplicate_optional_module_substitution_denied(self):
        _,config=fixture()
        config["modules"][-2]=copy.deepcopy(config["modules"][-1])
        self.deny(config)

    def test_optional_claimed_approval_false_denied(self):
        _,config=fixture()
        row=activate(config,"localization")
        row["approval_attested"]=False
        self.deny(config)

if __name__=="__main__":unittest.main()
