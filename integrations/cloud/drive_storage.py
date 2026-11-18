"""Bounded Google Drive v1 storage adapter for FFOS/FF-Spatial cloud artifacts.

Requires Google OAuth *user* refresh credentials in GitHub Actions secrets.
Never uses a local Mac. Each run creates a new child folder beneath the
Director-approved root and independently downloads every uploaded file to
check its SHA-256 before reporting success. Never overwrites or deletes.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
from urllib.parse import urlencode, quote, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler

DRIVE_API = "https://www.googleapis.com/drive/v3/files"
UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files"
TOKEN_API = "https://oauth2.googleapis.com/token"
MAX_FILE_BYTES = 100 * 1024 * 1024
MAX_FILES = 12
SAFE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$")
DRIVE_ID = re.compile(r"^[A-Za-z0-9_-]{12,120}$")

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise ValueError("Unapproved HTTP redirect in Google Drive storage")

def _json(data):
    return json.dumps(data, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

class DriveStorage:
    def __init__(self, token, *, opener=None):
        if not isinstance(token, str) or not token:
            raise ValueError("Google Drive access token missing")
        self.token = token
        self.opener = opener or build_opener(NoRedirect)

    def request(self, url, method="GET", payload=None, content_type=None, accept=None):
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.hostname not in (
            "www.googleapis.com", "oauth2.googleapis.com"
        ) or parsed.username or parsed.password or parsed.port not in (None, 443):
            raise ValueError("Google API endpoint not allowlisted")
        headers = {"Authorization": f"Bearer {self.token}"}
        if content_type:
            headers["Content-Type"] = content_type
        if accept:
            headers["Accept"] = accept
        with self.opener.open(
            Request(url, data=payload, headers=headers, method=method),
            timeout=75
        ) as res:
            result = res.read(MAX_FILE_BYTES + 1)
            if len(result) > MAX_FILE_BYTES:
                raise ValueError("Google response exceeds limit")
            return res.status, dict(res.headers), result

    def probe_folder(self, folder_id):
        if not DRIVE_ID.fullmatch(folder_id):
            raise ValueError("Unsafe Google Drive folder ID")
        status, _, raw = self.request(
            DRIVE_API + "/" + quote(folder_id, safe="") +
            "?fields=id,name,mimeType,trashed,capabilities(canAddChildren)"
        )
        if status != 200:
            raise ValueError("Google Drive folder probe failed")
        meta = json.loads(raw)
        if (meta.get("id") != folder_id
                or meta.get("mimeType") != "application/vnd.google-apps.folder"
                or meta.get("trashed") is True
                or meta.get("capabilities", {}).get("canAddChildren") is not True):
            raise ValueError("Google Drive destination is not an active writable folder")
        return {
            "folder_id": folder_id,
            "name": meta.get("name"),
            "mime_type": meta.get("mimeType"),
            "can_add_children": True,
            "trashed": False,
        }

    def create_folder(self, parent_id, name):
        if not DRIVE_ID.fullmatch(parent_id) or not SAFE_NAME.fullmatch(name):
            raise ValueError("Unsafe Google Drive parent ID or folder name")
        status, _, raw = self.request(
            DRIVE_API + "?fields=id,name,parents",
            "POST", _json({
                "name": name,
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [parent_id],
            }), "application/json"
        )
        if status not in (200, 201):
            raise ValueError("Google Drive folder create failed")
        meta = json.loads(raw)
        if (not DRIVE_ID.fullmatch(str(meta.get("id", "")))
                or parent_id not in meta.get("parents", [])):
            raise ValueError("Google Drive folder identity/parent mismatch")
        return meta["id"]

    def upload(self, parent_id, path):
        if not DRIVE_ID.fullmatch(parent_id) or not path.is_file():
            raise ValueError("Missing upload parent or file")
        if not SAFE_NAME.fullmatch(path.name):
            raise ValueError("Unsafe file name")
        size = path.stat().st_size
        if size > MAX_FILE_BYTES or size == 0:
            raise ValueError("Invalid upload size")
        expected_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        status, headers, _ = self.request(
            UPLOAD_API + "?uploadType=resumable&fields=id,name,size,parents,md5Checksum,version",
            "POST",
            _json({"name": path.name, "parents": [parent_id], "mimeType": "application/octet-stream"}),
            "application/json"
        )
        if status != 200:
            raise ValueError("Unable to initiate resumable Google Drive upload")
        # Only trust resumable upload session endpoints at Google's upload host.
        session_url = headers.get("Location") or headers.get("location")
        parsed = urlsplit(session_url or "")
        if parsed.scheme != "https" or parsed.hostname != "www.googleapis.com":
            raise ValueError("Untrusted Google upload session URL")
        status, _, raw = self.request(
            session_url, "PUT", path.read_bytes(), "application/octet-stream"
        )
        if status not in (200, 201):
            raise ValueError("Google Drive content upload failed")
        meta = json.loads(raw)
        file_id = meta.get("id", "")
        if (not DRIVE_ID.fullmatch(file_id) or meta.get("name") != path.name
                or parent_id not in meta.get("parents", [])
                or int(meta.get("size", -1)) != size):
            raise ValueError("Google Drive uploaded metadata mismatch")
        # Post-upload readback is independent of Google Drive metadata or ETags.
        status, _, actual = self.request(
            DRIVE_API + "/" + quote(file_id, safe="") + "?alt=media",
            accept="application/octet-stream"
        )
        if status != 200 or hashlib.sha256(actual).hexdigest() != expected_hash:
            raise ValueError("Google Drive file readback/checksum mismatch")
        return {
            "file_id": file_id,
            "name": path.name,
            "bytes": size,
            "sha256": expected_hash,
            "google_version": meta.get("version"),
            "readback_verified": True,
        }

def refresh_access_token(client_id, client_secret, refresh_token, *, opener=None):
    if not all((client_id, client_secret, refresh_token)):
        raise ValueError("Missing Google OAuth credentials; no Drive write attempted")
    op = opener or build_opener(NoRedirect)
    body = urlencode({
        "client_id": client_id, "client_secret": client_secret,
        "refresh_token": refresh_token, "grant_type": "refresh_token",
    }).encode("ascii")
    with op.open(Request(
        TOKEN_API, data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"), timeout=30) as response:
        raw = response.read(16384)
    token = json.loads(raw).get("access_token")
    if not isinstance(token, str) or not token:
        raise ValueError("Google OAuth token exchange failed")
    return token

def publish_directory(source_dir, root_folder_id, namespace, run_id, *,
                      client=None):
    source = Path(source_dir).resolve(strict=True)
    if not source.is_dir() or not DRIVE_ID.fullmatch(root_folder_id):
        raise ValueError("Source directory or destination folder invalid")
    if namespace not in ("FFOS", "FF-Spatial") or not SAFE_NAME.fullmatch(run_id):
        raise ValueError("Unapproved namespace or run identifier")
    files = sorted(x for x in source.iterdir() if x.is_file() and not x.is_symlink()
                   and x.name != "drive-receipt.json")
    if not files or len(files) > MAX_FILES:
        raise ValueError("Unexpected cloud artifact file count")
    if any(not SAFE_NAME.fullmatch(p.name) or p.stat().st_size > MAX_FILE_BYTES
           or p.stat().st_size == 0 for p in files):
        raise ValueError("Unsafe cloud artifact files")
    storage = client or DriveStorage(refresh_access_token(
        os.environ.get("FFOS_GDRIVE_CLIENT_ID", ""),
        os.environ.get("FFOS_GDRIVE_CLIENT_SECRET", ""),
        os.environ.get("FFOS_GDRIVE_REFRESH_TOKEN", ""),
    ))
    folder_id = storage.create_folder(root_folder_id, namespace + "_" + run_id)
    uploaded = [storage.upload(folder_id, f) for f in files]
    receipt = {
        "schema": "ffos.drive-storage-receipt.v1",
        "status": "verified",
        "namespace": namespace,
        "run_id": run_id,
        "root_folder_id": root_folder_id,
        "run_folder_id": folder_id,
        "verified_at_utc": datetime.now(timezone.utc).isoformat(),
        "files": uploaded,
    }
    (source / "drive-receipt.json").write_text(
        json.dumps(receipt, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    return receipt

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True)
    parser.add_argument("--root-folder-id", required=True)
    parser.add_argument("--namespace", choices=["FFOS", "FF-Spatial"], required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args()
    receipt = publish_directory(args.source_dir, args.root_folder_id,
                                args.namespace, args.run_id)
    # Never log access tokens, response bodies or OAuth client secrets.
    print(json.dumps({"status": receipt["status"],
                      "namespace": receipt["namespace"],
                      "files_verified": len(receipt["files"]),
                      "run_folder_id": receipt["run_folder_id"]}))

if __name__ == "__main__":
    main()
