"""Adversarial FIN-01 source provenance tests (no acceptance authority)."""
import copy
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/"packages/agent-model/conformance"))
from ama_fin01_harp_source_audit import load,inspect,REGISTER,BRIDGE,DOSSIER,TRIAGE

def sources():
    read=lambda p: json.loads((ROOT/p).read_text(encoding="utf-8"))
    return read(REGISTER),read(BRIDGE),(ROOT/DOSSIER).read_text(encoding="utf-8"),read(TRIAGE)

class Fin01HarpTests(unittest.TestCase):
    def test_exact_96_source_lines_and_31_gaps(self):
        report=load()
        self.assertEqual(report["source_requirement_count"],96)
        self.assertEqual(report["source_lines_exact"],96)
        self.assertEqual(report["direct_link_gaps"],26)
        self.assertEqual(report["partial_test_references"],70)
        self.assertEqual(report["structural_result"],"SOURCE_TRACEABILITY_PASS")
        self.assertEqual(report["requirements_accepted"],0)
        self.assertFalse(report["test_assertions_executed"])

    def test_source_mutation_fail_closed(self):
        a,b,c,d=sources()
        c=c.replace("- A01 Formal glossary","- A01 Altered glossary",1)
        result=inspect(a,b,c,d)
        self.assertIn("SOURCE_STATEMENT_DRIFT:A01",result["findings"])

    def test_false_director_acceptance_fail_closed(self):
        a,b,c,d=sources()
        d["requirements"][0]["decision_status"]="DIRECTOR_ADOPTED"
        result=inspect(a,b,c,d)
        self.assertIn("UNSUPPORTED_ACCEPTANCE_CLAIM:A01",result["findings"])

    def test_gap_without_test_plan_fail_closed(self):
        a,b,c,d=sources()
        next(x for x in a["items"] if x["id"]=="F02")["test_plan"]=""
        result=inspect(a,b,c,d)
        self.assertIn("UNLINKED_WITHOUT_TEST_PLAN:F02",result["findings"])

    def test_unknown_test_link_fail_closed(self):
        a,b,c,d=sources()
        b["entries"].append({"requirement_id":"NOT_REAL"})
        result=inspect(a,b,c,d)
        self.assertIn("UNKNOWN_TEST_LINK",result["findings"])

if __name__=="__main__":
    unittest.main()
