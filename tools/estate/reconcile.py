#!/usr/bin/env python3
"""FF-GH-WP04: deterministic, read-only estate snapshot reconciler.

This program NEVER calls GitHub APIs and NEVER changes a Project or source Issue.
The only write is an explicitly supplied local report path. It consumes dated,
authenticated export snapshots and raises integrity exceptions for unsafe states.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

ADOPTION_SCHEMA = "ff-gh-wp04-adoption-register-v1"
PROJECT_SCHEMA = "ff-gh-projects-v2-snapshot-v1"
SEVERITIES = ("BLOCKER", "WARNING", "INFO")


class SnapshotError(ValueError):
    """Malformed or incompatible input; no report may be trusted."""


def _object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise SnapshotError(f"{label} must be an object")
    return value


def _entries(value: Any, label: str) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not all(isinstance(x, dict) for x in value):
        raise SnapshotError(f"{label} must be a list of objects")
    return value


def _tally(items: list[dict[str, Any]], field: str) -> dict[str, int]:
    values = ((i.get("fields") or {}).get(field) or "UNSPECIFIED" for i in items)
    return dict(sorted(Counter(values).items()))


def _alert(level: str, code: str, detail: str, source: str = "") -> dict[str, str]:
    return {"severity": level, "code": code, "detail": detail, "source": source}


def audit(adoption: dict[str, Any], project: dict[str, Any],
          previous: dict[str, Any] | None = None) -> dict[str, Any]:
    adoption = _object(adoption, "adoption")
    project = _object(project, "project")
    if adoption.get("schema") != ADOPTION_SCHEMA:
        raise SnapshotError("Unknown adoption schema")
    if project.get("schema") != PROJECT_SCHEMA:
        raise SnapshotError("Unknown portfolio schema")
    repos = _entries(adoption.get("rows"), "adoption.rows")
    items = _entries(project.get("items"), "project.items")
    if not repos:
        raise SnapshotError("Missing repository inventory")
    repo_names = [x.get("repository") for x in repos]
    if not all(isinstance(x, str) and "/" in x for x in repo_names):
        raise SnapshotError("Invalid repository names")
    if len(repo_names) != len(set(repo_names)):
        raise SnapshotError("Duplicate repository registration")
    source_urls = [x.get("source_url") for x in items]
    if not all(isinstance(x, str) and x.startswith("https://github.com/") for x in source_urls):
        raise SnapshotError("Invalid source Issue URLs")
    if len(source_urls) != len(set(source_urls)):
        raise SnapshotError("Duplicate Project items for the same source URL")
    if project.get("source_project") != "https://github.com/orgs/Motherpher/projects/2":
        raise SnapshotError("Unexpected Project identity")
    if project.get("visibility") not in ("private", "public"):
        raise SnapshotError("Unknown Project visibility")
    if project.get("metrics", {}).get("items") != len(items):
        raise SnapshotError("Project item count does not reconcile")
    alerts: list[dict[str, str]] = []
    known = set(repo_names)
    if project["visibility"] != "private":
        alerts.append(_alert("BLOCKER", "PROJECT_NOT_PRIVATE",
                             "The cross-repository estate Project is not private"))
    workflows = _entries(project.get("workflows", []), "project.workflows")
    auto_close = [w for w in workflows if w.get("name") == "Auto-close issue"]
    if len(auto_close) != 1 or auto_close[0].get("enabled") is not False:
        alerts.append(_alert("BLOCKER", "AUTO_CLOSE_UNSAFE",
                             "Auto-close issue is enabled or not independently verified OFF"))
    for row in items:
        source = str(row.get("source_url", ""))
        if row.get("repository") not in known:
            alerts.append(_alert("BLOCKER", "UNREGISTERED_REPOSITORY",
                                 "Portfolio source is missing from adoption register", source))
        fields = _object(row.get("fields", {}), "item.fields")
        stage = fields.get("Work Stage")
        gate = fields.get("Authority Gate")
        evidence = fields.get("Evidence Reference")
        if gate == "Approved (Source Recorded)" and (
            not isinstance(evidence, str) or not evidence.startswith("https://github.com/")
        ):
            alerts.append(_alert("BLOCKER", "ACCEPTANCE_WITHOUT_SOURCE",
                                 "Approval projection lacks a source evidence URL", source))
        if stage == "Accepted" and gate != "Approved (Source Recorded)":
            alerts.append(_alert("BLOCKER", "ACCEPTED_WITHOUT_GATE",
                                 "Accepted Work Stage lacks an approved source-based gate", source))
        if stage == "Accepted" and not evidence:
            alerts.append(_alert("BLOCKER", "ACCEPTED_WITHOUT_EVIDENCE",
                                 "Accepted Work Stage lacks a supporting source", source))
        if fields.get("Status") == "Done" and stage not in ("Accepted", "Closed"):
            alerts.append(_alert("INFO", "DONE_NOT_ACCEPTANCE",
                                 "GitHub native Done is not a Director decision", source))
        if row.get("source_state") == "CLOSED" and stage in ("Blocked", "Active"):
            alerts.append(_alert("WARNING", "SOURCE_STAGE_DIVERGENCE",
                                 "Closed source Issue has an active/blocked Project stage", source))
        if not fields.get("Programme"):
            alerts.append(_alert("WARNING", "UNCLASSIFIED_PROGRAMME",
                                 "Portfolio item lacks Programme classification", source))
        if not fields.get("Canonical Object ID"):
            alerts.append(_alert("WARNING", "NO_CANONICAL_ID",
                                 "No canonical ID recorded; native source URL remains the identity", source))
    deltas: dict[str, Any] | None = None
    if previous is not None:
        previous = _object(previous, "previous")
        if previous.get("schema") != PROJECT_SCHEMA:
            raise SnapshotError("Previous snapshot has incompatible schema")
        older = {x["source_url"]: x for x in _entries(previous.get("items"), "previous.items")}
        current = {x["source_url"]: x for x in items}
        added = sorted(set(current) - set(older))
        removed = sorted(set(older) - set(current))
        changed = sorted(
            k for k in set(older) & set(current)
            if older[k].get("fields") != current[k].get("fields")
            or older[k].get("source_state") != current[k].get("source_state")
        )
        deltas = {"added": added, "removed": removed, "changed": changed}
        if removed:
            alerts.append(_alert("WARNING", "SOURCE_REMOVALS_REVIEW",
                                 "Portfolio items disappeared; verify scope/archiving explicitly"))
    totals = {"BLOCKER": 0, "WARNING": 0, "INFO": 0}
    for alert in alerts:
        totals[alert["severity"]] += 1
    report = {
        "schema": "ff-gh-wp04-reconciliation-report-v1",
        "source_dates": {
            "adoption": adoption.get("as_of"),
            "project": project.get("captured_date")
        },
        "mode": "READ_ONLY_OFFLINE",
        "status": "HOLD" if totals["BLOCKER"] else "PASS_WITH_WARNINGS" if totals["WARNING"] else "PASS",
        "observations": {
            "registered_repositories": len(repos),
            "project_items": len(items),
            "linked_repositories": len(set(x.get("repository") for x in items)),
            "source_issue_state": dict(sorted(Counter(x.get("source_state", "UNKNOWN") for x in items).items())),
            "programme": _tally(items, "Programme"),
            "work_stage": _tally(items, "Work Stage"),
            "authority_gate": _tally(items, "Authority Gate")
        },
        "alerts_by_severity": totals,
        "alerts": alerts,
        "delta": deltas,
        "limitations": [
            "Snapshot check only; no live API, role-specific access audit or CI verification.",
            "PASS does not certify a release, deployment, agent, policy runtime or Director acceptance.",
            "Source Issue and Project metadata may change after the captured date.",
            "Automatic intake, cross-owner write permissions and disaster recovery are not tested."
        ]
    }
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--adoption", type=Path, required=True)
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--previous", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        adoption = json.loads(args.adoption.read_text(encoding="utf-8"))
        project = json.loads(args.project.read_text(encoding="utf-8"))
        previous = json.loads(args.previous.read_text(encoding="utf-8")) if args.previous else None
        result = audit(adoption, project, previous)
    except (OSError, json.JSONDecodeError, SnapshotError) as exc:
        print(f"INPUT_HOLD: {type(exc).__name__}: {exc}")
        return 3
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    counts = result["alerts_by_severity"]
    print(
        f"{result['status']} — {result['observations']['registered_repositories']} repos, "
        f"{result['observations']['project_items']} items; "
        f"{counts['BLOCKER']} blockers / {counts['WARNING']} warnings."
    )
    return 2 if result["status"] == "HOLD" else 0


if __name__ == "__main__":
    raise SystemExit(main())
