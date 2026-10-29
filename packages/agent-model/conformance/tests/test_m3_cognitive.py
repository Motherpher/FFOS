"""M3: offline agent-neutral model/planner/context/memory and poisoning tests.

No model is invoked, no durable memory is written and no signed source or
semantic summary correctness is claimed by these synthetic conformance cases.
"""
import copy
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ama_vnext import digest
from ama_cognitive import (validate_cognitive_contract, assess_retrieval,
                           assess_compaction, evaluate_declared_budget)
from test_m1_contracts import fixture, pin

V = "0.2.0"
NOW = "2026-10-29T12:00:00+00:00"
ID = "SYNTHETIC"


def cognitive_fixture(*, memory=False, retrieval=False):
    b = fixture()
    a = b["agent"]
    a["modules"] = [{"moduleId": ID+".REASONING", "version": V,
                     "kind": "REASONING", "enabled": True}]
    if memory:
        a["modules"].append({"moduleId": ID+".MEMORY", "version": V,
                             "kind": "MEMORY", "enabled": True})
    if retrieval:
        a["modules"].append({"moduleId": ID+".RETRIEVAL", "version": V,
                             "kind": "RETRIEVAL", "enabled": True})
    mod = ID+".REASONING"
    model = {"schema": "ama.model-profile/v0.2-candidate",
             "profileId": ID+".MODEL", "version": V, "status": "VALIDATED",
             "moduleId": mod, "providerRef": "synthetic-provider",
             "modelId": "synthetic-model", "modelRevision": "immutable-revision-001",
             "maxContextTokens": 8192, "maxOutputTokens": 1024,
             "supportsToolCalling": True, "allowedFallbackRefs": []}
    package = {"schema": "ama.instruction-package/v0.2-candidate",
               "packageId": ID+".INSTRUCTION", "version": V,
               "moduleId": mod, "status": "VALIDATED",
               "layers": [{"layerId": ID+".INSTRUCTION.SYSTEM",
                           "priority": 0, "role": "SYSTEM",
                           "sourceRef": "synthetic-pinned-package",
                           "contentDigest": "sha256:"+"a"*64,
                           "sourceTrust": "DECLARED_UNVERIFIED"}]}
    plan = {"schema": "ama.planning-profile/v0.2-candidate",
            "profileId": ID+".PLAN", "version": V, "status": "VALIDATED",
            "moduleId": mod, "strategy": "PLAN_EXECUTE",
            "maxTaskHorizonSteps": 5, "maxExecutionSeconds": 300,
            "budgets": {"maxIterations": 5, "maxToolCalls": 3,
                        "maxModelTokens": 4000,
                        "maxCostMinor": 200, "currency": "USD"},
            "stopConditions": ["GOAL_REACHED","BUDGET_EXHAUSTED",
                               "POLICY_DENIAL","CANCELLED","TIME_LIMIT"],
            "nodes": [{"nodeId": ID+".PLAN.START", "dependsOn": []},
                      {"nodeId": ID+".PLAN.ACTION",
                       "dependsOn": [ID+".PLAN.START"],
                       "capabilityRef": pin(b["capabilities"][0],"capabilityId")}]}
    context = {"schema": "ama.context-policy/v0.2-candidate",
               "policyId": ID+".CONTEXT", "version": V, "status": "VALIDATED",
               "moduleId": mod, "maxAssembledTokens": 4096,
               "reservedOutputTokens": 1024,
               "compaction": {"enabled": True, "maxSummaryTokens": 1024,
                              "requireSourceProvenance": True,
                              "requireCriticalFactChecks": True,
                              "dropUnverifiedInstructions": True},
               "contextSources": ["RUN_CONTEXT","USER_INPUT"]}
    b["modelProfiles"] = [model]
    b["instructionPackages"] = [package]
    b["planningProfiles"] = [plan]
    b["contextPolicies"] = [context]
    binding = {"schema": "ama.cognitive-binding/v0.2-candidate",
               "bindingId": ID+".BINDING", "version": V,
               "agentRef": {"id":a["agentId"], "version":a["agentVersion"],
                            "digest":digest(a)},
               "reasoningModuleId": mod,
               "modelRef":pin(model,"profileId"),
               "instructionRef":pin(package,"packageId"),
               "planningRef":pin(plan,"profileId"),
               "contextRef":pin(context,"policyId")}
    if memory:
        context["contextSources"].append("MEMORY")
        b["memoryProfiles"] = [{
            "schema":"ama.memory-profile/v0.2-candidate",
            "profileId": ID+".MEMORY.PROFILE", "version": V,
            "status":"VALIDATED", "moduleId": ID+".MEMORY",
            "storeTypes":["EPISODIC","SEMANTIC"], "allowedScopes":["synthetic/item"],
            "retentionMaxSeconds": 172800, "writeAdmission":"TRUSTED_GATE_REQUIRED",
            "retrievalAdmission":"TRUSTED_GATE_REQUIRED",
            "provenanceRequired":True, "quarantineUntrusted":True,
            "allowMemoryAuthority":False, "deletionPolicy":"ERASE_OR_TOMBSTONE_WITH_AUDIT"}]
        memory_p=b["memoryProfiles"][0]
        b["memoryEntries"] = [{
            "schema":"ama.memory-entry/v0.2-candidate",
            "entryId":ID+".ENTRY", "version":V,
            "profileRef":pin(memory_p,"profileId"),"storeType":"EPISODIC",
            "contentDigest":"sha256:"+"b"*64,"sourceRef":"synthetic-record-source",
            "originTrustDomain":"synthetic","originActorRef":"synthetic-principal",
            "originKind":"USER","trustLabel":"VERIFIED",
            "writeDecisionRef":"unverified-reference-only","scope":"synthetic/item",
            "createdAt":"2026-10-28T00:00:00+00:00",
            "expiresAt":"2026-10-30T00:00:00+00:00",
            "quarantined":False,"instructionAuthority":False,
            "deletionState":"ACTIVE"}]
        binding["memoryRef"]=pin(memory_p,"profileId")
    if retrieval:
        context["contextSources"].append("RETRIEVED_CONTENT")
        b["retrievalPolicies"]=[{
            "schema":"ama.retrieval-policy/v0.2-candidate",
            "policyId":ID+".RETRIEVAL.POLICY","version":V,
            "status":"VALIDATED","moduleId":ID+".RETRIEVAL",
            "allowedScopes":["synthetic/item"],
            "allowedTrustLabels":["VERIFIED"],
            "crossTrustDomain":"DENY","maxRetrievedItems":3,
            "allowInstructionPromotion":False,"requireSourceProvenance":True,
            "poisonedEntryAction":"QUARANTINE"}]
        binding["retrievalRef"]=pin(b["retrievalPolicies"][0],"policyId")
    binding["contextRef"]=pin(context,"policyId")
    b["cognitiveBindings"]=[binding]
    return b


