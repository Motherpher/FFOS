"""Offline end-to-end Kolada reporter → CSV contract tests."""
import csv
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

p=Path(__file__).resolve().parent/"export_kolada_municipality.py"
spec=importlib.util.spec_from_file_location("kolada_export",p)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def sample(status=200, municipality_id="0380", title="Uppsala", count=1, records=1):
    return [{"results":[{"response":{"status":status,"data":{
       "values":[{"id":municipality_id,"title":title,"type":"K",
                  "ignored_secret":"DO-NOT-EXPORT"} for _ in range(records)],
       "count":count}}}]}]

class ExportTests(unittest.TestCase):
    def test_extract_exact_municipality(self):
        record=m.extract(sample())
        self.assertEqual(record["municipality_id"],"0380")
        self.assertEqual(record["municipality_name"],"Uppsala")
        self.assertEqual(record["municipality_type"],"K")
        self.assertNotIn("DO-NOT-EXPORT",str(record))
    def test_bad_status_rejected(self):
        with self.assertRaises(ValueError):m.extract(sample(status=404))
    def test_wrong_code_rejected(self):
        with self.assertRaises(ValueError):m.extract(sample(municipality_id="1281"))
    def test_wrong_name_rejected(self):
        with self.assertRaises(ValueError):m.extract(sample(title="Stockholm"))
    def test_count_mismatch_rejected(self):
        with self.assertRaises(ValueError):m.extract(sample(count=2))
    def test_duplicate_rows_rejected(self):
        with self.assertRaises(ValueError):m.extract(sample(records=2))
    def test_missing_type_rejected(self):
        r=sample()
        del r[0]["results"][0]["response"]["data"]["values"][0]["type"]
        with self.assertRaises(ValueError):m.extract(r)
    def test_private_csv_and_provenance(self):
        with tempfile.TemporaryDirectory() as folder:
            src=Path(folder)/"report.private.json";src.write_text(json.dumps(sample()))
            dest=Path(folder)/"derived"/"municipality.csv"
            outcome=m.export(src,dest)
            self.assertEqual(outcome["status"],"validated_export")
            self.assertEqual(dest.stat().st_mode & 0o777,0o600)
            with dest.open(newline="") as f: rows=list(csv.DictReader(f))
            self.assertEqual(len(rows),1)
            self.assertEqual(rows[0]["municipality_id"],"0380")
            self.assertNotIn("DO-NOT-EXPORT",dest.read_text())
            sidecar=dest.with_suffix(".provenance.json")
            self.assertTrue(sidecar.is_file())
            self.assertEqual(json.loads(sidecar.read_text())["record_count"],1)
            with self.assertRaises(FileExistsError):m.export(src,dest)
    def test_reject_paged(self):
        r=sample()
        r[0]["results"][0]["response"]["data"]["next_page"]="link"
        with self.assertRaises(ValueError):m.extract(r)

if __name__=="__main__":unittest.main()
