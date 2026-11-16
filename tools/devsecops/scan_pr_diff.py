#!/usr/bin/env python3
"""Read-only high-confidence credential scan of PR-added text lines.

This is one narrow defense-in-depth control. It does NOT inspect history,
binary files, deployments, all secrets or runtime credential safety.
No match text is ever printed or included in the JSON report.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

SCHEMA = "ffos.devsecops.pr-secret-diff/v1"
SHA = re.compile(r"^[0-9a-fA-F]{40}$")
HUNK = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")
PATTERNS = {
    "PRIVATE_KEY_HEADER": re.compile(r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----"),
    "GITHUB_CLASSIC_TOKEN": re.compile(r"\bgh[opusr]_[A-Za-z0-9]{36,}\b"),
    "GITHUB_FINE_GRAINED_TOKEN": re.compile(r"\bgithub_pat_[A-Za-z0-9_]{30,}\b"),
    "OPENAI_SECRET_KEY": re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b"),
    "SLACK_TOKEN": re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "AWS_ACCESS_KEY_ID": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
}


def scan_diff(diff_text: str) -> list[dict[str, object]]:
    """Return path + new-file line + indicator only; never store matched material."""
    results: list[dict[str, object]] = []
    path: str | None = None
    new_line: int | None = None
    for record in diff_text.splitlines():
        if record.startswith("diff --git "):
            path = None
            new_line = None
        elif record.startswith("+++ b/"):
            path = record[6:]
        elif record.startswith("+++ /dev/null"):
            path = None
        elif record.startswith("@@ "):
            match = HUNK.match(record)
            new_line = int(match.group(1)) if match else None
        elif record.startswith("+") and not record.startswith("+++"):
            if path is not None and new_line is not None:
                for category, pattern in PATTERNS.items():
                    if pattern.search(record[1:]):
                        results.append({"path": path, "line": new_line, "indicator": category})
            if new_line is not None:
                new_line += 1
        elif record.startswith(" ") and new_line is not None:
            new_line += 1
    return results


def self_test() -> None:
    secret = "ghp_" + ("A" * 36)
    diff = (
        "diff --git a/example.txt b/example.txt\n"
        "--- a/example.txt\n"
        "+++ b/example.txt\n"
        "@@ -0,0 +1,2 @@\n"
        "+safe = true\n"
        "+credential = " + secret + "\n"
    )
    result = scan_diff(diff)
    assert result == [{"path": "example.txt", "line": 2, "indicator": "GITHUB_CLASSIC_TOKEN"}]
    assert secret not in json.dumps(result)
    assert scan_diff(diff.replace(secret, "not-a-token")) == []
    assert scan_diff("diff --git a/x b/x\n--- a/x\n+++ /dev/null\n@@ -1 +0,0 @@\n-old\n") == []
    assert scan_diff("diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -0,0 +1 @@\n+hello\n") == []
    for indicator, probe in (
        ("PRIVATE_KEY_HEADER", "-----BEGIN " + "RSA PRIVATE KEY-----"),
        ("GITHUB_FINE_GRAINED_TOKEN", "github_pat_" + "B" * 32),
        ("OPENAI_SECRET_KEY", "sk-proj-" + "C" * 40),
        ("SLACK_TOKEN", "xoxb-" + "D" * 28),
        ("AWS_ACCESS_KEY_ID", "AKIA" + "E" * 16),
    ):
        found = scan_diff(
            "diff --git a/p b/p\n--- a/p\n+++ b/p\n@@ -0,0 +1 @@\n+" + probe + "\n"
        )
        assert found and found[0]["indicator"] == indicator, indicator
        assert probe not in json.dumps(found)
    print("PASS: scoped high-confidence scanner positive/negative tests; no secret values in reports")


def git_diff(base: str, head: str) -> str:
    if not SHA.fullmatch(base):
        raise ValueError("Base must be a full Git commit SHA")
    if head != "HEAD" and not SHA.fullmatch(head):
        raise ValueError("Head must be HEAD or a full Git commit SHA")
    completed = subprocess.run(
        ["git", "diff", "--no-ext-diff", "--no-color", "--unified=0", base, head, "--"],
        text=True, capture_output=True, check=False
    )
    if completed.returncode:
        raise RuntimeError("git diff failed (raw diff deliberately suppressed)")
    return completed.stdout


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base")
    parser.add_argument("--head", default="HEAD")
    parser.add_argument("--output")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        if not args.base:
            return 0
    if not args.base or not args.output:
        parser.error("--base and --output are required for a PR diff scan")
    findings = scan_diff(git_diff(args.base, args.head))
    report = {
        "schema": SCHEMA,
        "scope": "added_text_lines_in_git_diff_only",
        "base_sha": args.base,
        "head": args.head,
        "result": "HOLD_CREDENTIAL_INDICATOR" if findings else "NO_HIGH_CONFIDENCE_INDICATOR_DETECTED",
        "findings": findings,
        "limitations": [
            "Does not establish that all credentials or secrets are absent",
            "Does not inspect unchanged files, Git history or binary additions",
            "No branch-merge enforcement unless an owner configures this check as required",
        ],
    }
    destination = Path(args.output)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    if findings:
        print(f"HOLD: {len(findings)} high-confidence credential indicator(s) in PR additions")
        for f in findings:
            print(f"  {f['path']}:{f['line']} — {f['indicator']} (value redacted)")
        return 1
    print("NO DETECTION in PR-added text (not proof of secret absence)")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError) as ex:
        print(f"HOLD: {ex}", file=sys.stderr)
        raise SystemExit(2)
