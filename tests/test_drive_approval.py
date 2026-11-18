"""Offline Drive exact-object approval tests; never call Google."""
import hashlib
import hmac
import json
from pathlib import Path
import tempfile
import unittest
from integrations.cloud.drive_approval import (
    POLICY_ID, decision, effect_fingerprint, verify_and_consume,
)

SECRET = b"this-is-a-fixture-key-that-is-not-a-production-secret-123"
META = {"id":"1EXISTING_FILE_00001", "parents":["1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD"],
        "name":"protected.pdf", "mimeType":"application/pdf", "version":"5"}
REQUEST = {"actor_id":"agent:ffc", "run_id":"run-87",
           "target_id":META["id"], "operation":"RENAME",
           "policy_digest":"sha256:policy-001", "effect_digest":"sha256:proposed-001"}


def signed(**changes):
    payload = {
        **REQUEST, "approval_id":"approval-A", "approver_id":"director",
        "policy_id":POLICY_ID, "target_fingerprint": effect_fingerprint(META),
        "nonce":"fixed-once-unique-value-1234", "issued_at":950,
        "expires_at":1050, **changes,
    }
    body = json.dumps(payload, sort_keys=True, separators=(",", ":"),
                      ensure_ascii=False, allow_nan=False).encode()
    return {"payload":payload, "signature":hmac.new(
        SECRET,body,hashlib.sha256).hexdigest()}


class ExactObjectApprovalTests(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.TemporaryDirectory()
        self.addCleanup(self.t.cleanup)
        self.ledger = str(Path(self.t.name)/"used.sqlite")

    def check(self, record, *, requested=REQUEST, meta=META, now=1000, secret=SECRET):
        return verify_and_consume(record, shared_verifier_secret=secret,
                                  requested=requested, target_metadata=meta,
                                  ledger_path=self.ledger, now=now)

    def test_default_classes(self):
        self.assertEqual(decision("READ"),"ALLOW_WITH_CONTROLS")
        self.assertEqual(decision("CREATE_NEW"),"ALLOW_WITH_CONTROLS")
        self.assertEqual(decision("DELETE"),"REQUIRE_HUMAN")
        self.assertEqual(decision("DELETE",authorization={}),"DENY")
        self.assertEqual(decision("unknown"),"DENY")

    def test_valid_approval_consumed_exactly_once(self):
        grant=signed()
        first=self.check(grant)
        self.assertEqual(first["decision"],"ALLOW_WITH_CONTROLS")
        self.assertEqual(first["approval_id"],"approval-A")
        self.assertEqual(self.check(grant)["decision"],"DENY")

    def test_wrong_signature_fails_closed(self):
        grant=signed()
        grant["signature"]="0"*64
        self.assertEqual(self.check(grant)["reason"],"INVALID_SIGNATURE")

    def test_wrong_target_and_effect_fail(self):
        for changes in ({"target_id":"1different-existing-id"},
                        {"effect_digest":"sha256:surprise"}):
            with self.subTest(changes=changes):
                self.assertEqual(self.check(signed(),requested={**REQUEST,**changes})["decision"],"DENY")

    def test_changed_metadata_invalidates_approval(self):
        changed={**META,"version":"6"}
        self.assertEqual(self.check(signed(),meta=changed)["reason"],"TARGET_CHANGED")

    def test_unauthorized_operation_never_allowed(self):
        self.assertEqual(self.check(signed(operation="DELETE"))["decision"],"DENY")
        self.assertEqual(self.check(signed(operation="CREATE_NEW"))["decision"],"DENY")

    def test_time_and_nonce_fail_closed(self):
        for change in ({"issued_at":1005},{"expires_at":999},
                       {"expires_at":2000},{"nonce":"short"}):
            with self.subTest(change=change):
                self.assertEqual(self.check(signed(**change))["decision"],"DENY")

    def test_policy_mismatch_fails(self):
        self.assertEqual(self.check(signed(policy_id="other-policy"))["decision"],"DENY")

    def test_replay_nonce_across_different_id_is_denied(self):
        self.assertEqual(self.check(signed())["decision"],"ALLOW_WITH_CONTROLS")
        self.assertEqual(self.check(signed(approval_id="approval-B"))["reason"],
                         "REPLAY_OR_LEDGER_FAILURE")

    def test_unavailable_replay_store_fails_closed(self):
        grant=signed()
        self.ledger=self.t.name + "/no-such-directory/db.sqlite"
        self.assertEqual(self.check(grant)["reason"],"REPLAY_OR_LEDGER_FAILURE")

    def test_no_existing_target_fingerprint_denied(self):
        self.assertEqual(self.check(signed(),meta={"id":META["id"]})["decision"],"DENY")

    def test_short_verifier_key_denied(self):
        self.assertEqual(self.check(signed(),secret=b"weak")["reason"],"UNCONFIGURED_VERIFIER")


if __name__ == "__main__":
    unittest.main()
