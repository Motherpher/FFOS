"""M4 static run/effect/receipt graph checks. Never executes a task or grants effect authority."""
from __future__ import annotations
from jsonschema import Draft202012Validator, FormatChecker
from ama_vnext import validate_bundle, registry, digest

KIND = {
    "runs": ("run","runId"),
    "steps": ("step","stepId"),
    "attempts": ("attempt","attemptId"),
    "checkpoints": ("checkpoint","checkpointId"),
    "effectReceipts": ("effect-receipt","receiptId"),
    "reconciliations": ("reconciliation","reconciliationId"),
    "approvalEvents": ("approval-event","eventId"),
}

def validate_durability_contract(bundle):
    errors = set()
    base = validate_bundle(bundle)
    if base:
        return {"status":"REJECTED","errors":["BUNDLE_INVALID"]+base,
                "runtime_authorized":False,"evidence_verified":False}
    reg, schemas = registry()
    index = {}
    for collection,(schema_name,key) in KIND.items():
        items = bundle.get(collection, [])
        ids = [r[key] for r in items]
        if len(ids) != len(set(ids)):
            errors.add("DUPLICATE_"+collection.upper())
        index[collection] = {r[key]:r for r in items}
        val = Draft202012Validator(schemas[schema_name], registry=reg,
                                   format_checker=FormatChecker())
        for x in items:
            if list(val.iter_errors(x)):
                errors.add("SCHEMA_"+collection.upper())
    if errors:
        return {"status":"REJECTED","errors":sorted(errors),
                "runtime_authorized":False,"evidence_verified":False}
    agent = bundle["agent"]
    tasks = {t["taskId"]:t for t in bundle.get("tasks",[])}
    flows = {w["workflowId"]:w for w in bundle["workflows"]}
    effects = {e["effectId"]:e for e in bundle.get("effects",[])}
    requests = {r["requestId"]:r for r in bundle.get("authorizationRequests",[])}
    approvals = {a["approvalId"]:a for a in bundle.get("approvals",[])}
    def resolve(ref,entries,tag,version_key="version"):
        target = entries.get(ref["id"])
        if not target:
            errors.add("UNRESOLVED_"+tag)
            return None
        if ref["version"]!=target[version_key] or ref["digest"]!=digest(target):
            errors.add("STALE_"+tag)
        return target
    for run in index["runs"].values():
        if (run["agentRef"]["id"]!=agent["agentId"]
            or run["agentRef"]["version"]!=agent["agentVersion"]
            or run["agentRef"]["digest"]!=digest(agent)):
            errors.add("RUN_AGENT_MISMATCH")
        task=resolve(run["taskRef"],tasks,"RUN_TASK")
        wf=resolve(run["workflowRef"],flows,"RUN_WORKFLOW")
        if task and task["runId"]!=run["runId"]:
            errors.add("RUN_TASK_ID_MISMATCH")
        if task and wf and task["workflowRef"]!=run["workflowRef"]:
            errors.add("RUN_WORKFLOW_MISMATCH")
        if run["leaseEpoch"]==0 and ("leaseOwner" in run or "leaseExpiresAt" in run):
            errors.add("UNACQUIRED_LEASE")
        if bool(run.get("leaseOwner")) != bool(run.get("leaseExpiresAt")):
            errors.add("INCOMPLETE_LEASE")
    for step in index["steps"].values():
        run=index["runs"].get(step["runId"])
        if not run:
            errors.add("STEP_RUN_MISSING")
        elif run["workflowRef"]["id"] in flows:
            flow=flows[run["workflowRef"]["id"]]
            if step["workflowStepId"] not in {s["stepId"] for s in flow["steps"]}:
                errors.add("STEP_NOT_IN_WORKFLOW")
        for ref in step["attemptRefs"]:
            attempt=resolve(ref,index["attempts"],"STEP_ATTEMPT")
            if attempt and attempt["stepId"]!=step["stepId"]:
                errors.add("ATTEMPT_STEP_MISMATCH")
    for attempt in index["attempts"].values():
        run=index["runs"].get(attempt["runId"])
        if not run or attempt["stepId"] not in index["steps"]:
            errors.add("ATTEMPT_PARENT_MISSING")
        elif attempt["leaseEpoch"]>run["leaseEpoch"]:
            errors.add("ATTEMPT_FUTURE_FENCE")
    for cp in index["checkpoints"].values():
        run=index["runs"].get(cp["runId"])
        if not run:
            errors.add("CHECKPOINT_RUN_MISSING")
        elif cp["generation"]>run["generation"] or cp["leaseEpoch"]>run["leaseEpoch"]:
            errors.add("CHECKPOINT_FUTURE_GENERATION")
    seen = set()
    for receipt in index["effectReceipts"].values():
        effect=resolve(receipt["effectRef"],effects,"RECEIPT_EFFECT")
        if effect and effect["runId"]!=receipt["runId"]:
            errors.add("RECEIPT_WRONG_RUN")
        if not receipt["independentVerification"]:
            errors.add("UNVERIFIED_RECEIPT")
        key=receipt["effectRef"]["id"]
        if key in seen:
            errors.add("CONFLICTING_RECEIPTS")
        seen.add(key)
    for rec in index["reconciliations"].values():
        effect=resolve(rec["effectRef"],effects,"RECONCILIATION_EFFECT")
        if effect and effect["runId"]!=rec["runId"]:
            errors.add("RECONCILIATION_WRONG_RUN")
        if rec["outcome"]!="STILL_UNKNOWN" and "receiptRef" not in rec:
            errors.add("FINAL_RECONCILIATION_NO_RECEIPT")
        if "receiptRef" in rec:
            receipt=resolve(rec["receiptRef"],index["effectReceipts"],"RECONCILIATION_RECEIPT")
            if receipt and receipt["effectRef"]!=rec["effectRef"]:
                errors.add("RECONCILIATION_RECEIPT_MISMATCH")
    for ev in index["approvalEvents"].values():
        if ev["runId"] not in index["runs"]:
            errors.add("APPROVAL_EVENT_RUN_MISSING")
        req=resolve(ev["requestRef"],requests,"APPROVAL_EVENT_REQUEST")
        if req and req["runId"]!=ev["runId"]:
            errors.add("APPROVAL_WRONG_RUN")
        if ev["state"]=="APPROVED" and "approvalRef" not in ev:
            errors.add("APPROVAL_NO_EVIDENCE")
        if "approvalRef" in ev:
            resolve(ev["approvalRef"],approvals,"APPROVAL_EVENT_PROOF")
    return {"status":"REJECTED" if errors else "STATIC_DURABILITY_ELIGIBLE",
            "errors":sorted(errors),"runtime_authorized":False,
            "evidence_verified":False}
