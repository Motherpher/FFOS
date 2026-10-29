"""AMA 0.2 CANDIDATE: offline compositional validation; never authorizes execution.

Unchanged v1 validators remain authoritative for v1 manifests. This separate
validator proves that a proposed bundle has exact version/digest references,
bounded workflows, declared modules and non-escalating capability bindings.
It does not validate real identities, attest authorizations, or deploy agents.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

SCHEMAS = Path(__file__).resolve().parent.parent / "schemas" / "v0.2"
KIND = {"workflows": ("workflowId", "workflowRefs"),
        "commands": ("commandId", "commandRefs"),
        "capabilities": ("capabilityId", "capabilityRefs"),
        "profiles": ("profileId", "profileRefs")}
RANK = {n: i for i, n in enumerate(("E0_OBSERVE", "E1_INTERNAL_STATE",
    "E2_REPOSITORY_CHANGE", "E3_EXTERNAL_EFFECT", "E4_AUTHORITY_CHANGE"))}


def digest(obj):
    """Canonical JSON for contract data, not signed provenance or build attestations."""
    data = json.dumps(obj, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":")).encode("utf-8")
    return "sha256:" + hashlib.sha256(data).hexdigest()


def registry():
    sources = [json.loads(path.read_text(encoding="utf-8"))
               for path in sorted(SCHEMAS.glob("*.schema.json"))]
    for source in sources:
        Draft202012Validator.check_schema(source)
    reg = Registry().with_resources((source["$id"], Resource.from_contents(source))
                                     for source in sources)
    return reg, {p.stem.split(".")[0]: json.loads(p.read_text(encoding="utf-8"))
                 for p in SCHEMAS.glob("*.schema.json")}


def validate_bundle(bundle):
    """Return ordered error codes. Empty list = static contract only."""
    reg, schemas = registry()
    violations = []
    def fail(code):
        if code not in violations:
            violations.append(code)
    try:
        errors = list(Draft202012Validator(schemas["bundle"], registry=reg)
                      .iter_errors(bundle))
    except Exception:
        return ["INVALID_SCHEMA_GRAPH"]
    if errors:
        return ["SCHEMA:" + "/".join(str(x) for x in e.absolute_path)
                for e in sorted(errors, key=lambda e: str(e.absolute_path))]
    agent = bundle["agent"]
    owner = agent["agentId"]
    mscope = agent["mandate"]["scope"]
    modules = {}
    for module in agent["modules"]:
        if module["moduleId"] in modules:
            fail("DUPLICATE_MODULE")
        modules[module["moduleId"]] = module
    if len(set(agent["mandate"]["scope"])) != len(mscope):
        fail("DUPLICATE_MANDATE_SCOPE")
    def scope_ok(scope):
        return any(scope == m or scope.startswith(m.rstrip("/") + "/") for m in mscope)
    def index(rows, key):
        found = {}
        for row in rows:
            if row[key] in found:
                fail("DUPLICATE_DEFINITION:" + key)
            found[row[key]] = row
        return found
    def resolve(ref, rows, key):
        row = rows.get(ref["id"])
        if row is None:
            fail("UNRESOLVED_REFERENCE:" + ref["id"])
            return None
        if ref["version"] != row["version"]:
            fail("VERSION_MISMATCH:" + ref["id"])
        if ref["digest"] != digest(row):
            fail("DIGEST_MISMATCH:" + ref["id"])
        return row
    indices = {n: index(bundle[n], item[0]) for n, item in KIND.items()}
    adapters = index(bundle["toolAdapters"], "adapterId")
    for kind, (key, refs) in KIND.items():
        admitted = agent.get(refs, [])
        ids = [r["id"] for r in admitted]
        if len(ids) != len(set(ids)):
            fail("DUPLICATE_AGENT_REFERENCE:" + kind)
        if set(ids) != set(indices[kind]):
            fail("REFERENCE_COVERAGE_MISMATCH:" + kind)
        for r in admitted:
            resolve(r, indices[kind], key)
    for kind in ("workflows", "commands", "capabilities"):
        for row in bundle[kind]:
            if row["agentId"] != owner:
                fail("OWNER_MISMATCH:" + kind)
    for cap in bundle["capabilities"]:
        if RANK[cap["effectClass"]] > RANK[agent["effectCeiling"]]:
            fail("CAPABILITY_EXCEEDS_AGENT")
        for scope in cap["resourceScopes"]:
            if not scope_ok(scope):
                fail("CAPABILITY_OUTSIDE_MANDATE")
        ref = cap["adapterRef"]
        impl = resolve(ref, adapters, "adapterId")
        if impl and cap["effectClass"] not in impl["supportedEffects"]:
            fail("ADAPTER_EFFECT_MISMATCH")
        if impl and impl["status"] in ("SUSPENDED", "DEPRECATED"):
            fail("ADAPTER_NOT_ADMITTED")
        if cap.get("moduleId") and not modules.get(cap["moduleId"], {}).get("enabled", False):
            fail("MODULE_DISABLED")
    used_adapters = {c["adapterRef"]["id"] for c in bundle["capabilities"]}
    if set(adapters) != used_adapters:
        fail("ORPHAN_ADAPTER")
    for profile in bundle["profiles"]:
        module = modules.get(profile["moduleId"])
        if not module or not module["enabled"]:
            fail("PROFILE_MODULE_DISABLED")
        if module and profile["kind"] != module["kind"]:
            fail("PROFILE_KIND_MISMATCH")
    tokens = set()
    for cmd in bundle["commands"]:
        if cmd["token"] in tokens:
            fail("DUPLICATE_COMMAND_TOKEN")
        tokens.add(cmd["token"])
        resolve(cmd["workflowRef"], indices["workflows"], "workflowId")
    for wf in bundle["workflows"]:
        if RANK[wf["effectCeiling"]] > RANK[agent["effectCeiling"]]:
            fail("WORKFLOW_EXCEEDS_AGENT")
        deps = [r["id"] for r in wf["requiredCapabilities"]]
        if len(deps) != len(set(deps)):
            fail("DUPLICATE_WORKFLOW_CAPABILITY")
        for r in wf["requiredCapabilities"]:
            c = resolve(r, indices["capabilities"], "capabilityId")
            if c and RANK[c["effectClass"]] > RANK[wf["effectCeiling"]]:
                fail("CAPABILITY_EXCEEDS_WORKFLOW")
        step_ids = [s["stepId"] for s in wf["steps"]]
        if len(set(step_ids)) != len(step_ids):
            fail("DUPLICATE_STEP")
        steps = {s["stepId"]: s for s in wf["steps"]}
        if wf["entryStep"] not in steps:
            fail("MISSING_ENTRY_STEP")
        elif steps[wf["entryStep"]]["dependsOn"]:
            fail("ENTRY_HAS_DEPENDENCIES")
        if not set(wf["terminalStepIds"]) <= set(steps):
            fail("UNKNOWN_TERMINAL_STEP")
        parents = {}
        children = {k: set() for k in steps}
        for s in wf["steps"]:
            key = s["stepId"]
            parents[key] = s["dependsOn"]
            for parent in s["dependsOn"]:
                if parent not in steps:
                    fail("MISSING_STEP_DEPENDENCY")
                else:
                    children[parent].add(key)
            if s["kind"] == "ACTION":
                if "capabilityRef" not in s:
                    fail("ACTION_WITHOUT_CAPABILITY")
                elif s["capabilityRef"]["id"] not in deps:
                    fail("STEP_CAPABILITY_UNDECLARED")
                else:
                    resolve(s["capabilityRef"], indices["capabilities"], "capabilityId")
            elif "capabilityRef" in s:
                fail("NON_ACTION_HAS_CAPABILITY")
            if key in wf["terminalStepIds"] and s["kind"] != "END":
                fail("TERMINAL_NOT_END")
            if s["kind"] == "END" and key not in wf["terminalStepIds"]:
                fail("UNDECLARED_TERMINAL")
        visiting, visited = set(), set()
        def walk(node):
            if node in visiting:
                fail("CYCLIC_WORKFLOW")
                return
            if node in visited:
                return
            visiting.add(node)
            for child in children.get(node, set()):
                walk(child)
            visiting.remove(node)
            visited.add(node)
        if wf["entryStep"] in steps:
            walk(wf["entryStep"])
        if set(visited) != set(steps):
            fail("UNREACHABLE_STEP")
        for key in steps:
            if not children[key] and key not in wf["terminalStepIds"]:
                fail("DEAD_END_STEP")
        # Every linear or branch path in the declared DAG eventually terminates.
    if agent["lifecycleState"] == "ACTIVE":
        for kind in ("workflows", "capabilities", "toolAdapters", "profiles"):
            if any(row["status"] != "ACTIVE" for row in bundle[kind]):
                fail("INACTIVE_BINDING")
    for kind in ("workflows", "commands", "capabilities", "toolAdapters"):
        for item in bundle[kind]:
            if "inputSchema" in item:
                try:
                    Draft202012Validator.check_schema(item["inputSchema"])
                except Exception:
                    fail("INVALID_IO_SCHEMA")
            if "outputSchema" in item:
                try:
                    Draft202012Validator.check_schema(item["outputSchema"])
                except Exception:
                    fail("INVALID_IO_SCHEMA")
    # M1 task/effect shape and referential closure, not effect authorization.
    tasks = index(bundle.get("tasks", []), "taskId")
    effects = index(bundle.get("effects", []), "effectId")
    action_kind = {
        "E0_OBSERVE": "OBSERVE",
        "E1_INTERNAL_STATE": "STATE_MUTATION",
        "E2_REPOSITORY_CHANGE": "REPOSITORY_MUTATION",
        "E3_EXTERNAL_EFFECT": "EXTERNAL_ACTION",
        "E4_AUTHORITY_CHANGE": "AUTHORITY_CHANGE",
    }
    for task in tasks.values():
        agent_ref = task["agentRef"]
        if (agent_ref["id"] != owner or
                agent_ref["version"] != agent["agentVersion"] or
                agent_ref["digest"] != digest(agent)):
            fail("TASK_AGENT_MISMATCH")
        resolve(task["workflowRef"], indices["workflows"], "workflowId")
        resolve(task["commandRef"], indices["commands"], "commandId")
        command = indices["commands"].get(task["commandRef"]["id"])
        if command and command["workflowRef"] != task["workflowRef"]:
            fail("TASK_COMMAND_WORKFLOW_MISMATCH")
        for scope in task["requestedScopes"]:
            if not scope_ok(scope):
                fail("TASK_OUTSIDE_MANDATE")
    for effect in effects.values():
        task = resolve(effect["taskRef"], tasks, "taskId")
        cap = resolve(effect["capabilityRef"], indices["capabilities"], "capabilityId")
        if task and task["runId"] != effect["runId"]:
            fail("EFFECT_RUN_MISMATCH")
        if cap:
            if effect["effectClass"] != cap["effectClass"]:
                fail("EFFECT_CLASS_MISMATCH")
            if not any(effect["resourceScope"] == scope or
                       effect["resourceScope"].startswith(scope.rstrip("/") + "/")
                       for scope in cap["resourceScopes"]):
                fail("EFFECT_OUTSIDE_CAPABILITY_SCOPE")
        if task and not any(
                effect["resourceScope"] == scope or
                effect["resourceScope"].startswith(scope.rstrip("/") + "/")
                for scope in task["requestedScopes"]):
            fail("EFFECT_OUTSIDE_TASK_SCOPE")
        if effect["actionKind"] != action_kind[effect["effectClass"]]:
            fail("EFFECT_ACTION_KIND_MISMATCH")
        # A validated effect description NEVER proves its authorization.
    for e in bundle.get("runEvents", []):
        if e["agentRef"]["id"] != owner or e["agentRef"]["version"] != agent["agentVersion"]:
            fail("RUN_AGENT_MISMATCH")
        if e["agentRef"]["digest"] != digest(agent):
            fail("RUN_AGENT_DIGEST_MISMATCH")
        resolve(e["workflowRef"], indices["workflows"], "workflowId")
    for e in bundle.get("evidenceRecords", []):
        if e["agentRef"]["id"] != owner or e["agentRef"]["digest"] != digest(agent):
            fail("EVIDENCE_AGENT_MISMATCH")
    return sorted(set(violations))


def migration_review(old_v1, new_vnext):
    """Advisory ONLY: never auto-migrate or accept an old manifest."""
    agent = new_vnext["agent"]
    reasons = ["NEW_CONTRACT_FAMILY_REQUIRES_HUMAN_ACCEPTANCE"]
    if old_v1["agentId"] != agent["agentId"]:
        reasons.append("AGENT_IDENTITY_CHANGED")
    if old_v1["effectCeiling"] != agent["effectCeiling"]:
        reasons.append("EFFECT_CEILING_CHANGED")
    if old_v1["mandate"]["scope"] != agent["mandate"]["scope"]:
        reasons.append("MANDATE_SCOPE_CHANGED")
    if old_v1["runtimeClass"] != agent["runtimeClass"]:
        reasons.append("RUNTIME_CLASS_CHANGED")
    if set(old_v1["workflows"]) != {r["id"] for r in agent["workflowRefs"]}:
        reasons.append("WORKFLOW_BINDINGS_CHANGED")
    if set(old_v1["capabilities"]) != {r["id"] for r in agent["capabilityRefs"]}:
        reasons.append("CAPABILITY_BINDINGS_CHANGED")
    return {"status": "MIGRATION_REVIEW_REQUIRED", "reasons": reasons,
            "automatic_activation": False, "v1_schema_preserved": True}


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("bundle")
    p.add_argument("--report")
    a = p.parse_args()
    obj = json.loads(Path(a.bundle).read_text(encoding="utf-8"))
    errors = validate_bundle(obj)
    data = {"assurance": "STATIC_CONTRACT_ONLY",
            "status": "STATIC_PASS_CANDIDATE" if not errors else "FAIL",
            "errors": errors,
            "not_proven": ["C4_RUNTIME", "C5_LIVE_EVIDENCE", "AUTHORITY_BINDING",
                           "INDEPENDENT_ACCEPTANCE", "PRODUCTION_DEPLOYMENT"]}
    rendered = json.dumps(data, indent=2) + "\n"
    if a.report:
        Path(a.report).write_text(rendered, encoding="utf-8")
    else:
        print(rendered)
    raise SystemExit(1 if errors else 0)
