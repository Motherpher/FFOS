"""No-network tests of safe Kolada response schema inspector."""
import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location("inspect",Path(__file__).resolve().parent/"inspect_kolada_schema.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class TestSafeProbe(unittest.TestCase):
    def test_paged_municipality(self):
        data={"values":[{"id":"0380","title":"Uppsala","api_token":"SECRET"}],
              "count":1,"next_page":None,"previous_page":None,"private_field":"SECRET"}
        result=m.probe([{"results":[{"response":{"status":200,"data":data,"headers":{"authorization":"SECRET"}}}]}])
        self.assertEqual(result["values_length"],1)
        self.assertEqual(result["http_status"],200)
        self.assertFalse(result["next_page_present"])
        self.assertIn({"name":"id","type":"string"},result["first_value_fields"])
        self.assertNotIn("SECRET",repr(result))
        self.assertNotIn("private_field",repr(result))
        self.assertNotIn("api_token",repr(result))
    def test_missing_data(self):
        self.assertEqual(m.probe([{"results":[{"response":{"status":200,"data":None}}]}])["response_data_type"],"null")
    def test_multiple_results_rejected(self):
        with self.assertRaises(ValueError):
            m.probe([{"results":[{},{}]}])
if __name__=="__main__":unittest.main()
