"""Offline cloud storage contract; never touches Google or credentials."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from integrations.cloud.drive_storage import (
    DRIVE_ID, DriveStorage, publish_directory, refresh_access_token,
)

ROOT_ID = "1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD"
CHILD_ID = "1Aaa_BbbCccDddEeeFffGggHhhIiiJjj"

class FakeDrive:
    def __init__(self): self.calls = []
    def create_folder(self, root, name):
        self.calls.append(("folder",root,name))
        return CHILD_ID
    def upload(self, parent, path):
        self.calls.append(("upload",parent,path.name))
        return {"file_id": CHILD_ID, "name": path.name,
                "bytes": path.stat().st_size,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "readback_verified": True}

class DriveStorageTests(unittest.TestCase):
    def test_publishes_single_immutable_run_and_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)
            (path/"municipality.csv").write_text("municipality_id\n0380\n")
            (path/"municipality.provenance.json").write_text('{"provider":"Kolada"}')
            drive = FakeDrive()
            receipt = publish_directory(path, ROOT_ID, "FFOS", "kolada_0380_42",client=drive)
            self.assertEqual(receipt["status"],"verified")
            self.assertEqual(len(receipt["files"]),2)
            self.assertEqual(drive.calls[0],("folder", ROOT_ID, "FFOS_kolada_0380_42"))
            self.assertTrue((path/"drive-receipt.json").is_file())
            self.assertEqual(json.loads((path/"drive-receipt.json").read_text())["run_folder_id"],CHILD_ID)
            with self.assertRaises(ValueError):
                publish_directory(path,ROOT_ID,"FFOS","bad/name",client=drive)
    def test_denies_missing_credentials_before_write(self):
        with self.assertRaises(ValueError):
            refresh_access_token("","","")
    def test_denies_bad_root(self):
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp)/"a.csv").write_text("test")
            with self.assertRaises(ValueError):
                publish_directory(tmp,"../evil","FFOS","run1",client=FakeDrive())
    def test_denies_unexpected_namespace(self):
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp)/"a.csv").write_text("test")
            with self.assertRaises(ValueError):
                publish_directory(tmp,ROOT_ID,"External","run1",client=FakeDrive())
    def test_denies_symlinks_not_uploaded(self):
        with tempfile.TemporaryDirectory() as tmp:
            src=Path(tmp)
            other=src/"other.csv"
            other.write_text("x")
            (src/"link.csv").symlink_to(other)
            drive=FakeDrive()
            publish_directory(src,ROOT_ID,"FF-Spatial","run2",client=drive)
            self.assertEqual([x[2] for x in drive.calls[1:]],["other.csv"])
    def test_google_host_not_arbitrary(self):
        client=DriveStorage("test-token")
        with self.assertRaises(ValueError):
            client.request("https://evil.example/get")
    def test_probe_writable_folder(self):
        class ProbeStorage(DriveStorage):
            def __init__(self, meta): self.meta=meta
            def request(self,*args,**kwargs):
                return 200,{},json.dumps(self.meta).encode()
        good={"id":ROOT_ID,"name":"Workflow Cloud","mimeType":"application/vnd.google-apps.folder",
              "trashed":False,"capabilities":{"canAddChildren":True}}
        result=ProbeStorage(good).probe_folder(ROOT_ID)
        self.assertTrue(result["can_add_children"])
        bad=dict(good); bad["capabilities"]={"canAddChildren":False}
        with self.assertRaises(ValueError):
            ProbeStorage(bad).probe_folder(ROOT_ID)

    def test_google_file_id(self):
        self.assertTrue(DRIVE_ID.fullmatch(ROOT_ID))
        self.assertFalse(DRIVE_ID.fullmatch("../a"))

    def test_remote_readback_sha256_is_mandatory(self):
        class StubStorage(DriveStorage):
            def __init__(self, readback):
                self.readback=readback
                self.operations=[]
            def request(self,url,method="GET",payload=None,content_type=None,accept=None):
                self.operations.append((method,url))
                if method=="POST":
                    return 200,{"Location":"https://www.googleapis.com/upload/drive/v3/files?upload_id=test"},b""
                if method=="PUT":
                    return 200,{},json.dumps({"id":CHILD_ID,"name":"data.csv","parents":[ROOT_ID],
                                              "size":len(payload),"version":"1"}).encode()
                if method=="GET":
                    return 200,{},self.readback
                raise AssertionError("Unexpected method")
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/"data.csv"
            p.write_bytes(b"identity,data\n0380,Uppsala\n")
            stored=StubStorage(p.read_bytes()).upload(ROOT_ID,p)
            self.assertTrue(stored["readback_verified"])
            self.assertEqual(stored["sha256"],hashlib.sha256(p.read_bytes()).hexdigest())
            with self.assertRaises(ValueError):
                StubStorage(b"tampered").upload(ROOT_ID,p)

if __name__=="__main__":
    unittest.main()
