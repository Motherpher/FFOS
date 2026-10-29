"""AMA M4 event-trigger static conformance (no actual dispatch or automation).

Host must authenticate event origin, construct idempotency keys, verify
authorization, and enforce replay/time/concurrency bounds at delivery time.
"""
from jsonschema import Draft202012Validator, FormatChecker
from ama_vnext import validate_bundle, registry, digest, RANK


def check_event_triggers(bundle):
    errors=[]
    base=validate_bundle(bundle)
    if base:
        return _report(["BUNDLE_INVALID"]+base,len(bundle.get("eventTriggers",[])))
    triggers=bundle.get("eventTriggers",[])
    if not triggers:
        return _report([],0)
    reg,schemas=registry()
    validator=Draft202012Validator(schemas["event-trigger"],registry=reg,
                                  format_checker=FormatChecker())
    for trigger in triggers:
        if list(validator.iter_errors(trigger)):
            errors.append("SCHEMA_EVENT_TRIGGER")
    if errors:
        return _report(errors,len(triggers))
    agent=bundle["agent"]
    modules={m["moduleId"]:m for m in agent["modules"]}
    commands={c["commandId"]:c for c in bundle["commands"]}
    workflows={w["workflowId"]:w for w in bundle["workflows"]}
    ids=[t["triggerId"] for t in triggers]
    if len(set(ids))!=len(ids):
        errors.append("DUPLICATE_EVENT_TRIGGER")
    for t in triggers:
        module=modules.get(t["moduleId"])
        expected="SCHEDULING" if t["triggerKind"]=="SCHEDULE" else "EVENTS"
        if not module or not module["enabled"] or module["kind"]!=expected:
            errors.append("TRIGGER_MODULE_NOT_ENABLED")
        if t["status"] in ("SUSPENDED","DEPRECATED"):
            errors.append("SUSPENDED_TRIGGER_CANNOT_BE_ADMITTED")
        cr=t["commandRef"]
        wr=t["workflowRef"]
        command=commands.get(cr["id"])
        workflow=workflows.get(wr["id"])
        if (not command or command["version"]!=cr["version"]
                or digest(command)!=cr["digest"]):
            errors.append("TRIGGER_COMMAND_REF_INVALID")
        if (not workflow or workflow["version"]!=wr["version"]
                or digest(workflow)!=wr["digest"]):
            errors.append("TRIGGER_WORKFLOW_REF_INVALID")
        if command and workflow and command["workflowRef"]!=wr:
            errors.append("TRIGGER_COMMAND_WORKFLOW_MISMATCH")
        if command and command["agentId"]!=agent["agentId"]:
            errors.append("TRIGGER_COMMAND_AGENT_MISMATCH")
        if workflow and workflow["agentId"]!=agent["agentId"]:
            errors.append("TRIGGER_WORKFLOW_AGENT_MISMATCH")
        if (RANK[t["maxEffectClass"]]>RANK[agent["effectCeiling"]]
                or workflow and RANK[t["maxEffectClass"]]>RANK[workflow["effectCeiling"]]):
            errors.append("TRIGGER_EFFECT_ESCALATION")
        if t["status"]=="ACTIVE":
            # Static definitions cannot claim their host scheduler is admitted.
            errors.append("TRIGGER_ACTIVE_REQUIRES_HOST_ACCEPTANCE")
    return _report(errors,len(triggers))


def _report(errors,count):
    return {"schema":"ama.event-trigger-assessment/v1",
            "status":"REJECTED" if errors else "STATIC_EVENTING_ELIGIBLE",
            "errors":sorted(set(errors)),
            "triggers_checked":count,
            "host_dispatch_authenticated":False,
            "effect_authorized":False,
            "events_dispatched":False,
            "schedule_expression_verified":False,
            "required_host_controls":["SOURCE_AUTHENTICATION","EXACT_REPLAY_DETECTION",
                "SIGNED_POLICY_FRESHNESS","SCHEDULE_SEMANTICS","QUEUE_BACKPRESSURE",
                "INDEPENDENT_EFFECT_AUTHORIZATION"]}
