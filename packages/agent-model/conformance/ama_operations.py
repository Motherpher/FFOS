"""AMA M6: provider-neutral lifecycle, compatibility, telemetry, incident and release preflight.

All outputs are NON-AUTHORIZING; external human and security services alone may
accept, suspend, deploy or rollback an actual agent. Observations never become
authenticated just by carrying a trusted-looking label.
"""
from __future__ import annotations
from datetime import datetime, timezone
from jsonschema import Draft202012Validator,FormatChecker
from ama_vnext import validate_bundle, registry, digest

GROUPS={"operationalProfiles":("operational-profile","profileId"),
        "compatibilityAssessments":("compatibility-assessment","assessmentId"),
        "healthSnapshots":("health-snapshot","snapshotId"),
        "incidentRecords":("incident-record","incidentId"),
        "releasePlans":("release-plan","planId"),
        "rollbackPlans":("rollback-plan","rollbackId")}
REQUIRED_SAFETY={"IDENTITY","POLICY","REVOCATION","HEALTH","EFFECTS","EVIDENCE",
                 "COST","COMPATIBILITY"}
SEVERITY={"LOW":0,"MODERATE":1,"HIGH":2,"CRITICAL":3}
def _dt(s):
    t=datetime.fromisoformat(s.replace("Z","+00:00"))
    if t.tzinfo is None:raise ValueError("timezone required")
    return t.astimezone(timezone.utc)
def _result(codes,health=None,readiness=False):
    return {"status":"REJECTED" if codes else "STATIC_OPERATIONAL_ELIGIBLE",
            "findings":sorted(set(codes)), "health":health or {},
            "runtime_authorized":False,"deployment_authorized":False,
            "rollback_authorized":False,"independent_accepted":False,
            "live_telemetry_verified":False,
            "operational_ready":False,
            "requires_external_release_and_attestation":True}
