import json
import unittest
from unittest.mock import patch

from integrations.cloud import drive_managed_root

ROOT="1Aaa_BbbCccDddEeeFffGggHhhIiiJjj"

class FakeDrive:
    def __init__(self,*_): pass
    def request(self,*_args,**_kwargs):
        return 200,{},json.dumps({
            "id":ROOT,
            "name":"FFOS Cloud Drive Runtime",
            "mimeType":"application/vnd.google-apps.folder",
            "parents":["root"],
        }).encode()
    def probe_folder(self,folder_id):
        self.asserted=folder_id
        return {"folder_id":folder_id,"name":"FFOS Cloud Drive Runtime",
                "mime_type":"application/vnd.google-apps.folder",
                "can_add_children":True,"trashed":False}

class ManagedRootTests(unittest.TestCase):
    @patch.object(drive_managed_root,"refresh_access_token",return_value="token")
    @patch.object(drive_managed_root,"DriveStorage",FakeDrive)
    def test_managed_root_is_explicit_and_app_owned(self,_refresh):
        with patch.dict("os.environ",{
            "FFOS_GDRIVE_CLIENT_ID":"id",
            "FFOS_GDRIVE_CLIENT_SECRET":"secret",
            "FFOS_GDRIVE_REFRESH_TOKEN":"refresh",
        }):
            r=drive_managed_root.create_runtime_root("FFOS Cloud Drive Runtime")
        self.assertEqual(r["folder_id"],ROOT)
        self.assertTrue(r["created_by_ffos_oauth_client"])
        self.assertEqual(r["scope_contract"],"https://www.googleapis.com/auth/drive.file")
    def test_rejects_other_names(self):
        with self.assertRaises(ValueError):
            drive_managed_root.create_runtime_root("Other")

if __name__=="__main__":
    unittest.main()
