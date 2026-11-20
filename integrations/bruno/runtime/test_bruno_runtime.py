"""Contract tests: all network calls mocked. No real Bruno collection or secrets required."""
import hashlib, json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from bruno_runtime import run

class ContractTests(unittest.TestCase):
    def setUp(self):
        t=tempfile.TemporaryDirectory()
        self.addCleanup(t.cleanup)
        self.root=Path(t.name)
        (self.root/"opencollection.yml").write_text("opencollection: 1.0.0\ninfo:\n  name: Test\n",encoding="utf-8")
        req=self.root/"request.yml"
        req.write_text("meta {\n name: Example\n}\n",encoding="utf-8")
        self.cfg={"collection_root":str(self.root),"operations":{"kolada.municipality.lookup":{
            "request":"request.yml","sha256":hashlib.sha256(req.read_bytes()).hexdigest(),
            "environment":"Development","allowed_parameters":{"municipality_id":"[0-9]{4}"}}}}
        self.job={"job_id":"ffos-municipality-001","operation_id":"kolada.municipality.lookup",
                  "parameters":{"municipality_id":"0380"}}
    def test_dry_run(self):
        self.assertEqual(run(self.cfg,self.job)["status"],"validated_dry_run")
    def test_reject_unknown_operation(self):
        self.job["operation_id"]="kolada.anything"
        with self.assertRaises(ValueError): run(self.cfg,self.job)
    def test_reject_extra_parameters(self):
        self.job["parameters"]["unregistered"]="x"
        with self.assertRaises(ValueError): run(self.cfg,self.job)
    def test_reject_untrusted_parameter(self):
        self.job["parameters"]["municipality_id"]="0380;rm"
        with self.assertRaises(ValueError): run(self.cfg,self.job)
    def test_reject_changed_request(self):
        (self.root/"request.yml").write_text("changed",encoding="utf-8")
        with self.assertRaises(ValueError): run(self.cfg,self.job)
    def test_reject_path_outside_collection(self):
        self.cfg["operations"]["kolada.municipality.lookup"]["request"]="../missing.yml"
        with self.assertRaises((ValueError,FileNotFoundError)): run(self.cfg,self.job)
    def test_missing_collection_marker(self):
        (self.root/"opencollection.yml").unlink()
        with self.assertRaises(ValueError): run(self.cfg,self.job)
    def test_mock_execution_receipt(self):
        fake=self.root/"mockbru"
        fake.write_text("#!/usr/bin/env python3\nimport sys,json,pathlib\na=sys.argv\npathlib.Path(a[a.index('--reporter-json')+1]).write_text(json.dumps({'results': []}))\n",encoding="utf-8")
        fake.chmod(0o755)
        out=run(self.cfg,self.job,True,bru=str(fake),output_dir=str(self.root/"runs"))
        self.assertEqual(out["status"],"executed")
        self.assertTrue(Path(out["report_path"]).exists())
        self.assertEqual((self.root/"runs"/"ffos-municipality-001"/"receipt.json").stat().st_mode & 0o777,0o600)

if __name__=="__main__": unittest.main()
