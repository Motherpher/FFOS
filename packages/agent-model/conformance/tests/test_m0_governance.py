"""M0 evidence-to-requirement integrity tests. No external network or deployed CDX required."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

class M0AdmissionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index = load("docs/research/AMA-96-REQUIREMENT-COVERAGE-INDEX-2026-10-29.json")
        cls.decision = load("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json")
        cls.trace = load("docs/research/AMA-REQUIREMENT-TRACEABILITY.json")
        cls.crosswalk = load("docs/research/AMA-F8-SECURITY-CROSSWALK.json")
        cls.snapshot = load("docs/research/AMA-F8-CDX-SOURCE-SNAPSHOT-2026-10-29.json")
        cls.source_lines = (ROOT / "docs/research/AMA-SOURCE-ROUND-GRANULAR-REQUIREMENTS-2026-10-29.md").read_text().splitlines()

    def test_exact_candidate_set(self):
        canonical = [r["id"] for r in self.index["requirements"]]
        self.assertEqual(len(canonical), 96)
        self.assertEqual(len(canonical), len(set(canonical)))
        for data in (self.decision["items"], self.trace["requirements"], self.crosswalk["requirements"]):
            ids = [x["id"] for x in data]
            self.assertEqual(len(ids), 96)
            self.assertEqual(len(ids), len(set(ids)))
            self.assertEqual(set(ids), set(canonical))

    def test_complete_and_pending_decisions(self):
        accepted = {"ADOPT_CORE", "ADOPT_CONDITIONAL", "ADOPT_OPTIONAL", "HOST_BOUND",
                    "DEFER", "REJECT", "SOURCE_REVIEW_REQUIRED"}
        for row in self.decision["items"]:
            with self.subTest(id=row["id"]):
                self.assertIn(row["disposition"], accepted)
                self.assertIn("PROPOSED_PENDING", row["decision"])
                for f in ("rationale", "owner", "normative_target", "test_id",
                          "test_plan", "compatibility", "source_path"):
                    self.assertTrue(row[f], f"{row['id']} has empty {f}")
                self.assertEqual(row["test_status"], "NOT_IMPLEMENTED")
                self.assertGreater(len(row["rationale"]), 70)
                self.assertIn(row["id"], row["test_id"])
                self.assertTrue(row["normative_target"].startswith("packages/agent-model/"))
        count = {k: sum(x["disposition"] == k for x in self.decision["items"])
                 for k in self.decision["counts"]}
        self.assertEqual(self.decision["counts"], count)
        self.assertIn("F08", self.decision["rule"])

        self.assertEqual(96, len({r["test_plan"] for r in self.decision["items"]}))
        for row in self.decision["items"]:
            self.assertEqual(row.get("test_state"), "PLAN_ONLY_NOT_EXECUTED")
            self.assertTrue(row.get("expected_outcome"))

    def test_source_claims_are_grounded_and_provisional(self):
        for row in self.trace["requirements"]:
            with self.subTest(id=row["id"]):
                claim = row["claim"]
                self.assertEqual(
                    self.source_lines[claim["line"] - 1], claim["text"])
                self.assertTrue(claim["text"].lstrip().startswith("- " + row["id"] + " "))
                self.assertEqual(claim["claim_type"], "ANALYST_SYNTHESIS_NOT_VERBATIM_STUDY_FINDING")
                self.assertTrue(row["candidate_bibliography"])
                for cite in row["candidate_bibliography"]:
                    self.assertEqual(cite["claim_support"], "NOT_INDIVIDUALLY_VERIFIED")
                self.assertNotEqual(row["evidence_status"], "VERIFIED")

    def test_cdx_crosswalk_only_canonical_controls(self):
        catalog = {c["id"]: c for c in self.snapshot["control_ids"]}
        sections = {s["section_id"]: s for s in self.snapshot["section_bindings"]}
        self.assertEqual(len(catalog), 69)
        self.assertEqual(len(sections), 131)
        self.assertEqual(self.crosswalk["cdx"]["control_registry_sha"],
                         self.snapshot["control_registry_blob_sha"])
        self.assertEqual(self.crosswalk["cdx"]["law_bindings_sha"],
                         self.snapshot["law_binding_blob_sha"])
        for row in self.crosswalk["requirements"]:
            with self.subTest(id=row["id"]):
                self.assertIn(row["status"], {"UNMAPPED",
                    "EXACT_ID_CANDIDATE_MAPPING_SEMANTICS_NOT_VERIFIED"})
                self.assertEqual(row["host_binding"], "NOT_CONNECTED")
                self.assertEqual(row["spetl_receipt"], "NOT_VERIFIED")
                self.assertEqual(row["run_time_effect"], "NOT_VERIFIED")
                for c in row["control_candidates"]:
                    self.assertIn(c["control_id"], catalog)
                    self.assertIn(c["law_section_id"], sections)
                    self.assertEqual(c["law_section_id"],
                                     catalog[c["control_id"]]["section_id"])
                    section = sections[c["law_section_id"]]
                    self.assertIn(c["control_id"], section["controls"])
                    self.assertEqual(c["audit_ids"], section["audits"])
                    self.assertEqual(c["mapping_quality"],
                                     "SEMANTIC_CANDIDATE_NOT_APPROVED")
                    self.assertFalse(c["runtime_enforced"])
        mapped = sum(bool(x["control_candidates"]) for x in self.crosswalk["requirements"])
        self.assertEqual(mapped, self.crosswalk["summary"]["control_candidate_rows"])

    def test_release_states_are_not_falsely_promoted(self):
        gates = (ROOT / "docs/roadmap/AMA-RELEASE-GATES.md").read_text()
        for name in ("SPECIFIED", "SCHEMA_VALID", "STATIC_TESTED",
                     "INTEGRATION_TESTED", "RUNTIME_BOUND", "INDEPENDENTLY_ACCEPTED"):
            self.assertIn(name, gates)
        self.assertEqual(self.decision["state"], "PROPOSED_DISPOSITIONS_NOT_NORMATIVE_ADOPTION")
        self.assertEqual(self.crosswalk["cdx"]["enforcement"], "BOOTSTRAP")
        self.assertEqual(self.crosswalk["cdx"]["estate_integration"], "PENDING_RUNTIME_BINDINGS")
        master = (ROOT / "agent-stable/ama/ARCHITECTURE-v0.2-CANDIDATE.md").read_text()
        self.assertFalse(any(n in master.lower() for n in ("conductellence", "household", "janitor")))

if __name__ == "__main__":
    unittest.main()
