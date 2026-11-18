import os
from pathlib import Path
import stat
import tempfile
import unittest
from urllib.parse import parse_qs, urlparse

from scripts.google_drive_oauth_bootstrap import SCOPE, build_authorization_url, write_refresh_token

class OAuthBootstrapTests(unittest.TestCase):
    def test_authorization_url_is_drive_file_only_offline_pkce(self):
        url=build_authorization_url("client","http://127.0.0.1:123/callback","state","challenge")
        q=parse_qs(urlparse(url).query)
        self.assertEqual(q["scope"],[SCOPE])
        self.assertEqual(q["access_type"],["offline"])
        self.assertEqual(q["prompt"],["consent"])
        self.assertEqual(q["include_granted_scopes"],["false"])
        self.assertEqual(q["code_challenge_method"],["S256"])
        self.assertNotIn("https://www.googleapis.com/auth/drive", q["scope"])

    def test_refresh_token_file_is_private_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/"token"
            write_refresh_token(p,"secret-token")
            self.assertEqual(stat.S_IMODE(p.stat().st_mode),0o600)
            self.assertEqual(p.read_text().strip(),"secret-token")
            with self.assertRaises(FileExistsError):
                write_refresh_token(p,"replacement")

if __name__=="__main__":
    unittest.main()
