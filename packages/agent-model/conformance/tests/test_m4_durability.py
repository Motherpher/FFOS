"""M4 static conformance, distinct from real PostgreSQL integration/verification."""
import copy,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_vnext import digest
from ama_durability import validate_durability_contract
from test_m1_contracts import task_fixture,pin
V="0.2.0"

def fixture():
    b=task_fixture()
    a=b["agent"];task=b["tasks"][0]
    ar={"id":a["agentId"],"version":a["agentVersion"],"digest":digest(a)}
    run={"schema":"ama.run/v0.2-candidate","runId":task["runId"],"version":V,
         "taskRef":pin(task,"taskId"),"agentRef":ar,
         "workflowRef":pin(b["workflows"][0],"workflowId"),
         "policyRef":{"id":"SYNTHETIC.POLICY","version":V,"digest":"sha256:"+"a"*64},
         "state":"HOLD","generation":1,"leaseEpoch":1,
         "correlationId":"correlation"}
    step={"schema":"ama.step/v0.2-candidate","stepId":"SYNTHETIC.STEP",
          "version":V,"runId":run["runId"],
          "workflowStepId":"SYNTHETIC.START","state":"HOLD","attemptRefs":[]}
    attempt={"schema":"ama.attempt/v0.2-candidate","attemptId":"SYNTHETIC.ATTEMPT",
             "version":V,"runId":run["runId"],"stepId":step["stepId"],
             "workerRef":"worker","leaseEpoch":1,
             "startedAt":"2026-10-29T00:00:00Z","outcome":"UNKNOWN"}
    step["attemptRefs"].append(pin(attempt,"attemptId"))
    checkpoint={"schema":"ama.checkpoint/v0.2-candidate",
                "checkpointId":"SYNTHETIC.CHECKPOINT","version":V,"runId":run["runId"],
                "leaseEpoch":1,"generation":1,
                "stateDigest":"sha256:"+"f"*64,"stateRef":"artifact:checkpoint",
                "recordedAt":"2026-10-29T00:00:00Z"}
    b["effects"][0]["state"]="COMMITTED"
    receipt={"schema":"ama.effect-receipt/v0.2-candidate",
             "receiptId":"SYNTHETIC.RECEIPT","version":V,
             "effectRef":pin(b["effects"][0],"effectId"),"runId":run["runId"],
             "outcome":"COMMITTED","observedAt":"2026-10-29T01:00:00Z",
             "evidenceDigest":"sha256:"+"e"*64,
             "verifiedByRef":"INDEPENDENT","independentVerification":True}
    rec={"schema":"ama.reconciliation/v0.2-candidate",
         "reconciliationId":"SYNTHETIC.RECONCILIATION","runId":run["runId"],
         "effectRef":pin(b["effects"][0],"effectId"),
         "receiptRef":pin(receipt,"receiptId"),
         "outcome":"CONFIRMED_COMMITTED",
         "verificationEvidenceRef":"independent-report",
         "reviewerRef":"operator","reviewedAt":"2026-10-29T02:00:00Z"}
    b.update(runs=[run],steps=[step],attempts=[attempt],checkpoints=[checkpoint],
             effectReceipts=[receipt],reconciliations=[rec],approvalEvents=[])
    return b

class M4Durability(unittest.TestCase):
    def denied(self,b,code):
        result=validate_durability_contract(b)
        self.assertEqual("REJECTED",result["status"],result)
        self.assertIn(code,result["errors"],result)
        self.assertFalse(result["runtime_authorized"])
    def test_absent_durable_runtime_records_still_valid(self):
        from test_m1_contracts import fixture as minimal
        self.assertEqual("STATIC_DURABILITY_ELIGIBLE",
                         validate_durability_contract(minimal())["status"])
    def test_consistent_receipt_run_graph(self):
        result=validate_durability_contract(fixture())
        self.assertEqual("STATIC_DURABILITY_ELIGIBLE",result["status"],result)
        self.assertFalse(result["evidence_verified"])
    def test_wrong_agent_digest_fails(self):
        b=fixture();b["runs"][0]["agentRef"]["digest"]="sha256:"+"0"*64
        self.denied(b,"RUN_AGENT_MISMATCH")
    def test_unregistered_step_fails(self):
        b=fixture();b["steps"][0]["workflowStepId"]="SYNTHETIC.NONEXISTENT"
        self.denied(b,"STEP_NOT_IN_WORKFLOW")
    def test_receipt_without_independent_proof_fails(self):
        b=fixture();b["effectReceipts"][0]["independentVerification"]=False
        self.denied(b,"UNVERIFIED_RECEIPT")
    def test_reconciliation_without_receipt_fails(self):
        b=fixture();del b["reconciliations"][0]["receiptRef"]
        self.denied(b,"FINAL_RECONCILIATION_NO_RECEIPT")
    def test_receipt_digest_mismatch_fails(self):
        b=fixture();b["effectReceipts"][0]["evidenceDigest"]="sha256:"+"9"*64
        self.denied(b,"STALE_RECONCILIATION_RECEIPT")
    def test_future_fence_denied(self):
        b=fixture();b["attempts"][0]["leaseEpoch"]=3
        self.denied(b,"ATTEMPT_FUTURE_FENCE")
    def test_wrong_run_on_receipt_denied(self):
        b=fixture();b["effectReceipts"][0]["runId"]="SYNTHETIC.OTHER"
        self.denied(b,"RECEIPT_WRONG_RUN")
    def test_unpinned_attempt_reference_denied(self):
        b=fixture();b["steps"][0]["attemptRefs"][0]["digest"]="sha256:"+"0"*64
        self.denied(b,"STALE_STEP_ATTEMPT")
if __name__=="__main__":
    unittest.main()
