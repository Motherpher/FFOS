#!/usr/bin/env python3
"""FFOS optional DevOps model release integrity and downstream update queue.

This tool NEVER writes to another repository or decides Director activation.
A canonical model version bump generates an auditable downstream PR checklist.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RELEASE = "docs/operations/devops/model-release.json"
INDEX = "docs/operations/devops/HOOK-ESTATE-INDEX.json"
LOCAL_HOOK = ".ffos/devops-hook.json"
def is_normative(path: str) -> bool:
    root = "docs/operations/devops/"
    if not path.startswith(root):
        return False
    name = path[len(root):]
    return (name == "README.md"
            or name.startswith("HOOK-CONTRACT-v")
            or name.startswith("AMENDMENT-v")
            or name.startswith("CDX-REVIEW-INTERFACE-v"))

SHA = re.compile(r"^[a-f0-9]{40}$")
VERSION = re.compile(r"^\d+\.\d+(?:\.\d+)?$")


def fail(message: str) -> None:
    raise ValueError(message)


def read_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def read_git(*args: str, allow_missing: bool = False) -> str | None:
    p = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, capture_output=True, check=False
    )
    if p.returncode:
        if allow_missing:
            return None
        fail("git operation failed; no silent release verification")
    return p.stdout


def previous_release(sha: str) -> dict | None:
    if not SHA.fullmatch(sha) or sha == "0" * 40:
        return None
    raw = read_git("show", f"{sha}:{RELEASE}", allow_missing=True)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        fail("previous release metadata is not valid JSON")


def version_tuple(value: str) -> tuple[int, ...]:
    if not VERSION.fullmatch(value):
        fail("model version must be numeric major.minor[.patch]")
    return tuple(int(part) for part in value.split("."))


def changed_paths(base_sha: str) -> set[str]:
    if not SHA.fullmatch(base_sha):
        fail("base SHA must be a 40-character Git commit ID")
    output = read_git("diff", "--name-only", base_sha, "HEAD", "--")
    return set(output.splitlines())


def check_consistency(base_sha: str | None = None) -> dict:
    release = read_json(RELEASE)
    index = read_json(INDEX)
    example = read_json(release["hook_template"])
    local = read_json(LOCAL_HOOK)
    v = release["current_version"]
    version_tuple(v)
    if release.get("model_id") != "FFOS-DEVOPS-OM-001":
        fail("wrong canonical model ID")
    if release.get("activation") != "OFFER_ONLY":
        fail("optional activation changed without authority")
    if release.get("distribution") != "NO_AUTOMERGE_NO_CROSS_REPO_WRITES":
        fail("cross-repository writes not part of release guard mandate")
    model = (ROOT / release["model_path"]).read_text(encoding="utf-8")
    if "FFOS-DEVOPS-OM-001@" + v not in model:
        fail("model README version does not match release")
    if example["model"]["id"] != release["model_id"]:
        fail("hook template model ID mismatch")
    if local["model"]["id"] != release["model_id"]:
        fail("local FFOS hook model ID mismatch")
    if example["model"]["version"] != v or local["model"]["version"] != v:
        fail("template/local FFOS hook version is stale against release")
    if example["model"]["uri"] != release["model_uri"]:
        fail("canonical model URL differs from template")
    if local["model"]["uri"] != release["model_uri"]:
        fail("canonical model URL differs from local hook")
    if example["schema"] != release["hook_schema"] or local["schema"] != release["hook_schema"]:
        fail("hook schema does not match declared contract")
    for obj in (example, local):
        if (obj["activation"]["default"] != "OFFER_ONLY"
                or obj["activation"]["automatic_activation"] is not False
                or obj["activation"]["director_controlled"] is not True
                or obj["cdx_review"]["automatic_request"] is not False
                or obj["cdx_review"]["automatic_authorization"] is not False):
            fail("a hook would become mandatory, automatic, or grant CDX authority")
    installs = index.get("installed")
    if not isinstance(installs, list) or not installs:
        fail("hook estate index missing installations")
    names = [row["repository"] for row in installs]
    if len(set(names)) != len(names):
        fail("duplicate hook inventory repository")
    if any(row.get("hook_path") != LOCAL_HOOK for row in installs):
        fail("unexpected downstream hook path")
    if any(not VERSION.fullmatch(row.get("observed_model_version", "")) for row in installs):
        fail("bad observed version in hook inventory")
    exclusions = [x["repository"] for x in index.get("excluded", [])]
    if "Hybrismannen/Conductellence-" not in exclusions:
        fail("canonical CDX source exception missing")
    if any(name in exclusions for name in names):
        fail("repository included in both installed and excluded")
    # A historic repository rollout does not establish Barnombudet's independent
    # organisational approval. Keep the explicit exclusion visible and do not
    # generate future hook update work for that repository.
    barn = "Hybrismannen/Barnombudet"
    barn_exclusion = next(
        (item for item in index.get("excluded", [])
         if item.get("repository") == barn), None
    )
    if barn in names or not barn_exclusion:
        fail("Barnombudet must be excluded pending separate organisational adoption")
    if barn_exclusion.get("reason") != "LOCAL_ORGANISATIONAL_GOVERNANCE_NOT_ADOPTED":
        fail("Barnombudet exclusion reason missing or altered")
    if base_sha:
        changed = changed_paths(base_sha)
        before = previous_release(base_sha)
        if before:
            prior_v = before["current_version"]
            if version_tuple(v) < version_tuple(prior_v):
                fail("model version may not decrease")
            if any(is_normative(path) for path in changed) and v == prior_v:
                fail("canonical model content changed without a version bump")
    return {"version": v, "known_hooks": len(installs), "excluded": len(exclusions)}


def render_issue(version: str, sha: str, installations: list[dict]) -> str:
    pending = [
        row for row in installations
        if version_tuple(row["observed_model_version"]) < version_tuple(version)
    ]
    lines = [
        f"# FFOS DevOps Operating Model {version} — hook update rollout",
        "",
        f"Published model: https://github.com/Motherpher/FFOS/blob/{sha}/docs/operations/devops/README.md",
        f"Source commit: " + sha,
        "",
        "**Generated from the canonical model-release.json and last-observed estate index.**",
        "This is a version-update tracking issue, NOT activation of DevOps, CDX review, or permission to merge.",
        "The local hook model.version is a snapshot: a blob/main URL opens latest model text but does not update the local JSON field.",
        "",
        f"## Downstream PR checklist ({len(pending)} pending / {len(installations)} known)",
        "",
    ]
    if pending:
        for row in pending:
            name = row["repository"]
            last = row["observed_model_version"]
            lines.append(
                f"- [ ] [{name}](https://github.com/{name}) — observed hook {last}; "
                "open an owner-compatible PR, verify locally, and record merged SHA."
            )
    else:
        lines.append("No stale hook versions in the last-observed ledger. Confirm by live readback before closure.")
    lines += [
        "",
        "## Release workflow",
        "",
        "1. Review the new model's compatibility and update the hook TEMPLATE and canonical FFOS hook in its version-bump PR.",
        "2. After upstream merge, prepare non-destructive PRs for downstream hooks (one repository at a time).",
        "3. Preserve existing projects and CDX/AMA/HCC controls; no automatic rollouts or automatic merges.",
        "4. Verify exact default-branch hook JSON after each merge; update the observed-version estate index in a separate ordinary PR.",
        "5. Mark checklist entries complete only after source verification. CDX constitutional source remains excluded.",
        "",
        "Issue created automatically by the narrow FFOS model-version publication workflow.",
    ]
    return "\n".join(lines) + "\n"


def release_event(before_sha: str, json_output: Path, body_output: Path) -> None:
    info = check_consistency()
    previous = previous_release(before_sha)
    current = info["version"]
    bumped = previous is not None and version_tuple(current) > version_tuple(previous["current_version"])
    sha = read_git("rev-parse", "HEAD").strip()
    index = read_json(INDEX)
    result = {
        "schema": "ffos.devops.release-event/v1",
        "new_version": current,
        "previous_version": previous["current_version"] if previous else None,
        "new_release": bool(bumped),
        "release_sha": sha,
        "known_installations": len(index["installed"]),
    }
    json_output.parent.mkdir(parents=True, exist_ok=True)
    body_output.parent.mkdir(parents=True, exist_ok=True)
    json_output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    if bumped:
        body_output.write_text(render_issue(current, sha, index["installed"]), encoding="utf-8")
        print(f"NEW MODEL RELEASE {current}: created rollout issue body for {len(index['installed'])} known hooks")
    else:
        body_output.write_text("", encoding="utf-8")
        print("NO NEW MODEL RELEASE: no downstream issue needed")


def self_test() -> None:
    assert is_normative("docs/operations/devops/AMENDMENT-v1.2.md")
    assert not is_normative("docs/operations/devops/ROLLOUT-REPORT-v1.1.md")
    assert version_tuple("1.1") < version_tuple("1.2")
    assert version_tuple("1.1.1") > version_tuple("1.1")
    for invalid in ("latest", "v1.2", "1", "1.2-beta"):
        try:
            version_tuple(invalid)
            raise AssertionError("accepted invalid version: " + invalid)
        except ValueError:
            pass
    rows = [{"repository": "Motherpher/x", "observed_model_version": "1.1"}]
    body = render_issue("1.2", "a" * 40, rows)
    assert "- [ ] [Motherpher/x]" in body
    assert "not update the local JSON field" in body
    assert "0 pending" in render_issue("1.1", "a" * 40, rows)
    print("PASS: version ordering, invalid versions, pending/current hook queue generation")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--self-test", action="store_true")
    p.add_argument("--check", action="store_true")
    p.add_argument("--base-sha")
    p.add_argument("--release-event", action="store_true")
    p.add_argument("--before-sha")
    p.add_argument("--output")
    p.add_argument("--issue-body")
    args = p.parse_args()
    if args.self_test:
        self_test()
    if args.check:
        result = check_consistency(args.base_sha)
        print("PASS: optional model release consistency", json.dumps(result))
    if args.release_event:
        if not args.before_sha or not args.output or not args.issue_body:
            p.error("--release-event requires --before-sha --output --issue-body")
        release_event(args.before_sha, Path(args.output), Path(args.issue_body))
    if not (args.check or args.self_test or args.release_event):
        p.error("specify --check, --self-test or --release-event")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, json.JSONDecodeError) as exc:
        print("HOLD: " + str(exc), file=sys.stderr)
        raise SystemExit(1)
