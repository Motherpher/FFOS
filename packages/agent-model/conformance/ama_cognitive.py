"""AMA M3 candidate cognition/context/memory preflight. NEVER executes a model or memory store.

This validates declarations and synthetic provenance metadata only. A passing
result does not prove prompt origin, content truth, model reliability, deletion,
retrieval honesty, source authentication, or authority. Those need a host.
"""
from __future__ import annotations
from datetime import datetime, timezone
from jsonschema import Draft202012Validator, FormatChecker
from ama_vnext import registry, digest, validate_bundle


GROUPS = {
    "modelProfiles": ("model-profile", "profileId"),
    "instructionPackages": ("instruction-package", "packageId"),
    "planningProfiles": ("planning-profile", "profileId"),
    "contextPolicies": ("context-policy", "policyId"),
    "memoryProfiles": ("memory-profile", "profileId"),
    "memoryEntries": ("memory-entry", "entryId"),
    "retrievalPolicies": ("retrieval-policy", "policyId"),
    "cognitiveBindings": ("cognitive-binding", "bindingId"),
}


def _time(s):
    v = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if v.tzinfo is None:
        raise ValueError("TIMEZONE_REQUIRED")
    return v.astimezone(timezone.utc)


def _scope_inside(child, parent):
    return child == parent or child.startswith(parent.rstrip("/") + "/")


def _finish(errors):
    return {"status": "REJECTED" if errors else "STATIC_COGNITIVE_ELIGIBLE",
            "errors": sorted(set(errors)), "runtime_authorized": False,
            "evidence_verified": False, "external_verification_required": True,
            "unverified": ["MODEL_AND_INSTRUCTION_PROVENANCE",
                           "PLANNING_RUNTIME_BEHAVIOR", "RETRIEVAL_SOURCE_TRUST",
                           "MEMORY_WRITE_AND_ERASURE_ENFORCEMENT",
                           "CONTEXT_SUMMARY_SEMANTIC_FIDELITY",
                           "INDEPENDENT_EVALUATION_AND_POLICY"]}


