import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from integrations.cloud.kolada_lookup import fetch, validate, write_outputs

class FakeResponse:
    status=200
    def __enter__(self): return self
    def __exit__(self,*_):return False
    def read(self,_):return json.dumps({"count":1,"values":[{"id":"0380","title":"Uppsala","type":"K"}]}).encode()

class KoladaCloudTests(unittest.TestCase):
    def test_validated_lookup(self):
        v=fetch("0380",opener=lambda req,timeout: FakeResponse())
        self.assertEqual(v["municipality_id"],"0380")
        self.assertEqual(len(v["response_sha256"]),64)
        with tempfile.TemporaryDirectory() as t:
            write_outputs(v,t)
            self.assertTrue((Path(t)/"municipality.csv").is_file())
            self.assertEqual(json.loads((Path(t)/"municipality.provenance.json").read_text())["title"],"Uppsala")
    def test_reject_nonunique(self):
        with self.assertRaises(ValueError):
            validate({"count":2,"values":[{"id":"0380","title":"Uppsala","type":"K"}]},"0380")
    def test_reject_wrong_id(self):
        with self.assertRaises(ValueError):
            validate({"count":1,"values":[{"id":"0001","title":"Other","type":"K"}]},"0380")
    def test_reject_bad_input_before_network(self):
        with self.assertRaises(ValueError):
            fetch("0380/../evil",opener=lambda **kw: None)
    def test_reject_paged(self):
        with self.assertRaises(ValueError):
            validate({"count":1,"next_url":"more","values":[{"id":"0380","title":"Uppsala","type":"K"}]},"0380")
if __name__=="__main__":unittest.main()
