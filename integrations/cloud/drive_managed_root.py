"""Create one app-owned FFOS Google Drive runtime folder.

This helper is intentionally narrow: it refreshes the approved OAuth grant,
creates exactly one folder in My Drive/root using drive.file, verifies the
created folder, and writes non-secret evidence. It cannot upload files, move
the folder, change permissions, or delete anything.
"""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path

from integrations.cloud.drive_storage import DRIVE_ID, DriveStorage, refresh_access_token

FOLDER_MIME="application/vnd.google-apps.folder"

def create_runtime_root(name):
    if name != "FFOS Cloud Drive Runtime":
        raise ValueError("Unapproved managed-root name")
    token=refresh_access_token(
        os.environ.get("FFOS_GDRIVE_CLIENT_ID",""),
        os.environ.get("FFOS_GDRIVE_CLIENT_SECRET",""),
        os.environ.get("FFOS_GDRIVE_REFRESH_TOKEN",""),
    )
    drive=DriveStorage(token)
    status,_,raw=drive.request(
        "https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,parents",
        "POST",
        json.dumps({"name":name,"mimeType":FOLDER_MIME}).encode("utf-8"),
        "application/json",
    )
    if status not in (200,201):
        raise ValueError("Google Drive managed-root creation failed")
    meta=json.loads(raw)
    folder_id=str(meta.get("id",""))
    if (not DRIVE_ID.fullmatch(folder_id)
            or meta.get("name")!=name
            or meta.get("mimeType")!=FOLDER_MIME):
        raise ValueError("Google Drive returned invalid managed-root metadata")
    verified=drive.probe_folder(folder_id)
    return {
        "schema":"ffos.drive-managed-root.v1",
        "status":"verified",
        "folder_id":folder_id,
        "folder_name":name,
        "parents":meta.get("parents",[]),
        "scope_contract":"https://www.googleapis.com/auth/drive.file",
        "created_by_ffos_oauth_client":True,
        "verified_at_utc":datetime.now(timezone.utc).isoformat(),
        "next_action":"Move this folder under the approved governance root using Director Drive authority, then set FFOS_GDRIVE_ROOT_FOLDER_ID and rerun preflight.",
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--receipt",required=True)
    args=p.parse_args()
    receipt=create_runtime_root("FFOS Cloud Drive Runtime")
    out=Path(args.receipt)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({
        "status":receipt["status"],
        "folder_id":receipt["folder_id"],
        "folder_name":receipt["folder_name"],
        "created_by_ffos_oauth_client":True
    }))

if __name__=="__main__":
    main()