def validate_operational_contract(bundle,*,at,attestor=None):
    codes=set()
    try: now=_dt(at)
    except (ValueError,TypeError,AttributeError): return _result(["INVALID_HOST_TIME"])
    base=validate_bundle(bundle)
    if base:return _result(["INVALID_BUNDLE",*base])
    reg,schemas=registry()
    indexes={}
    for coll,(schema_name,key) in GROUPS.items():
        rows=bundle.get(coll,[])
        idx={}
        val=Draft202012Validator(schemas[schema_name],registry=reg,
                                 format_checker=FormatChecker())
        for row in rows:
            if list(val.iter_errors(row)):
                codes.add("SCHEMA:"+coll)
                continue
            if row[key] in idx: codes.add("DUPLICATE:"+coll)
            idx[row[key]]=row
        indexes[coll]=idx
    if codes:return _result(codes)
    agent=bundle["agent"]
    def agent_pin(ref):
        return (ref["id"]==agent["agentId"] and
                ref["version"]==agent["agentVersion"] and
                ref["digest"]==digest(agent))
    def resolve(ref,coll,key,tag):
        row=indexes[coll].get(ref["id"])
        if not row:
            codes.add("UNRESOLVED_"+tag)
            return None
        if ref["version"]!=row["version"] or ref["digest"]!=digest(row):
            codes.add("STALE_"+tag)
        return row
    profiles=indexes["operationalProfiles"]
    if len(profiles)>1:codes.add("MULTIPLE_OPERATIONAL_PROFILES")
    for p in profiles.values():
        if not agent_pin(p["agentRef"]):codes.add("OPERATIONAL_AGENT_PIN_MISMATCH")
        if p["status"] not in ("VALIDATED","ACTIVE"):
            codes.add("OPERATIONAL_PROFILE_NOT_ADMITTED")
        protocols=[x["protocol"] for x in p["protocolBindings"]]
        if len(protocols)!=len(set(protocols)):
            codes.add("DUPLICATE_PROTOCOL_BINDING")
        # Optional protocol bindings do not become mandatory globally.
    for assessment in indexes["compatibilityAssessments"].values():
        if not agent_pin(assessment["agentRef"]):
            codes.add("COMPATIBILITY_AGENT_PIN_MISMATCH")
        if assessment["fromVersion"]==assessment["toVersion"]:
            codes.add("NO_VERSION_CHANGE")
        capabilities={c["capabilityId"] for c in bundle["capabilities"]}
        if not set(assessment["affectedCapabilities"]).issubset(capabilities):
            codes.add("UNKNOWN_COMPATIBILITY_CAPABILITY")
        if (assessment["breakingChange"] or not assessment["contractTestsPassed"] or
            not assessment["migrationReversible"]) and assessment["result"]=="COMPATIBLE_CANDIDATE":
            codes.add("UNSAFE_COMPATIBILITY_GREEN")
        if assessment["changeClass"]=="MAJOR" and assessment["result"]=="COMPATIBLE_CANDIDATE":
            codes.add("MAJOR_VERSION_REVIEW_REQUIRED")
        if (assessment["changeClass"]=="MODEL" or assessment["changeClass"]=="TOOL"
            or assessment["changeClass"]=="PROTOCOL") and not assessment["affectedCapabilities"]:
            codes.add("INCOMPLETE_COMPATIBILITY_IMPACT")
    health={}
    for observation in indexes["healthSnapshots"].values():
        if not agent_pin(observation["agentRef"]):
            codes.add("HEALTH_AGENT_PIN_MISMATCH")
        profile=resolve(observation["profileRef"],"operationalProfiles","profileId","HEALTH_PROFILE")
        try:
            if _dt(observation["observedAt"])>now:codes.add("FUTURE_HEALTH")
        except (ValueError,TypeError):codes.add("HEALTH_TIME_INVALID")
        if profile is None:continue
        m=profile["monitoring"]
        missing=set(m["requiredSignals"])-set(observation["signalsPresent"])
        if missing: codes.add("MISSING_MONITORING_SIGNALS")
        if (observation["heartbeatAgeSeconds"]>m["maxHeartbeatAgeSeconds"] or
            observation["failureRate"]>m["maxFailureRate"] or
            observation["p95LatencyMs"]>m["maxP95LatencyMs"] or
            observation["costMinor"]>m["maxCostMinor"] or
            observation["policyDrift"] or observation["revocationDetected"] or
            observation["unsettledEffects"]>0):
            codes.add("UNHEALTHY_OPERATIONAL_SNAPSHOT")
        attested=False
        if observation["sourceTrust"]=="INDEPENDENTLY_ATTESTED" and attestor:
            try:attested=bool(attestor(observation))
            except Exception:codes.add("HEALTH_ATTESTOR_UNAVAILABLE")
        if not attested:codes.add("HEALTH_INDEPENDENT_ATTESTATION_MISSING")
        health[observation["snapshotId"]]={
            "thresholds_met":not any(x in codes for x in (
                "MISSING_MONITORING_SIGNALS","UNHEALTHY_OPERATIONAL_SNAPSHOT")),
            "externally_attested_in_test":attested}
    for incident in indexes["incidentRecords"].values():
        if not agent_pin(incident["agentRef"]):
            codes.add("INCIDENT_AGENT_PIN_MISMATCH")
        try:
            if _dt(incident["detectedAt"])>now:codes.add("FUTURE_INCIDENT")
        except (ValueError,TypeError):codes.add("INCIDENT_TIME_INVALID")
        if incident["state"] in ("CONTAINED","RESOLVED","CLOSED") and not incident.get("containmentRef"):
            codes.add("INCIDENT_CONTAINMENT_EVIDENCE_MISSING")
        if incident["state"]=="CLOSED" and (
            not incident.get("humanAcceptanceRef") or
            not incident.get("independentReviewerRef")):
            codes.add("INCIDENT_SELF_CLOSED")
        if SEVERITY[incident["severity"]]>=2 and incident["state"] not in (
                "CONTAINED","RESOLVED","CLOSED"):
            codes.add("UNCONTAINED_HIGH_SEVERITY_INCIDENT")
    for rollback in indexes["rollbackPlans"].values():
        if not agent_pin(rollback["agentRef"]):
            codes.add("ROLLBACK_AGENT_PIN_MISMATCH")
        if rollback["fromVersion"]==rollback["targetVersion"]:
            codes.add("ROLLBACK_SAME_VERSION")
        if rollback["state"]=="APPROVAL_PENDING" and not rollback["triggerKinds"]:
            codes.add("ROLLBACK_TRIGGER_MISSING")
    for plan in indexes["releasePlans"].values():
        if not agent_pin(plan["agentRef"]):
            codes.add("RELEASE_AGENT_PIN_MISMATCH")
        comp=resolve(plan["compatibilityRef"],"compatibilityAssessments","assessmentId","RELEASE_COMPATIBILITY")
        profile=resolve(plan["operationalProfileRef"],"operationalProfiles","profileId","RELEASE_PROFILE")
        rollback=resolve(plan["rollbackRef"],"rollbackPlans","rollbackId","RELEASE_ROLLBACK")
        if not REQUIRED_SAFETY.issubset(plan["safetyChecks"]):
            codes.add("RELEASE_SAFETY_CHECKS_INCOMPLETE")
        if comp and (comp["toVersion"]!=plan["candidateVersion"] or
                     comp["result"]!="COMPATIBLE_CANDIDATE"):
            codes.add("RELEASE_COMPATIBILITY_NOT_VERIFIED")
        if rollback and (rollback["fromVersion"]!=plan["candidateVersion"] or
                         rollback["targetVersion"]==plan["candidateVersion"]):
            codes.add("ROLLBACK_TARGET_INCOHERENT")
        if profile and (plan["canaryPercent"]>profile["releasePolicy"]["canaryMaxPercent"] or
                        plan["requiredObservations"]<
                        profile["releasePolicy"]["minCanaryObservations"]):
            codes.add("CANARY_OUTSIDE_OPERATIONAL_POLICY")
        if any(i["severity"] in ("HIGH","CRITICAL") and
               i["state"] not in ("RESOLVED","CLOSED")
               for i in indexes["incidentRecords"].values()):
            codes.add("UNRESOLVED_MAJOR_INCIDENT_BLOCKS_RELEASE")
        if not indexes["healthSnapshots"]:
            codes.add("RELEASE_MISSING_HEALTH_EVIDENCE")
        if not plan.get("baselineEvidenceRef"):
            codes.add("RELEASE_MISSING_BASELINE")
    return _result(codes,health)

