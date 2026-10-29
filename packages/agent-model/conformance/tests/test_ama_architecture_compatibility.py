"""Portable architecture compatibility report regressions."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(HERE))
from ama_architecture_compatibility import build_report


class CompatibilityTests(unittest.TestCase):
    def test_real_candidate_not_an_agent_release(self):
        report=build_report()
        self.assertEqual(report["report_status"],"STATIC_COMPATIBILITY_PASS_CANDIDATE")
        self.assertGreater(report["candidate_schema_count"],0)
        for flag in ("independent_accepted","agent_activation_authorized",
                     "deployment_authorized","publication_authorized"):
            self.assertIs(report[flag],False)

    def test_missing_v1_fails_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            (root/"architecture-boundary.json").write_text((HERE.parent/"architecture-boundary.json").read_text())
            report=build_report(root)
            self.assertEqual(report["report_status"],"FAIL")
            self.assertIn("MISSING_LEGACY_V1_SCHEMA",report["violations"])

    def test_duplicate_schema_ids_fail_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            (root/"architecture-boundary.json").write_text((HERE.parent/"architecture-boundary.json").read_text())
            legacy={"$id":"https://ffos.local/schemas/ama-agent-manifest-v1.json"}
            (root/"agent-manifest.schema.json").write_text(json.dumps(legacy))
            path=root/"schemas"/"v0.2"
            path.mkdir(parents=True)
            obj={"$schema":"https://json-schema.org/draft/2020-12/schema",
                 "$id":"https://ama.example/contracts/v0.2/test"}
            for name in ("one","two"):
                (path/f"{name}.schema.json").write_text(json.dumps(obj))
            report=build_report(root)
            self.assertEqual(report["report_status"],"FAIL")
            self.assertTrue(any(v.startswith("DUPLICATE_SCHEMA_ID") for v in report["violations"]))

    def test_host_binding_in_architecture_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            obj=json.loads((HERE.parent/"architecture-boundary.json").read_text())
            obj["default_governing_authority"]="HOST_SPECIFIC"
            (root/"architecture-boundary.json").write_text(json.dumps(obj))
            report=build_report(root)
            self.assertEqual(report["report_status"],"FAIL")
            self.assertIn("HOST_OR_AGENT_HARDCODED:default_governing_authority",report["violations"])


if __name__=="__main__":
    unittest.main()
