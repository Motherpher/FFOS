"""AMA FIN-01 M5/M6 evidence invariants: unknown metrics and mandatory audit records.

This is portable contract-side verification. It does not collect live telemetry,
implement a production audit store or authorize operational deployment.
"""
from __future__ import annotations

REQUIRED_AUDIT_EVENTS=("POLICY_DECISION","EFFECT_ATTEMPT","EFFECT_OUTCOME")

def check_metrics(metrics:object)->dict:
    errors=[]
    if not isinstance(metrics,dict):
        return {"errors":["METRICS_OBJECT_REQUIRED"],"contract_valid":False}
    for name in ("token_count","cost_minor","latency_ms"):
        v=metrics.get(name)
        # Missing and unknown values must be represented as null, never
        # an unexplained zero. Known zero is an observed value with provenance.
        if v is None:
            if name not in metrics:
                errors.append("UNDECLARED_METRIC:"+name)
        elif isinstance(v,bool) or not isinstance(v,(int,float)) or v<0:
            errors.append("INVALID_METRIC:"+name)
        elif v==0 and not metrics.get(name+"_observed_zero"):
            errors.append("ZERO_WITHOUT_OBSERVATION:"+name)
        if metrics.get(name+"_observed_zero") and v!=0:
            errors.append("INCONSISTENT_ZERO_PROVENANCE:"+name)
    return {"errors":sorted(set(errors)),"contract_valid":not errors,
            "assurance":"STATIC_METRIC_SEMANTICS_ONLY","runtime_verified":False}

def check_audit_sampling(record:object)->dict:
    errors=[]
    if not isinstance(record,dict):
        return {"errors":["AUDIT_POLICY_REQUIRED"],"contract_valid":False}
    required=record.get("mandatory_event_kinds")
    if not isinstance(required,list):
        required=[]
        errors.append("MANDATORY_EVENT_SET_REQUIRED")
    if not set(REQUIRED_AUDIT_EVENTS).issubset(required):
        errors.append("MANDATORY_EVENTS_NOT_DECLARED")
    sampled=record.get("sampled_event_kinds")
    if not isinstance(sampled,list):
        errors.append("SAMPLING_SET_REQUIRED")
        sampled=[]
    if set(required).intersection(sampled):
        errors.append("MANDATORY_AUDIT_EVENTS_SAMPLED")
    if record.get("evidence_custody")!="APPEND_ONLY_INDEPENDENT":
        errors.append("AUDIT_CUSTODY_NOT_INDEPENDENT")
    if not record.get("retention_policy_ref"):
        errors.append("AUDIT_RETENTION_POLICY_REQUIRED")
    return {"errors":sorted(set(errors)), "contract_valid":not errors,
            "assurance":"STATIC_AUDIT_SAMPLING_RULE_ONLY","evidence_custody_verified":False,
            "release_authorized":False}