def validate_cognitive_contract(bundle, *, at):
    """Fail-closed off-line validation of conditional module semantic links."""
    errors = []
    def fail(code):
        errors.append(code)
    try:
        now = _time(at)
    except (ValueError, TypeError, AttributeError):
        return _finish(["INVALID_HOST_TIME"])
    baseline = validate_bundle(bundle)
    if baseline:
        return _finish(["INVALID_COMPOSITE_BUNDLE"] + baseline)
    reg, schemas = registry()
    for name, (schema_name, _) in GROUPS.items():
        schema = schemas[schema_name]
        for row in bundle.get(name, []):
            v = Draft202012Validator(schema, registry=reg,
                                    format_checker=FormatChecker())
            if list(v.iter_errors(row)):
                fail("SCHEMA:" + name)
    if errors:
        return _finish(errors)
    modules = {m["moduleId"]: m for m in bundle["agent"]["modules"]}
    def enabled(kind):
        return {k for k, m in modules.items() if m["kind"] == kind and m["enabled"]}
    indices = {}
    for name, (_, id_field) in GROUPS.items():
        rows = bundle.get(name, [])
        index = {r[id_field]: r for r in rows}
        indices[name] = index
        if len(index) != len(rows):
            fail("DUPLICATE_" + name.upper())
    def resolve(ref, collection):
        target = indices[collection].get(ref["id"])
        if target is None:
            fail("UNRESOLVED_" + collection.upper())
            return None
        if target["version"] != ref["version"]:
            fail("VERSION_MISMATCH_" + collection.upper())
        if digest(target) != ref["digest"]:
            fail("DIGEST_MISMATCH_" + collection.upper())
        return target
    def module_ok(row, kind):
        module = modules.get(row["moduleId"])
        if module is None or not module["enabled"] or module["kind"] != kind:
            fail("PROFILE_MODULE_NOT_ENABLED")
        if row.get("status") in ("SUSPENDED", "DEPRECATED", "DRAFT"):
            fail("PROFILE_NOT_ADMITTED")
    ownership = {"modelProfiles": "REASONING", "instructionPackages": "REASONING",
                 "planningProfiles": "REASONING", "contextPolicies": "REASONING",
                 "memoryProfiles": "MEMORY", "retrievalPolicies": "RETRIEVAL"}
    for collection, kind in ownership.items():
        for row in indices[collection].values():
            module_ok(row, kind)
    reasoning = enabled("REASONING")
    memory = enabled("MEMORY")
    retrieval = enabled("RETRIEVAL")
    bindings = bundle.get("cognitiveBindings", [])
    if reasoning and (len(reasoning) != 1 or len(bindings) != 1):
        fail("REASONING_BINDING_REQUIRED")
    if not reasoning and (bindings or any(indices[k] for k in (
            "modelProfiles", "instructionPackages",
            "planningProfiles", "contextPolicies"))):
        fail("REASONING_DISABLED")
    if memory and (len(memory) != 1 or len(indices["memoryProfiles"]) != 1):
        fail("MEMORY_PROFILE_REQUIRED")
    if not memory and (indices["memoryProfiles"] or indices["memoryEntries"]):
        fail("MEMORY_DISABLED")
    if retrieval and (len(retrieval) != 1 or len(indices["retrievalPolicies"]) != 1):
        fail("RETRIEVAL_POLICY_REQUIRED")
    if not retrieval and indices["retrievalPolicies"]:
        fail("RETRIEVAL_DISABLED")
    agent = bundle["agent"]
    if bindings:
        binding = bindings[0]
        ar = binding["agentRef"]
        if (ar["id"] != agent["agentId"]
                or ar["version"] != agent["agentVersion"]
                or ar["digest"] != digest(agent)):
            fail("COGNITIVE_AGENT_REF_MISMATCH")
        if binding["reasoningModuleId"] not in reasoning:
            fail("REASONING_MODULE_MISMATCH")
        selected = [("modelRef", "modelProfiles"), ("instructionRef", "instructionPackages"),
                    ("planningRef", "planningProfiles"), ("contextRef", "contextPolicies"),
                    ("memoryRef", "memoryProfiles"), ("retrievalRef", "retrievalPolicies")]
        bound = {}
        for ref_name, coll in selected:
            if ref_name in binding:
                bound[coll] = resolve(binding[ref_name], coll)
        for coll in ("modelProfiles", "instructionPackages", "planningProfiles",
                     "contextPolicies"):
            if set(indices[coll]) != ({bound[coll][GROUPS[coll][1]]}
                                     if bound.get(coll) else set()):
                fail("UNBOUND_PROFILE:" + coll)
        if bool(binding.get("memoryRef")) != bool(memory):
            fail("MEMORY_BINDING_MISMATCH")
        if bool(binding.get("retrievalRef")) != bool(retrieval):
            fail("RETRIEVAL_BINDING_MISMATCH")
        model = bound.get("modelProfiles")
        plan = bound.get("planningProfiles")
        context = bound.get("contextPolicies")
        if model and context:
            if (context["maxAssembledTokens"] + context["reservedOutputTokens"]
                    > model["maxContextTokens"]):
                fail("CONTEXT_EXCEEDS_MODEL_WINDOW")
            if context["reservedOutputTokens"] > model["maxOutputTokens"]:
                fail("OUTPUT_EXCEEDS_MODEL_LIMIT")
            if "MEMORY" in context["contextSources"] and not memory:
                fail("MEMORY_SOURCE_DISABLED")
            if "RETRIEVED_CONTENT" in context["contextSources"] and not retrieval:
                fail("RETRIEVAL_SOURCE_DISABLED")
            if context["compaction"]["enabled"] and (
                    context["compaction"]["maxSummaryTokens"] >
                    context["maxAssembledTokens"]):
                fail("COMPACTION_BUDGET_INVALID")
        for instr in indices["instructionPackages"].values():
            layers = instr["layers"]
            priorities = [i["priority"] for i in layers]
            ids = [i["layerId"] for i in layers]
            if len(set(priorities)) != len(priorities) or len(set(ids)) != len(ids):
                fail("DUPLICATE_INSTRUCTION_PRIORITY")
            expected = {"SYSTEM": 0, "DEVELOPER": 1, "USER": 2}
            for layer in layers:
                if layer["priority"] != expected[layer["role"]]:
                    fail("INSTRUCTION_PRIORITY_MISMATCH")
        if model:
            for fallback in model["allowedFallbackRefs"]:
                if fallback["id"] == model["profileId"]:
                    fail("MODEL_FALLBACK_SELF_LOOP")
                resolve(fallback, "modelProfiles")
                # Multiple fallback profiles must still be registered explicitly;
                # they are alternatives and not permitted to execute automatically.
        if plan:
            nodes = plan["nodes"]
            names = [x["nodeId"] for x in nodes]
            if len(set(names)) != len(names):
                fail("DUPLICATE_PLAN_NODE")
            if len(nodes) > plan["maxTaskHorizonSteps"]:
                fail("PLAN_EXCEEDS_HORIZON")
            if plan["budgets"]["maxIterations"] > plan["maxTaskHorizonSteps"]:
                fail("ITERATION_BUDGET_EXCEEDS_HORIZON")
            if plan["budgets"]["maxModelTokens"] < model["maxOutputTokens"] if model else False:
                fail("PLAN_MODEL_BUDGET_INSUFFICIENT")
            valid = set(names)
            nodes_by_id = {n["nodeId"]: n for n in nodes}
            visited, active = set(), set()
            def visit(key):
                if key in active:
                    fail("CYCLIC_PLAN")
                    return
                if key in visited:
                    return
                active.add(key)
                for dep in nodes_by_id[key]["dependsOn"]:
                    if dep not in valid:
                        fail("UNKNOWN_PLAN_DEPENDENCY")
                    else:
                        visit(dep)
                active.remove(key)
                visited.add(key)
            for node in nodes:
                visit(node["nodeId"])
                if "capabilityRef" in node:
                    ref = node["capabilityRef"]
                    cap = next((c for c in bundle["capabilities"]
                                if c["capabilityId"] == ref["id"]), None)
                    if cap is None or cap["version"] != ref["version"] or digest(cap) != ref["digest"]:
                        fail("UNDECLARED_PLAN_CAPABILITY")
            if not {"BUDGET_EXHAUSTED", "POLICY_DENIAL", "CANCELLED"}.issubset(
                    set(plan["stopConditions"])):
                fail("MANDATORY_PLAN_STOPS_MISSING")
    for profile in indices["memoryProfiles"].values():
        for scope in profile["allowedScopes"]:
            if not any(_scope_inside(scope, g) for g in agent["mandate"]["scope"]):
                fail("MEMORY_SCOPE_EXCEEDS_MANDATE")
        if "DOMAIN_DATA" in profile["storeTypes"]:
            # Domain data is authoritative only through an external source,
            # not by promoting learned memories into a source of truth.
            fail("AUTHORITATIVE_DATA_CANNOT_BE_LEARNED_MEMORY")
    for entry in indices["memoryEntries"].values():
        profile = resolve(entry["profileRef"], "memoryProfiles")
        if not profile:
            continue
        if entry["storeType"] not in profile["storeTypes"]:
            fail("MEMORY_STORE_TYPE_MISMATCH")
        if not any(_scope_inside(entry["scope"], p) for p in profile["allowedScopes"]):
            fail("MEMORY_ENTRY_SCOPE_INVALID")
        try:
            created, expires = _time(entry["createdAt"]), _time(entry["expiresAt"])
            if expires <= created or (expires-created).total_seconds() > profile["retentionMaxSeconds"]:
                fail("MEMORY_RETENTION_EXCEEDED")
            if now >= expires and entry["deletionState"] == "ACTIVE":
                fail("EXPIRED_MEMORY_NOT_ERASED")
        except (ValueError, TypeError):
            fail("MEMORY_TIME_INVALID")
        if entry["trustLabel"] != "VERIFIED" and not entry["quarantined"]:
            fail("UNTRUSTED_MEMORY_NOT_QUARANTINED")
        if entry["deletionState"] != "ACTIVE" and not entry["quarantined"]:
            fail("DELETED_MEMORY_NOT_QUARANTINED")
        if entry["originKind"] in ("TOOL", "DOCUMENT", "AGENT_SYNTHESIS") and (
                entry["trustLabel"] != "VERIFIED" and not entry["quarantined"]):
            fail("EXTERNAL_MEMORY_POISONING_RISK")
        if entry["correctionOfEntryRef"] if "correctionOfEntryRef" in entry else False:
            if entry["correctionOfEntryRef"] == entry["entryId"]:
                fail("SELF_MEMORY_CORRECTION")
    return _finish(errors)


