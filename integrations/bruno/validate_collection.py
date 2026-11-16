#!/usr/bin/env python3
"""Offline static QA for versioned Bruno OpenCollection API requests (no network)."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent / "central-api-ledger"
PATTERNS = [
    re.compile(r"sk-(?:proj-)?[A-Za-z0-9_-]{20,}"),
    re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    re.compile(r"(?im)^\s*(?:password|secret|token|api[_-]?key)\s*:\s*['\"]?(?!\{\{)\S{12,}"),
]
problems = []
col = ROOT / "opencollection.yml"
if not col.is_file() or "opencollection: 1.0.0" not in col.read_text(encoding="utf-8"):
    problems.append("Missing/invalid opencollection.yml")
files = list(ROOT.rglob("*.yml"))
for p in files:
    rel = p.relative_to(ROOT)
    if "environments" in rel.parts:
        problems.append(f"Tracked environment file: {rel}")
    s = p.read_text(encoding="utf-8")
    if any(rx.search(s) for rx in PATTERNS):
        problems.append(f"Potential credential: {rel}")
    if p.name != "opencollection.yml" and p.name != "folder.yml":
        if "  type: http" not in s or "  method: GET" not in s or "  url:" not in s:
            problems.append(f"Unexpected request shape: {rel}")
        if re.search(r'^\s*url:\s*(?:""|\'\'|null)\s*$', s, re.M):
            problems.append(f"Empty HTTP URL: {rel}")
        if "region_typee" in s:
            problems.append(f"Typo region_typee: {rel}")
        if re.search(r"\?[^\n]*from_date=\s*(?:&|\"|$)", s):
            problems.append(f"Empty enabled from_date: {rel}")
        if "per_page=1\"" in s or re.search(r'name: per_page\n\s+value: "1"', s):
            problems.append(f"Suspicious single-result paging: {rel}")
kolada = ROOT / "02 - Statistik & samhällsdata" / "Kolada"
for i in range(1, 15):
    if not any(p.name.startswith(f"{i:02d} ") and "  type: http" in p.read_text(encoding="utf-8") for p in kolada.rglob("*.yml")):
        problems.append(f"Missing Kolada request {i:02d}")
afr = list(ROOT.rglob("*Test Authentication.yml"))
if len(afr) != 1 or 'value: "{{scb_afr_api_key}}"' not in afr[0].read_text(encoding="utf-8"):
    problems.append("SCB secret reference missing")
print(f"Checked {len(files)} YAML files and 14 required Kolada request names.")
for item in problems:
    print(f"FAIL: {item}")
print("STATIC PASS (not a live API test)" if not problems else "STATIC FAIL")
sys.exit(1 if problems else 0)