def compare_operational_versions(candidate,baseline,*,independent_baseline_verified=False):
    """Suggest review only. Never deploys or determines authentic version safety."""
    if not independent_baseline_verified or not baseline:
        return {"status":"UNVERIFIED_BASELINE","deployment_authorized":False}
    if candidate["failureRate"]>baseline["failureRate"] or (
       candidate["p95LatencyMs"]>baseline["p95LatencyMs"]) or (
       candidate["costMinor"]>baseline["costMinor"]):
        return {"status":"REGRESSION","deployment_authorized":False}
    return {"status":"NO_METRIC_REGRESSION_DETECTED","deployment_authorized":False}

def plan_canary_action(profile,snapshot,*,observations):
    """Safety recommendation for external reviewer; no traffic-shifting action."""
    required=profile["releasePolicy"]["minCanaryObservations"]
    m=profile["monitoring"]
    ok=(observations>=required and
        set(m["requiredSignals"]).issubset(snapshot["signalsPresent"]) and
        not snapshot["policyDrift"] and not snapshot["revocationDetected"] and
        snapshot["unsettledEffects"]==0 and
        snapshot["heartbeatAgeSeconds"]<=m["maxHeartbeatAgeSeconds"] and
        snapshot["failureRate"]<=m["maxFailureRate"] and
        snapshot["p95LatencyMs"]<=m["maxP95LatencyMs"] and
        snapshot["costMinor"]<=m["maxCostMinor"])
    return {"recommendation":"REFER_FOR_INDEPENDENT_REVIEW" if ok else "STOP_AND_HOLD",
            "canary_activated":False,"release_authorized":False}