def assess_retrieval(bundle, *, entry_id, policy_id, destination_scope,
                     destination_trust_domain, at):
    """Static source-trust filter. Never returns authority or actual content."""
    report = validate_cognitive_contract(bundle, at=at)
    if report["status"] != "STATIC_COGNITIVE_ELIGIBLE":
        return {"status": "BLOCKED", "reasons": report["errors"], "authority_granted": False}
    entries = {e["entryId"]: e for e in bundle.get("memoryEntries", [])}
    policies = {p["policyId"]: p for p in bundle.get("retrievalPolicies", [])}
    entry, policy = entries.get(entry_id), policies.get(policy_id)
    errors = []
    if not entry or not policy:
        errors.append("UNKNOWN_RETRIEVAL_INPUT")
    else:
        if entry["quarantined"] or entry["deletionState"] != "ACTIVE":
            errors.append("MEMORY_QUARANTINED_OR_DELETED")
        if entry["trustLabel"] not in policy["allowedTrustLabels"]:
            errors.append("MEMORY_TRUST_NOT_ADMITTED")
        if not _scope_inside(destination_scope, entry["scope"]) or not any(
                _scope_inside(destination_scope, s) for s in policy["allowedScopes"]):
            errors.append("RETRIEVAL_SCOPE_MISMATCH")
        if entry["originTrustDomain"] != destination_trust_domain:
            errors.append("CROSS_DOMAIN_RETRIEVAL_REQUIRES_EXTERNAL_REVIEW")
    return {"status": "BLOCKED" if errors else "STATIC_RETRIEVAL_ELIGIBLE",
            "reasons": sorted(errors), "authority_granted": False,
            "content_trust_verified": False}


def evaluate_declared_budget(profile, *, iterations, model_tokens,
                             tool_calls, elapsed_seconds, cost_minor):
    """Advisory stop evaluation; the runtime must enforce, not the model."""
    b = profile["budgets"]
    over = (iterations > b["maxIterations"] or model_tokens > b["maxModelTokens"]
            or tool_calls > b["maxToolCalls"]
            or elapsed_seconds > profile["maxExecutionSeconds"]
            or cost_minor > b["maxCostMinor"])
    return {"status": "STOP_REQUIRED" if over else "WITHIN_DECLARED_BOUNDS",
            "execution_authorized": False}


def assess_compaction(context_policy, before, after):
    """Only validates critical-marker and provenance preservation, not semantic truth."""
    retained = {(c["claimId"], c["sourceRef"], c["sourceDigest"])
                for c in after}
    failures = [c["claimId"] for c in before if c["critical"]
                and (c["claimId"], c["sourceRef"], c["sourceDigest"]) not in retained]
    return {"status": "REJECTED" if failures else "STRUCTURAL_FIDELITY_ONLY",
            "missing_critical_claims": failures,
            "semantic_fidelity_verified": False, "execution_authorized": False}
