"""FIN-02 schema/semantic source-drift regression tests."""
import copy,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_fin02_schema_consistency import audit

class SchemaConsistencyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema=json.loads((ROOT/"packages/agent-model/schemas/v0.2/fin02-module-controls.schema.json").read_text())
        cls.inventory=json.loads((ROOT/"packages/agent-model/ama-template-coverage.json").read_text())
    def test_all_32_contract_source_mappings_are_consistent(self):
        result=audit(self.schema,self.inventory)
        self.assertEqual(result["module_count"],32)
        self.assertEqual(result["status"],"SOURCE_VALID")
        self.assertEqual(result["findings"],[])
        self.assertEqual(result["modules_accepted"],0)
    def test_missing_schema_module_denied(self):
        schema=copy.deepcopy(self.schema)
        schema["properties"]["modules"]["items"]["oneOf"].pop()
        self.assertIn("NONCANONICAL_32_MODULE_SCHEMA",audit(schema,self.inventory)["findings"])
    def test_lost_core_semantic_rule_denied(self):
        schema=copy.deepcopy(self.schema)
        branch=next(x for x in schema["properties"]["modules"]["items"]["oneOf"] if x["properties"]["id"]["const"]=="identity")
        branch["properties"]["controls"]["required"].remove("definition_id")
        self.assertIn("CONTROL_FIELD_DRIFT:identity",audit(schema,self.inventory)["findings"])
    def test_optional_unapproved_enable_denied(self):
        schema=copy.deepcopy(self.schema)
        branch=next(x for x in schema["properties"]["modules"]["items"]["oneOf"] if x["properties"]["id"]["const"]=="memory")
        branch["allOf"][0]["then"]["required"].remove("approval_ref")
        self.assertIn("OPTIONAL_APPROVAL_NOT_REQUIRED:memory",audit(schema,self.inventory)["findings"])
    def test_core_off_drift_denied(self):
        schema=copy.deepcopy(self.schema)
        branch=next(x for x in schema["properties"]["modules"]["items"]["oneOf"] if x["properties"]["id"]["const"]=="mandate")
        branch["properties"]["enabled"]["const"]=False
        self.assertIn("CORE_NOT_DEFAULT_ON:mandate",audit(schema,self.inventory)["findings"])


    def test_duplicate_cardinality_rule_denied(self):
        schema=copy.deepcopy(self.schema)
        rules=schema["properties"]["modules"]["allOf"]
        rules[0]=copy.deepcopy(rules[1])
        self.assertIn("MODULE_CARDINALITY_INCOMPLETE",audit(schema,self.inventory)["findings"])

    def test_cardinality_max_missing_denied(self):
        schema=copy.deepcopy(self.schema)
        schema["properties"]["modules"]["allOf"][0].pop("maxContains")
        self.assertIn("INVALID_MODULE_CARDINALITY:identity",audit(schema,self.inventory)["findings"])

if __name__=="__main__":unittest.main()