def rebind(b):
    mapping={"modelRef":("modelProfiles","profileId"),
             "instructionRef":("instructionPackages","packageId"),
             "planningRef":("planningProfiles","profileId"),
             "contextRef":("contextPolicies","policyId"),
             "memoryRef":("memoryProfiles","profileId"),
             "retrievalRef":("retrievalPolicies","policyId")}
    bind=b.get("cognitiveBindings",[])
    if bind:
        bind=bind[0]
        bind["agentRef"]={"id":b["agent"]["agentId"],
                          "version":b["agent"]["agentVersion"],
                          "digest":digest(b["agent"])}
        for name,(coll,key) in mapping.items():
            if name in bind:
                bind[name]=pin(b[coll][0],key)
    if b.get("memoryEntries"):
        b["memoryEntries"][0]["profileRef"]=pin(b["memoryProfiles"][0],"profileId")
    return b


class M3Cognitive(unittest.TestCase):
    def check(self,b):
        return validate_cognitive_contract(b,at=NOW)
    def assert_bad(self,b,code):
        r=self.check(b)
        self.assertEqual("REJECTED",r["status"],r)
        self.assertIn(code,r["errors"],r)
        self.assertFalse(r["runtime_authorized"])

    def test_minimal_agent_needs_no_reasoning_or_memory(self):
        r=self.check(fixture())
        self.assertEqual("STATIC_COGNITIVE_ELIGIBLE",r["status"],r)
        self.assertFalse(r["runtime_authorized"])

    def test_memory_off_model_on_is_valid(self):
        self.assertEqual("STATIC_COGNITIVE_ELIGIBLE",
                         self.check(cognitive_fixture())["status"])

    def test_cognitive_memory_retrieval_pins_are_valid(self):
        self.assertEqual("STATIC_COGNITIVE_ELIGIBLE",
                         self.check(cognitive_fixture(memory=True,retrieval=True))["status"])

    def test_reasoning_requires_pinned_cognitive_binding(self):
        b=cognitive_fixture();b["cognitiveBindings"]=[]
        self.assert_bad(b,"REASONING_BINDING_REQUIRED")

    def test_reasoning_disabled_cannot_load_model(self):
        b=cognitive_fixture();b["agent"]["modules"][0]["enabled"]=False
        self.assert_bad(b,"REASONING_DISABLED")

    def test_stale_model_pin_rejected(self):
        b=cognitive_fixture();b["modelProfiles"][0]["modelRevision"]="unexpected"
        self.assert_bad(b,"DIGEST_MISMATCH_MODELPROFILES")

    def test_instruction_substitution_denied(self):
        b=cognitive_fixture();b["instructionPackages"][0]["layers"][0]["contentDigest"]="sha256:"+"0"*64
        self.assert_bad(b,"DIGEST_MISMATCH_INSTRUCTIONPACKAGES")

    def test_instruction_role_cannot_assume_system_priority(self):
        b=cognitive_fixture();b["instructionPackages"][0]["layers"][0]["role"]="USER"
        self.assert_bad(rebind(b),"INSTRUCTION_PRIORITY_MISMATCH")

    def test_planning_exceeding_horizon_denied(self):
        b=cognitive_fixture();b["planningProfiles"][0]["maxTaskHorizonSteps"]=1
        self.assert_bad(rebind(b),"PLAN_EXCEEDS_HORIZON")

    def test_plan_cycle_denied(self):
        b=cognitive_fixture()
        b["planningProfiles"][0]["nodes"][0]["dependsOn"]=[ID+".PLAN.ACTION"]
        self.assert_bad(rebind(b),"CYCLIC_PLAN")

    def test_unadmitted_plan_tool_denied(self):
        b=cognitive_fixture();b["planningProfiles"][0]["nodes"][1]["capabilityRef"]["id"]=ID+".UNKNOWN"
        self.assert_bad(rebind(b),"UNDECLARED_PLAN_CAPABILITY")

    def test_mandatory_stop_conditions_are_not_optional(self):
        b=cognitive_fixture();b["planningProfiles"][0]["stopConditions"]=["GOAL_REACHED"]
        self.assert_bad(rebind(b),"MANDATORY_PLAN_STOPS_MISSING")

    def test_context_over_model_budget_denied(self):
        b=cognitive_fixture();b["contextPolicies"][0]["maxAssembledTokens"]=9000
        self.assert_bad(rebind(b),"CONTEXT_EXCEEDS_MODEL_WINDOW")

    def test_bounded_budget_requests_stop(self):
        p=cognitive_fixture()["planningProfiles"][0]
        self.assertEqual("STOP_REQUIRED",evaluate_declared_budget(
            p,iterations=6,model_tokens=100,tool_calls=1,
            elapsed_seconds=10,cost_minor=4)["status"])
        r=evaluate_declared_budget(p,iterations=1,model_tokens=100,
                                   tool_calls=1,elapsed_seconds=10,cost_minor=4)
        self.assertEqual("WITHIN_DECLARED_BOUNDS",r["status"])
        self.assertFalse(r["execution_authorized"])

    def test_enabled_memory_without_policy_denied(self):
        b=cognitive_fixture(memory=True)
        b["memoryProfiles"]=[]
        self.assert_bad(b,"MEMORY_PROFILE_REQUIRED")

    def test_disabled_memory_rejected_even_with_profile(self):
        b=cognitive_fixture(memory=True)
        next(m for m in b["agent"]["modules"] if m["kind"]=="MEMORY")["enabled"]=False
        self.assert_bad(rebind(b),"MEMORY_DISABLED")

    def test_memory_entry_cannot_expand_scope(self):
        b=cognitive_fixture(memory=True)
        b["memoryEntries"][0]["scope"]="outside/item"
        self.assert_bad(b,"MEMORY_ENTRY_SCOPE_INVALID")

    def test_memory_retention_limit(self):
        b=cognitive_fixture(memory=True)
        b["memoryEntries"][0]["expiresAt"]="2027-11-01T00:00:00+00:00"
        self.assert_bad(b,"MEMORY_RETENTION_EXCEEDED")

    def test_expired_memory_must_not_remain_active(self):
        b=cognitive_fixture(memory=True)
        b["memoryEntries"][0]["expiresAt"]="2026-10-29T09:00:00+00:00"
        self.assert_bad(b,"EXPIRED_MEMORY_NOT_ERASED")

    def test_memory_untrusted_tool_requires_quarantine(self):
        b=cognitive_fixture(memory=True)
        e=b["memoryEntries"][0];e["originKind"]="TOOL";e["trustLabel"]="UNVERIFIED"
        self.assert_bad(b,"UNTRUSTED_MEMORY_NOT_QUARANTINED")

    def test_quarantined_poison_entry_cannot_retrieve(self):
        b=cognitive_fixture(memory=True,retrieval=True)
        e=b["memoryEntries"][0];e["originKind"]="DOCUMENT"
        e["trustLabel"]="UNVERIFIED";e["quarantined"]=True
        self.assertEqual("STATIC_COGNITIVE_ELIGIBLE",self.check(b)["status"])
        result=assess_retrieval(b,entry_id=ID+".ENTRY",
                                policy_id=ID+".RETRIEVAL.POLICY",
                                destination_scope="synthetic/item",
                                destination_trust_domain="synthetic",at=NOW)
        self.assertEqual("BLOCKED",result["status"],result)
        self.assertFalse(result["authority_granted"])

    def test_cross_domain_retrieval_is_restricted(self):
        b=cognitive_fixture(memory=True,retrieval=True)
        r=assess_retrieval(b,entry_id=ID+".ENTRY",policy_id=ID+".RETRIEVAL.POLICY",
                           destination_scope="synthetic/item",
                           destination_trust_domain="other-domain",at=NOW)
        self.assertEqual("BLOCKED",r["status"])
        self.assertIn("CROSS_DOMAIN_RETRIEVAL_REQUIRES_EXTERNAL_REVIEW",r["reasons"])

    def test_valid_declared_retrieval_is_not_source_attestation(self):
        b=cognitive_fixture(memory=True,retrieval=True)
        r=assess_retrieval(b,entry_id=ID+".ENTRY",policy_id=ID+".RETRIEVAL.POLICY",
                           destination_scope="synthetic/item",
                           destination_trust_domain="synthetic",at=NOW)
        self.assertEqual("STATIC_RETRIEVAL_ELIGIBLE",r["status"],r)
        self.assertFalse(r["authority_granted"])
        self.assertFalse(r["content_trust_verified"])

    def test_compaction_critical_facts_cannot_silently_disappear(self):
        p=cognitive_fixture()["contextPolicies"][0]
        facts=[{"claimId":"1","sourceRef":"doc:a","sourceDigest":"sha256:aaa","critical":True},
               {"claimId":"2","sourceRef":"doc:b","sourceDigest":"sha256:bbb","critical":False}]
        bad=assess_compaction(p,facts,[facts[1]])
        self.assertEqual("REJECTED",bad["status"])
        self.assertEqual(["1"],bad["missing_critical_claims"])
        good=assess_compaction(p,facts,[facts[0]])
        self.assertEqual("STRUCTURAL_FIDELITY_ONLY",good["status"])
        self.assertFalse(good["semantic_fidelity_verified"])

    def test_memory_cannot_become_authoritative_data(self):
        b=cognitive_fixture(memory=True)
        b["memoryProfiles"][0]["storeTypes"].append("DOMAIN_DATA")
        self.assert_bad(rebind(b),"AUTHORITATIVE_DATA_CANNOT_BE_LEARNED_MEMORY")

    def test_context_cannot_enable_unbound_retrieval(self):
        b=cognitive_fixture();b["contextPolicies"][0]["contextSources"].append("RETRIEVED_CONTENT")
        self.assert_bad(rebind(b),"RETRIEVAL_SOURCE_DISABLED")

    def test_memory_entry_authority_is_prohibited_in_schema(self):
        b=cognitive_fixture(memory=True)
        b["memoryEntries"][0]["instructionAuthority"]=True
        self.assert_bad(b,"INVALID_COMPOSITE_BUNDLE")

    def test_static_checks_cannot_prove_source_truth(self):
        r=self.check(cognitive_fixture(memory=True,retrieval=True))
        self.assertTrue(r["external_verification_required"])
        self.assertFalse(r["evidence_verified"])
        self.assertIn("CONTEXT_SUMMARY_SEMANTIC_FIDELITY",r["unverified"])

if __name__=="__main__":
    unittest.main()
