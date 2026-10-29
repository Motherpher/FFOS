"""M0 requirement evidence links are source-backed but never self-certifying."""
import copy,json,sys,unittest
from pathlib import Path
HERE=Path(__file__).resolve().parents[1]
ROOT=HERE.parents[2]
sys.path.insert(0,str(HERE))
from ama_requirement_evidence import inspect,load


def fixture():
    def read(path):
        return json.loads((ROOT/path).read_text(encoding="utf-8"))
    return (read("packages/agent-model/ama-m0-test-evidence-bridge.json"),
            read("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json"))


class RequirementEvidenceTests(unittest.TestCase):
    def test_current_bridge_is_valid_but_incomplete(self):
        r=load()
        self.assertEqual(r["findings"],[],r)
        self.assertEqual(r["original_requirement_count"],96)
        self.assertEqual(r["partial_evidence_link_count"],11)
        self.assertEqual(r["missing_direct_link_count"],85)
        self.assertEqual(r["fully_accepted_requirement_count"],0)

    def test_missing_test_function_fails(self):
        b,reg=fixture()
        b["entries"][0]["test_functions"]=["test_nonexistent"]
        r=inspect(b,reg)
        self.assertTrue(any(x.startswith("MISSING_TEST_METHOD") for x in r["findings"]))

    def test_duplicate_requirement_link_fails(self):
        b,reg=fixture()
        b["entries"].append(copy.deepcopy(b["entries"][0]))
        r=inspect(b,reg)
        self.assertTrue(any(x.startswith("DUPLICATE_REQUIREMENT_LINK") for x in r["findings"]))

    def test_fabricated_full_acceptance_fails(self):
        b,reg=fixture()
        b["entries"][0]["relation"]="COMPLETE_AND_DEPLOYABLE"
        self.assertTrue(any(x.startswith("FALSE_COMPLETENESS_CLAIM")
                            for x in inspect(b,reg)["findings"]))

    def test_unknown_requirement_fails(self):
        b,reg=fixture()
        b["entries"][0]["requirement_id"]="FAKE"
        self.assertTrue(any(x.startswith("UNKNOWN_REQUIREMENT_LINK")
                            for x in inspect(b,reg)["findings"]))


if __name__=="__main__":
    unittest.main()
