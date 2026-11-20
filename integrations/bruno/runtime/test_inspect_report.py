"""Privacy regression tests for reporter structure preview."""
import importlib.util
import unittest
from pathlib import Path

module_path=Path(__file__).resolve().parent/"inspect_report.py"
spec=importlib.util.spec_from_file_location("inspect_report",module_path)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class PrivacyTests(unittest.TestCase):
    def test_nested_response_metadata_visible_but_content_redacted(self):
        report=[{"results":[{"request":{"url":"https://secret.example/token"},
                             "response":{"status":200,"statusCode":200,
                                         "data":{"secret":"DO-NOT-LEAK"},
                                         "body":"DO-NOT-LEAK","headers":{"authorization":"DO-NOT-LEAK"}},
                             "error":"DO-NOT-LEAK","status":"passed"}],"summary":{}}]
        result=mod.structure(report)
        item=result["first_item_structure"]["results"]["first_item_structure"]
        self.assertEqual(item["response"]["status"],"integer")
        self.assertEqual(item["response"]["data"],"REDACTED")
        self.assertEqual(item["response"]["headers"],"REDACTED")
        self.assertEqual(item["request"],"REDACTED")
        self.assertNotIn("DO-NOT-LEAK",str(result))
        self.assertNotIn("https://secret",str(result))
    def test_response_data_shape_does_not_leak_content(self):
        report=[{"results":[{"response":{"status":200,"data":{"secret":"DO-NOT-LEAK"}}}]}]
        details=mod.response_data_shape(report)
        self.assertEqual(details[0]["http_status"],200)
        self.assertEqual(details[0]["data_type"],"object")
        self.assertEqual(details[0]["data_item_count"],1)
        self.assertNotIn("DO-NOT-LEAK",str(details))
    def test_empty_reporter_data(self):
        report=[{"results":[{"response":{"status":200,"data":None}}]}]
        details=mod.response_data_shape(report)
        self.assertEqual(details[0]["data_type"],"null")
        self.assertTrue(details[0]["data_empty"])
    def test_unknown_keys_are_not_exposed(self):
        self.assertEqual(mod.structure({"unknown_secret":"DO-NOT-LEAK"}),{})
    def test_string_status_not_revealed(self):
        self.assertEqual(mod.structure({"status":"sensitive-text"}),{"status":"string"})

if __name__=="__main__":
    unittest.main()
