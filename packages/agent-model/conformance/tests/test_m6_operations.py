"""M6 synthetic operational conformance; no live monitor, deployment or human acceptance."""
import copy,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_vnext import digest
from ama_operations import validate_operational_contract,compare_operational_versions,plan_canary_action
from test_m1_contracts import fixture,pin
V="0.2.0"
NOW="2026-10-29T12:00:00+00:00"
ID="SYNTHETIC"
SIGNALS=["HEALTH","ERROR_RATE","LATENCY","COST","POLICY_DRIFT","EFFECT_UNCERTAINTY","REVOCATION"]

def sample():
 b=fixture(); a=b["agent"]
 agentref={"id":a["agentId"],"version":a["agentVersion"],"digest":digest(a)}
 policy={"schema":"ama.operational-profile/v0.2-candidate",
         "profileId":ID+".OPERATIONAL","version":V,"agentRef":agentref,"status":"VALIDATED",
         "monitoring":{"maxHeartbeatAgeSeconds":120,"maxFailureRate":0.05,
         "maxP95LatencyMs":2000,"maxCostMinor":1500,"currency":"USD",
         "requiredSignals":list(SIGNALS)},
         "releasePolicy":{"canaryMaxPercent":10,"minCanaryObservations":5,
         "requireIndependentDecision":True,"requireCompatibilityCheck":True,
         "failClosedOnMissingTelemetry":True},"protocolBindings":[]}
 cap=b["capabilities"][0]["capabilityId"]
 compatible={"schema":"ama.compatibility-assessment/v0.2-candidate",
  "assessmentId":ID+".COMPATIBILITY","version":V,"agentRef":agentref,
  "fromVersion":"1.0.0","toVersion":"1.1.0",
  "changeClass":"MINOR","affectedCapabilities":[cap],
  "breakingChange":False,"contractTestsPassed":True,"migrationReversible":True,
  "baselineEvidenceRef":"synthetic/baseline","sourceDigest":"sha256:"+"a"*64,
  "result":"COMPATIBLE_CANDIDATE"}
 snapshot={"schema":"ama.health-snapshot/v0.2-candidate",
  "snapshotId":ID+".HEALTH","version":V,
  "profileRef":pin(policy,"profileId"),"agentRef":agentref,
  "observedAt":"2026-10-29T10:00:00Z","sourceRef":"synthetic/independent-test",
  "sourceTrust":"INDEPENDENTLY_ATTESTED","heartbeatAgeSeconds":1,
  "failureRate":0,"p95LatencyMs":50,"costMinor":10,
  "policyDrift":False,"revocationDetected":False,"unsettledEffects":0,
  "signalsPresent":list(SIGNALS),"evidenceRefs":["test-data-only"],"redacted":True}
 rollback={"schema":"ama.rollback-plan/v0.2-candidate",
  "rollbackId":ID+".ROLLBACK","version":V,"agentRef":agentref,
  "fromVersion":"1.1.0","targetVersion":"1.0.0",
  "targetDigest":"sha256:"+"d"*64,
  "triggerKinds":["POLICY_DRIFT","REVOKED_TOOL","UNSETTLED_EFFECT"],
  "requiresIndependentApproval":True,
  "uncertainEffectsDisposition":"HOLD_FOR_INDEPENDENT_RECONCILIATION",
  "evidenceRetention":"APPEND_ONLY","state":"PROPOSED","activationAuthorized":False}
 plan={"schema":"ama.release-plan/v0.2-candidate",
  "planId":ID+".RELEASE","version":V,"agentRef":agentref,
  "candidateVersion":"1.1.0","candidateDigest":"sha256:"+"c"*64,
  "compatibilityRef":pin(compatible,"assessmentId"),
  "operationalProfileRef":pin(policy,"profileId"),
  "baselineEvidenceRef":"synthetic/baseline",
  "canaryPercent":5,"requiredObservations":10,"safetyChecks":[
    "IDENTITY","POLICY","REVOCATION","HEALTH","EFFECTS","EVIDENCE","COST","COMPATIBILITY"],
  "rollbackRef":pin(rollback,"rollbackId"),"state":"PROPOSED",
  "activationAuthorized":False}
 b.update(operationalProfiles=[policy],compatibilityAssessments=[compatible],
   healthSnapshots=[snapshot],incidentRecords=[],releasePlans=[plan],rollbackPlans=[rollback])
 return b

def repin(b):
 p=b["operationalProfiles"][0]
 b["healthSnapshots"][0]["profileRef"]=pin(p,"profileId")
 plan=b["releasePlans"][0]
 plan["operationalProfileRef"]=pin(p,"profileId")
 plan["compatibilityRef"]=pin(b["compatibilityAssessments"][0],"assessmentId")
 plan["rollbackRef"]=pin(b["rollbackPlans"][0],"rollbackId")
 return b

def test_attestor(o):return o["sourceRef"]=="synthetic/independent-test"

