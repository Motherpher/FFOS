"""FIN-01 source alignment check; never signs requirements or certifies CI."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
def read(p):
    return json.loads((ROOT / p).read_text(encoding="utf-8"))

class Fin01DispositionIntegrity(unittest.TestCase):
    def test_every_source_requirement_is_triaged_without_promotion(self):
        baseline=read("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json")
        bridge=read("packages/agent-model/ama-m0-test-evidence-bridge.json")
        report=read("docs/roadmap/AMA-FIN-01-REQUIREMENT-DISPOSITIONS.json")
        actual={x["id"]:x for x in report["requirements"]}
        referenced={x["requirement_id"]:x for x in bridge["entries"]}
        self.assertEqual(len(actual),96)
        self.assertEqual(set(actual),{x["id"] for x in baseline["items"]})
        self.assertEqual(len(referenced),68)
        self.assertEqual(report["summary"]["unlinked"],28)
        self.assertEqual(report["summary"]["owner_adopted"],0)
        self.assertEqual(report["summary"]["requirements_verified_complete"],0)
        for item in baseline["items"]:
            row=actual[item["id"]]
            self.assertEqual(row["statement"],item["statement"])
            self.assertEqual(row["original_proposed_disposition"],item["disposition"])
            self.assertEqual(row["source_path"],item["source_path"])
            self.assertEqual(row["normative_target"],item["normative_target"])
            self.assertEqual(row["decision_status"],"PROPOSED_PENDING_DIRECTOR_ADOPTION")
            self.assertEqual(row["fin01_acceptance"],"PENDING_SOURCE_AND_TEST_VALIDATION")
            if item["id"] in referenced:
                self.assertEqual(row["evidence_status"],"PARTIAL_TEST_FUNCTION_REFERENCE_ONLY")
                self.assertEqual(row["test_file"],referenced[item["id"]]["test_file"])
                self.assertEqual(row["test_functions"],referenced[item["id"]]["test_functions"])
            else:
                self.assertEqual(row["evidence_status"],"NO_DIRECT_TEST_REFERENCE")
                self.assertEqual(row["test_functions"],[])
        self.assertNotIn("PASS",report["state"])

if __name__=="__main__":
    unittest.main()
