"""AMA module migration preflight: non-authorizing, portable, fail-closed.

For 32 canonical modules only. Evaluates proposed configuration changes; does not
migrate state, sign approvals, instantiate agents, or infer host readiness.
"""
from __future__ import annotations
import re

_VERSION = re.compile(r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?$")


def assess_transition(inventory: dict, before: dict, after: dict) -> dict:
    errors = []
    changes = []
    definitions = {m.get("id"): m for m in inventory.get("modules", []) if isinstance(m, dict)}
    if len(definitions) != 32 or set(m.get("requirement") for m in definitions.values()) - {"CORE", "OPTIONAL"}:
        errors.append("CANONICAL_INVENTORY_INVALID")

    def index(config, side):
        if not isinstance(config, dict) or not isinstance(config.get("modules"), list):
            errors.append("INVALID_CONFIGURATION:" + side)
            return {}
        rows = config["modules"]
        ids = [r.get("id") if isinstance(r, dict) else None for r in rows]
        if len(rows) != 32 or len(set(ids)) != len(ids) or set(ids) != set(definitions):
            errors.append("NONCANONICAL_MODULE_SET:" + side)
        return {r["id"]: r for r in rows if isinstance(r, dict) and isinstance(r.get("id"), str)}

    old = index(before, "before")
    new = index(after, "after")
    for name, definition in definitions.items():
        a = old.get(name)
        b = new.get(name)
        if not a or not b:
            errors.append("MISSING_MODULE:" + name)
            continue
        for label, row in (("before", a), ("after", b)):
            if type(row.get("enabled")) is not bool:
                errors.append("INVALID_ENABLED:" + label + ":" + name)
            if definition["requirement"] == "CORE" and row.get("enabled") is not True:
                errors.append("CORE_CANNOT_BE_DISABLED:" + label + ":" + name)
            if row.get("enabled") is True and not (
                isinstance(row.get("config_version"), str) and _VERSION.fullmatch(row["config_version"])
            ):
                errors.append("UNPINNED_MODULE_VERSION:" + label + ":" + name)
            if row.get("enabled") is True and not isinstance(row.get("host_obligations"), list):
                errors.append("HOST_OBLIGATIONS_MISSING:" + label + ":" + name)
        if b.get("enabled") and definition["requirement"] == "OPTIONAL" and not a.get("enabled"):
            if not isinstance(b.get("approval_ref"), str) or not b["approval_ref"].strip():
                errors.append("OPTIONAL_ENABLE_APPROVAL_MISSING:" + name)
            if b.get("approval_verified") is not True:
                errors.append("OPTIONAL_ENABLE_APPROVAL_UNVERIFIED:" + name)
        required = set(definition.get("remaining_host_obligations", []))
        obligations = b.get("host_obligations")
        if b.get("enabled") and isinstance(obligations, list):
            if not required.issubset(set(str(x) for x in obligations)):
                errors.append("HOST_OBLIGATION_DROPPED:" + name)
        if a.get("enabled") and not b.get("enabled"):
            changes.append({"module": name, "change": "DISABLE", "requires": "STATE_RETIREMENT_REVIEW"})
        if not a.get("enabled") and b.get("enabled"):
            changes.append({"module": name, "change": "ENABLE", "requires": "INDEPENDENT_ADMISSION_REVIEW"})
        av, bv = a.get("config_version"), b.get("config_version")
        if a.get("enabled") and b.get("enabled") and av != bv:
            if not isinstance(av, str) or not isinstance(bv, str) or not _VERSION.fullmatch(av) or not _VERSION.fullmatch(bv):
                errors.append("VERSION_NOT_COMPARABLE:" + name)
            else:
                old_n = tuple(map(int, av.split("-")[0].split(".")))
                new_n = tuple(map(int, bv.split("-")[0].split(".")))
                if new_n < old_n:
                    errors.append("VERSION_ROLLBACK_REVIEW_REQUIRED:" + name)
                if new_n[0] != old_n[0]:
                    changes.append({"module": name, "change": "BREAKING_VERSION", "requires": "EXPLICIT_MIGRATION_AND_COMPATIBILITY_EVIDENCE"})
                else:
                    changes.append({"module": name, "change": "VERSION_CHANGE", "requires": "REGRESSION_AND_COMPATIBILITY_EVIDENCE"})
        for field in ("authority_scope", "effect_ceiling", "permission_refs"):
            if a.get(field) != b.get(field):
                changes.append({"module": name, "change": field.upper(), "requires": "INDEPENDENT_AUTHORITY_REVIEW"})
    return {
        "schema": "ama.fin02.module-migration-preflight/v1",
        "status": "HOLD" if errors else "REVIEW_REQUIRED" if changes else "NO_CHANGE",
        "errors": sorted(set(errors)), "changes": changes,
        "migration_executed": False, "director_accepted": False,
        "host_verified": False, "agent_constructed": False,
        "activation_authorized": False,
    }
