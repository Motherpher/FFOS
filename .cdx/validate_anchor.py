#!/usr/bin/env python3
"""Validate the local CDX anchor without claiming runtime enforcement."""
import json
import os
import re
from pathlib import Path

path=Path(".cdx/anchor.json")
if not path.exists():
    raise SystemExit("FAIL: .cdx/anchor.json missing")
doc=json.loads(path.read_text(encoding="utf-8"))

expected={"schema":"cdx.anchor/v1","system_short_name":"CDX","law_id":"CDX-LAW-001"}
for key,value in expected.items():
    if doc.get(key)!=value:
        raise SystemExit(f"FAIL: {key}={doc.get(key)!r}, expected {value!r}")

authority=doc.get("cdx_authority",{})
if authority.get("repository")!="Hybrismannen/Conductellence-":
    raise SystemExit("FAIL: unknown CDX authority repository")
if authority.get("canonical_name")!="Conductellence" or authority.get("short_name")!="CDX":
    raise SystemExit("FAIL: canonical CDX identity mismatch")

governed=doc.get("governed_surface",{})
repo=os.getenv("GITHUB_REPOSITORY","Motherpher/FFOS")
if governed.get("repository")!=repo:
    raise SystemExit(f"FAIL: anchor repository {governed.get('repository')!r} != {repo!r}")

mode=doc.get("binding_mode")
pin=doc.get("policy_pin",{})
if mode=="PINNED_COMMIT":
    if pin.get("ref_type")!="COMMIT" or not re.fullmatch(r"[0-9a-fA-F]{40}",str(pin.get("ref",""))):
        raise SystemExit("FAIL: invalid PINNED_COMMIT")
elif mode=="PINNED_RELEASE":
    if pin.get("ref_type")!="RELEASE":
        raise SystemExit("FAIL: PINNED_RELEASE requires RELEASE ref_type")
    if pin.get("ref")!="1.0.0":
        raise SystemExit("FAIL: WP09 expects released CDX 1.0.0")
    if pin.get("digest")!="git-blob-sha1:55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0":
        raise SystemExit("FAIL: CDX 1.0.0 policy bundle digest mismatch")
else:
    raise SystemExit(f"FAIL: unsupported binding mode {mode!r}")

if doc.get("binding_state") not in {"ANCHOR_DECLARED","CDX_BOUND","CDX_CI_MONITORED","CDX_RUNTIME_GUARDED","CDX_RUNTIME_VERIFIED","CDX_DEGRADED","CDX_REVOKED"}:
    raise SystemExit("FAIL: invalid CDX binding state")
if doc.get("local_enforcement",{}).get("fail_closed_for_consequential_effects") is not True:
    raise SystemExit("FAIL: consequential effects must fail closed")
if doc.get("verification",{}).get("verification_state")!="NOT_VERIFIED":
    raise SystemExit("FAIL: WP09 repin must remain NOT_VERIFIED pending WP10")

print(f"PASS: FFOS CDX anchor -> {authority['repository']} ref={pin.get('ref')} state={doc.get('binding_state')}")
print("NOT VERIFIED: consequential runtime enforcement remains outside WP09.")
