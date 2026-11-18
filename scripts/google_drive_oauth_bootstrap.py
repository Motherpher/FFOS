#!/usr/bin/env python3
"""One-time local bootstrap for FFOS Google Drive OAuth.

Use a Google Cloud OAuth *Desktop app* client. The helper requests only
drive.file, uses loopback Authorization Code + PKCE, never prints the refresh
token, and writes it only to an explicitly selected 0600 file.

This is an operator setup tool, not an FFOS runtime dependency.
"""
import argparse
import base64
from getpass import getpass
import hashlib
import json
import os
from pathlib import Path
import secrets
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen
import webbrowser

from integrations.cloud.drive_storage import DRIVE_ID, DriveStorage

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPE = "https://www.googleapis.com/auth/drive.file"

def _b64url(raw):
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")

def build_authorization_url(client_id, redirect_uri, state, challenge):
    return AUTH_URL + "?" + urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "include_granted_scopes": "false",
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    })

def write_refresh_token(path, token):
    target = Path(path).expanduser().resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(token)
            handle.write("\n")
    except Exception:
        try: target.unlink()
        except FileNotFoundError: pass
        raise
    if (target.stat().st_mode & 0o777) != 0o600:
        target.chmod(0o600)
    return target

class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        self.server.oauth_result = {
            "code": query.get("code", [None])[0],
            "state": query.get("state", [None])[0],
            "error": query.get("error", [None])[0],
        }
        body = b"FFOS Google Drive authorization received. You may close this tab."
        self.send_response(200); self.send_header("Content-Type","text/plain; charset=utf-8")
        self.send_header("Content-Length",str(len(body))); self.end_headers(); self.wfile.write(body)
    def log_message(self, *_): pass

def exchange_code(client_id, client_secret, code, redirect_uri, verifier):
    body = urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
        "code_verifier": verifier,
    }).encode("ascii")
    with urlopen(Request(TOKEN_URL, data=body,
        headers={"Content-Type":"application/x-www-form-urlencoded"}, method="POST"), timeout=30) as response:
        data = json.loads(response.read(32768))
    access = data.get("access_token"); refresh = data.get("refresh_token")
    scopes = set((data.get("scope") or SCOPE).split())
    if not isinstance(access,str) or not isinstance(refresh,str):
        raise RuntimeError("OAuth exchange did not return both access and refresh tokens")
    if SCOPE not in scopes or "https://www.googleapis.com/auth/drive" in scopes:
        raise RuntimeError("OAuth grant scope is not the approved drive.file-only contract")
    return access, refresh, sorted(scopes)

def create_managed_root(storage, name):
    status, _, raw = storage.request(
        "https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,parents",
        "POST",
        json.dumps({"name":name,"mimeType":"application/vnd.google-apps.folder"}).encode("utf-8"),
        "application/json"
    )
    if status not in (200,201): raise RuntimeError("Unable to create app-managed Drive root")
    meta = json.loads(raw); folder_id = str(meta.get("id",""))
    if not DRIVE_ID.fullmatch(folder_id) or meta.get("mimeType")!="application/vnd.google-apps.folder":
        raise RuntimeError("Google returned invalid managed-root metadata")
    return folder_id

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--client-id", default=os.environ.get("FFOS_GDRIVE_CLIENT_ID"))
    parser.add_argument("--client-secret", default=os.environ.get("FFOS_GDRIVE_CLIENT_SECRET"))
    parser.add_argument("--token-file", required=True,
        help="Local file to create with mode 0600. It must not already exist.")
    parser.add_argument("--folder-id", help="Existing drive.file-authorized folder to verify")
    parser.add_argument("--create-managed-root", metavar="NAME",
        help="Create an app-owned folder in My Drive. Move it manually beneath the approved governance root, then preflight its ID.")
    args=parser.parse_args()
    client_id=args.client_id or input("Google OAuth Desktop client ID: ").strip()
    client_secret=args.client_secret or getpass("Google OAuth Desktop client secret: ")
    if not client_id or not client_secret: raise SystemExit("Client ID/secret required")
    if bool(args.folder_id) == bool(args.create_managed_root):
        raise SystemExit("Choose exactly one of --folder-id or --create-managed-root")

    verifier=_b64url(secrets.token_bytes(48))
    challenge=_b64url(hashlib.sha256(verifier.encode("ascii")).digest())
    state=secrets.token_urlsafe(32)
    server=HTTPServer(("127.0.0.1",0),CallbackHandler); server.oauth_result=None
    redirect_uri=f"http://127.0.0.1:{server.server_port}/callback"
    url=build_authorization_url(client_id,redirect_uri,state,challenge)
    print("Opening Google authorization in your browser. Requested scope: drive.file only.")
    webbrowser.open(url,new=1,autoraise=True)
    server.timeout=300; server.handle_request(); server.server_close()
    result=server.oauth_result or {}
    if result.get("error"): raise SystemExit("Google authorization was not granted")
    if result.get("state") != state or not result.get("code"): raise SystemExit("OAuth callback state/code invalid")

    access,refresh,scopes=exchange_code(client_id,client_secret,result["code"],redirect_uri,verifier)
    drive=DriveStorage(access)
    folder_id=None; mode=None
    if args.folder_id:
        drive.probe_folder(args.folder_id)
        folder_id=args.folder_id; mode="existing_authorized_folder"
    else:
        folder_id=create_managed_root(drive,args.create_managed_root)
        drive.probe_folder(folder_id)
        mode="app_managed_root_created"

    token_path=write_refresh_token(args.token_file,refresh)
    print(json.dumps({
        "status":"OAUTH_BOOTSTRAP_VERIFIED",
        "scope":scopes,
        "folder_id":folder_id,
        "folder_mode":mode,
        "refresh_token_file":str(token_path),
        "refresh_token_printed":False,
        "next":"Enter client ID, client secret and refresh token into the GitHub drive-publish environment secrets. Then delete the local token file after confirming the GitHub secret was saved.",
    },indent=2))

if __name__=="__main__":
    main()
