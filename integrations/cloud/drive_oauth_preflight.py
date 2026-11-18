"""Safe Google Drive OAuth/folder preflight for FFOS GitHub Actions.

Refreshes an access token from environment secrets, verifies the configured
folder is an active writable Google Drive folder, and writes only non-secret
evidence. It performs no Drive mutation.
"""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path

from integrations.cloud.drive_storage import DriveStorage, refresh_access_token

def preflight(root_folder_id):
    token = refresh_access_token(
        os.environ.get("FFOS_GDRIVE_CLIENT_ID", ""),
        os.environ.get("FFOS_GDRIVE_CLIENT_SECRET", ""),
        os.environ.get("FFOS_GDRIVE_REFRESH_TOKEN", ""),
    )
    folder = DriveStorage(token, approved_root_id=root_folder_id).probe_folder(root_folder_id)
    return {
        "schema": "ffos.drive-oauth-preflight.v1",
        "status": "verified",
        "scope_contract": "https://www.googleapis.com/auth/drive.file",
        "root_folder": folder,
        "verified_at_utc": datetime.now(timezone.utc).isoformat(),
        "mutation_performed": False,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root-folder-id", required=True)
    parser.add_argument("--receipt")
    args = parser.parse_args()
    receipt = preflight(args.root_folder_id)
    if args.receipt:
        path = Path(args.receipt)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": receipt["status"],
        "folder_id": receipt["root_folder"]["folder_id"],
        "folder_name": receipt["root_folder"]["name"],
        "can_add_children": True,
        "mutation_performed": False,
    }))

if __name__ == "__main__":
    main()
