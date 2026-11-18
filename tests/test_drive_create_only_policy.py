"""Offline negative-policy tests; no Google API or credential use."""
import json
import unittest

from integrations.cloud.drive_storage import _assert_create_only_drive_request as gate

BASE = "https://www.googleapis.com"
FOLDER = json.dumps({"name": "new", "mimeType": "application/vnd.google-apps.folder", "parents": ["1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD"]}).encode()
UPLOAD = json.dumps({"name": "fresh.csv", "parents": ["1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD"], "mimeType": "application/octet-stream"}).encode()

class DriveCreateOnlyPolicyTests(unittest.TestCase):
    def test_allows_read_and_verified_create_contract(self):
        gate(BASE + "/drive/v3/files/1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD?fields=id", "GET", None)
        gate(BASE + "/drive/v3/files?fields=id,name,parents", "POST", FOLDER)
        gate(BASE + "/upload/drive/v3/files?uploadType=resumable", "POST", UPLOAD)
        gate(BASE + "/upload/drive/v3/files?upload_id=abc", "PUT", b"fresh bytes")

    def test_denies_all_existing_file_mutations(self):
        fid = "1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD"
        blocked = [
            ("PATCH", "/drive/v3/files/" + fid),
            ("DELETE", "/drive/v3/files/" + fid),
            ("PUT", "/drive/v3/files/" + fid),
            ("POST", "/drive/v3/files/" + fid + "/copy"),
            ("POST", "/drive/v3/files/" + fid + "/permissions"),
            ("POST", "/drive/v3/files/" + fid + "/revisions"),
            ("POST", "/drive/v3/files/trash"),
            ("POST", "/drive/v3/files/emptyTrash"),
            ("PUT", "/upload/drive/v3/files/" + fid + "?uploadType=resumable"),
            ("PUT", "/upload/drive/v3/files?upload_id="),
            ("GET", "/drive/v3/about"),
        ]
        for method, path in blocked:
            with self.subTest(method=method, path=path):
                with self.assertRaises(PermissionError):
                    gate(BASE + path, method, b"{}")

    def test_denies_false_new_item_or_provider(self):
        bad = [
            (BASE + "/drive/v3/files", "POST", json.dumps({"id":"existing","name":"bad","mimeType":"application/vnd.google-apps.folder","parents":["root"]}).encode()),
            (BASE + "/drive/v3/files", "POST", json.dumps({"name":"bad","mimeType":"application/vnd.google-apps.shortcut","parents":["root"]}).encode()),
            (BASE + "/upload/drive/v3/files?uploadType=resumable", "POST", json.dumps({"id":"existing","name":"bad","parents":["root"],"mimeType":"application/octet-stream"}).encode()),
            ("https://evil.example/drive/v3/files", "POST", FOLDER),
        ]
        for url, method, payload in bad:
            with self.subTest(url=url):
                with self.assertRaises(PermissionError):
                    gate(url, method, payload)

if __name__ == "__main__":
    unittest.main()
