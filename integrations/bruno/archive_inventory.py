#!/usr/bin/env python3
"""Non-secret, deterministic inventory for the approved FFOS Bruno collection.

This is static repository QA, NOT an importer, credential validator, or live test.
Only hashes approved text definitions; rejects environment paths and symlinks.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent / "central-api-ledger"
ALLOWED = {".yml", ".yaml", ".bru", ".json", ".md"}
SKIP = {".git", ".DS_Store", "__pycache__"}
RESTRICTED = {"environments", "secrets", "credentials", "cookies", "certificates", "responses", "results"}
SECRET = [
    re.compile(r"(?i)\b(?:Bearer)\s+[a-z0-9._~+/-]{16,}"),
    re.compile(r"(?i)\b(?:gh[pousr]_[a-z0-9_]{20,}|sk-(?:proj-)?[a-z0-9_-]{20,})"),
    re.compile(r"(?im)^\s*(?:api[_-]?key|token|password|secret)\s*[:=]\s*(?!\{\{)\S{12,}"),
]

def inventory(root: Path) -> dict:
    if not root.is_dir() or root.is_symlink():
        raise ValueError("Collection root missing or symlinked")
    files = []
    for path in sorted(root.rglob("*")):
        rel = path.relative_to(root)
        if any(part.lower() in RESTRICTED for part in rel.parts) or any(part.startswith(".env") for part in rel.parts):
            raise ValueError(f"Restricted path in collection: {rel}")
        if path.is_symlink():
            raise ValueError(f"Symlink in collection: {rel}")
        if not path.is_file():
            continue
        if any(part in SKIP for part in rel.parts):
            raise ValueError(f"Unexpected untracked/system file: {rel}")
        if path.suffix.lower() not in ALLOWED:
            raise ValueError(f"Unapproved file type: {rel}")
        raw = path.read_bytes()
        if len(raw) > 1024 * 1024:
            raise ValueError(f"Oversize definition: {rel}")
        try:
            content = raw.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError(f"Non-UTF8 definition: {rel}") from exc
        if any(pattern.search(content) for pattern in SECRET):
            raise ValueError(f"Possible embedded secret: {rel}")
        files.append({"path": rel.as_posix(), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)})
    if not any(entry["path"] == "opencollection.yml" for entry in files):
        raise ValueError("Missing OpenCollection manifest")
    return {"schema": "ffos-bruno-inventory-v1", "files": files, "count": len(files)}

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--output", type=Path, help="Optional inventory JSON output")
    args = parser.parse_args()
    try:
        result = inventory(args.root)
    except (ValueError, OSError) as error:
        print(f"ARCHIVE INVENTORY FAIL: {error}", file=sys.stderr)
        return 1
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    else:
        sys.stdout.write(rendered)
    print(f"ARCHIVE INVENTORY PASS: {result['count']} definitions (static only)", file=sys.stderr)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
