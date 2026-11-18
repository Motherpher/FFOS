"""Offline negative-policy tests; no Google API or credential use."""
import json
import unittest

from integrations.cloud.drive_storage import _assert_create_only_drive_request as gate, DriveStorage

BASE = "https://www.googleapis.com"
ROOT_ID = "1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD"
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


class _NoNetwork:
    def __init__(self): self.calls = []
    def open(self, request, timeout=None):
        self.calls.append((request.get_method(), request.full_url))
        class Response:
            status = 200
            headers = {}
            def __enter__(self): return self
            def __exit__(self, *_): return False
            def read(self, *_): return b"{}"
        return Response()


class DriveEffectBoundaryTests(unittest.TestCase):
    def test_missing_authorized_root_denies_folder_creation(self):
        fake = _NoNetwork()
        x = DriveStorage("offline", opener=fake)
        with self.assertRaises(PermissionError):
            x.create_folder("1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD", "new")
        self.assertEqual(fake.calls, [])

    def test_direct_http_forged_parent_denied_before_network(self):
        fake = _NoNetwork()
        x = DriveStorage("offline", opener=fake, approved_root_id=ROOT_ID)
        with self.assertRaises(PermissionError):
            x.request(BASE+"/drive/v3/files", "POST", json.dumps({
                "name":"new", "mimeType":"application/vnd.google-apps.folder",
                "parents":["1MADEUP_PARENT_ID_999"]
            }).encode())
        self.assertEqual(fake.calls, [])

    def test_direct_http_upload_without_fresh_parent_denied(self):
        fake = _NoNetwork()
        x = DriveStorage("offline", opener=fake, approved_root_id=ROOT_ID)
        with self.assertRaises(PermissionError):
            x.request(BASE+"/upload/drive/v3/files?uploadType=resumable",
                      "POST", UPLOAD)
        self.assertEqual(fake.calls, [])

    def test_upload_session_rejects_foreign_and_replay(self):
        import hashlib
        fake = _NoNetwork()
        x = DriveStorage("offline", opener=fake, approved_root_id=ROOT_ID)
        session = BASE+"/upload/drive/v3/files?upload_id=one-run-only"
        with self.assertRaises(PermissionError):
            x.request(session,"PUT",b"payload")
        self.assertEqual(fake.calls, [])
        x.pending_upload_sessions[session] = {
            "size": 7, "sha256": hashlib.sha256(b"payload").hexdigest()
        }
        with self.assertRaises(PermissionError):
            x.request(session,"PUT",b"wrong")
        self.assertEqual(fake.calls, [])
        x.pending_upload_sessions[session] = {
            "size": 7, "sha256": hashlib.sha256(b"payload").hexdigest()
        }
        with self.assertRaises(PermissionError):
            x.request(session,"PUT",b"payload")  # consumed on failed attempt
        self.assertEqual(fake.calls, [])

    def test_session_valid_once_then_replay_denied(self):
        import hashlib
        fake = _NoNetwork()
        x = DriveStorage("offline", opener=fake, approved_root_id=ROOT_ID)
        session = BASE+"/upload/drive/v3/files?upload_id=verified-new"
        x.pending_upload_sessions[session] = {
            "size": 7, "sha256": hashlib.sha256(b"payload").hexdigest()
        }
        result = x.request(session,"PUT",b"payload")
        self.assertEqual(result[0],200)
        self.assertEqual(len(fake.calls),1)
        with self.assertRaises(PermissionError):
            x.request(session,"PUT",b"payload")
        self.assertEqual(len(fake.calls),1)

if __name__ == "__main__":
    unittest.main()