class M6Operations(unittest.TestCase):
 def check(self,b,attestor=test_attestor):
  return validate_operational_contract(b,at=NOW,attestor=attestor)
 def deny(self,b,reason,attestor=test_attestor):
  r=self.check(b,attestor)
  self.assertEqual("REJECTED",r["status"],r)
  self.assertIn(reason,r["findings"],r)
  self.assertFalse(r["deployment_authorized"])
  self.assertFalse(r["rollback_authorized"])
 def test_no_m6_features_remain_valid(self):
  self.assertEqual("STATIC_OPERATIONAL_ELIGIBLE",self.check(fixture())["status"])
 def test_consistent_candidate_is_eligible_not_deployable(self):
  r=self.check(sample())
  self.assertEqual("STATIC_OPERATIONAL_ELIGIBLE",r["status"],r)
  self.assertFalse(r["independent_accepted"])
  self.assertFalse(r["operational_ready"])
 def test_profile_pin_change_is_rejected(self):
  b=sample();b["operationalProfiles"][0]["agentRef"]["digest"]="sha256:"+"0"*64
  self.deny(b,"OPERATIONAL_AGENT_PIN_MISMATCH")
 def test_health_threshold_failure(self):
  b=sample();b["healthSnapshots"][0]["failureRate"]=.25
  self.deny(b,"UNHEALTHY_OPERATIONAL_SNAPSHOT")
 def test_missing_signal_fails_closed(self):
  b=sample();b["healthSnapshots"][0]["signalsPresent"].remove("POLICY_DRIFT")
  self.deny(b,"MISSING_MONITORING_SIGNALS")
 def test_claimed_attestation_not_sufficient(self):
  self.deny(sample(),"HEALTH_INDEPENDENT_ATTESTATION_MISSING",attestor=None)
 def test_independent_attestor_outage(self):
  def down(_):raise OSError("not available")
  self.deny(sample(),"HEALTH_ATTESTOR_UNAVAILABLE",attestor=down)
 def test_unverified_broken_release(self):
  b=sample();b["compatibilityAssessments"][0]["breakingChange"]=True
  self.deny(repin(b),"UNSAFE_COMPATIBILITY_GREEN")
 def test_model_upgrade_requires_impact_assessment(self):
  b=sample();a=b["compatibilityAssessments"][0]
  a["changeClass"]="MODEL";a["affectedCapabilities"]=[]
  self.deny(repin(b),"INCOMPLETE_COMPATIBILITY_IMPACT")
 def test_protocol_dependency_is_conditional(self):
  b=sample();b["operationalProfiles"][0]["protocolBindings"]=[]
  self.assertEqual("STATIC_OPERATIONAL_ELIGIBLE",self.check(repin(b))["status"])
 def test_suspended_health_profile_fails(self):
  b=sample();b["operationalProfiles"][0]["status"]="SUSPENDED"
  self.deny(repin(b),"OPERATIONAL_PROFILE_NOT_ADMITTED")
 def test_canary_size_exceeds_policy(self):
  b=sample();b["releasePlans"][0]["canaryPercent"]=50
  self.deny(b,"CANARY_OUTSIDE_OPERATIONAL_POLICY")
 def test_unverified_high_severity_incident_blocks_release(self):
  b=sample();b["incidentRecords"]=[{
   "schema":"ama.incident-record/v0.2-candidate","incidentId":ID+".INCIDENT",
   "version":V,"agentRef":b["operationalProfiles"][0]["agentRef"],
   "kind":"REVOKED_TOOL","severity":"CRITICAL","state":"OPEN",
   "detectedAt":"2026-10-29T11:00:00Z","sourceEvidenceRef":"test/revocation",
   "releaseAllowed":False}]
  self.deny(b,"UNCONTAINED_HIGH_SEVERITY_INCIDENT")
  self.deny(b,"UNRESOLVED_MAJOR_INCIDENT_BLOCKS_RELEASE")
 def test_incident_cannot_self_close(self):
  b=sample();b["incidentRecords"]=[{
   "schema":"ama.incident-record/v0.2-candidate","incidentId":ID+".INCIDENT",
   "version":V,"agentRef":b["operationalProfiles"][0]["agentRef"],
   "kind":"REVOKED_TOOL","severity":"HIGH","state":"CLOSED",
   "detectedAt":"2026-10-29T11:00:00Z","sourceEvidenceRef":"test/revocation",
   "containmentRef":"test/hold","releaseAllowed":False}]
  self.deny(b,"INCIDENT_SELF_CLOSED")
 def test_missing_release_safety_controls(self):
  b=sample();b["releasePlans"][0]["safetyChecks"].remove("POLICY")
  self.deny(b,"RELEASE_SAFETY_CHECKS_INCOMPLETE")
 def test_stale_compatibility_pin(self):
  b=sample();b["compatibilityAssessments"][0]["contractTestsPassed"]=False
  self.deny(b,"STALE_RELEASE_COMPATIBILITY")
 def test_wrong_rollback_target(self):
  b=sample();b["rollbackPlans"][0]["targetVersion"]="1.1.0"
  self.deny(repin(b),"ROLLBACK_TARGET_INCOHERENT")
 def test_release_requires_external_health(self):
  b=sample();b["healthSnapshots"]=[]
  self.deny(b,"RELEASE_MISSING_HEALTH_EVIDENCE")
 def test_no_reversal_without_baseline(self):
  b=sample();a=b["healthSnapshots"][0]
  self.assertEqual("UNVERIFIED_BASELINE",compare_operational_versions(a,a)["status"])
  self.assertFalse(compare_operational_versions(a,a,independent_baseline_verified=True)["deployment_authorized"])
 def test_canary_stop_for_revocation(self):
  b=sample();p=b["operationalProfiles"][0];h=b["healthSnapshots"][0]
  r=plan_canary_action(p,h,observations=10)
  self.assertEqual("REFER_FOR_INDEPENDENT_REVIEW",r["recommendation"])
  self.assertFalse(r["release_authorized"])
  h["revocationDetected"]=True
  self.assertEqual("STOP_AND_HOLD",plan_canary_action(p,h,observations=10)["recommendation"])
 def test_no_self_approval_schema(self):
  b=sample();b["releasePlans"][0]["activationAuthorized"]=True
  self.deny(b,"INVALID_BUNDLE")
if __name__=="__main__":unittest.main()
