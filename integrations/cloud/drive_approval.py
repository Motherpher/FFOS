"""Director-only Drive mutation approval verifier.

OAI-DRIVE-APPEND-ONLY-001. Offline, deterministic and fail-closed.
This module DOES NOT issue approvals or execute Google Drive writes.
A separate human-authenticated issuer must sign exact proposals using an
isolated secret. No agent or connector may hold the issuer credential.
"""
import hashlib
import hmac
import json
import sqlite3
from datetime import datetime, timezone

POLICY_ID = "OAI-DRIVE-APPEND-ONLY-001"
MUTATIONS = frozenset({
    "EDIT_EXISTING", "APPEND_EXISTING", "RENAME", "MOVE", "TRASH",
    "DELETE", "PERMANENT_DELETE", "RESTORE", "PERMISSION_CHANGE",
    "OWNERSHIP_CHANGE", "COPY_EXISTING", "COMMENT_CHANGE",
    "DOCS_BATCH_UPDATE", "SHEETS_BATCH_UPDATE", "SLIDES_BATCH_UPDATE",
    "SYNC_MUTATION", "CLEANUP", "ROLLBACK", "METADATA_UPDATE",
})
REQUIRED = frozenset({
    "approval_id", "approver_id", "actor_id", "run_id", "target_id",
    "operation", "policy_id", "policy_digest", "target_fingerprint",
    "effect_digest", "nonce", "issued_at", "expires_at",
})


def _canonical(obj):
    return json.dumps(obj, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":"), allow_nan=False).encode()


def effect_fingerprint(target_metadata):
    """Hash only the exact observed target fields, avoiding data disclosure."""
    if not isinstance(target_metadata, dict):
        raise ValueError("Target metadata must be a dictionary")
    mandatory = ("id", "parents", "name", "mimeType", "version")
    if any(x not in target_metadata for x in mandatory):
        raise ValueError("Target metadata incomplete; refusing to authorize mutation")
    return hashlib.sha256(_canonical({
        k: target_metadata[k] for k in sorted(target_metadata)
    })).hexdigest()


def decision(operation, *, authorization=None):
    """Read/create may be considered; a modification without proof waits."""
    if operation == "READ":
        return "ALLOW_WITH_CONTROLS"
    if operation == "CREATE_NEW":
        return "ALLOW_WITH_CONTROLS"
    if operation in MUTATIONS:
        return "REQUIRE_HUMAN" if authorization is None else "DENY"
    return "DENY"


def verify_and_consume(signed_record, *, shared_verifier_secret, requested,
                       target_metadata, ledger_path, now=None):
    """Validate exact effect and atomically consume a trusted one-time grant.

    Call immediately before a separately guarded effect. Issuance must occur in
    an authenticated Director-owned service; this verifier cannot issue grants.
    The signer secret is an example verification mechanism, NOT a deployment
    authorization; placing it in a consumer with an AI-controlled signing path
    defeats separation of duties. Use an isolated asymmetric signature service
    when the distributed production architecture is constructed.
    """
    def denied(reason):
        return {"decision": "DENY", "reason": reason}
    if (not isinstance(signed_record, dict)
            or set(signed_record) != {"payload", "signature"}):
        return denied("INVALID_APPROVAL")
    payload, signature = signed_record["payload"], signed_record["signature"]
    if not isinstance(payload, dict) or not REQUIRED.issubset(payload):
        return denied("MISSING_APPROVAL_FIELDS")
    if not isinstance(signature, str) or len(signature) != 64:
        return denied("INVALID_SIGNATURE")
    if (not isinstance(shared_verifier_secret, bytes)
            or len(shared_verifier_secret) < 32):
        return denied("UNCONFIGURED_VERIFIER")
    expected = hmac.new(shared_verifier_secret, _canonical(payload),
                        hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        return denied("INVALID_SIGNATURE")
    if payload.get("policy_id") != POLICY_ID:
        return denied("WRONG_POLICY")
    if payload.get("operation") not in MUTATIONS:
        return denied("NO_MUTATION_AUTHORITY")
    if not isinstance(requested, dict):
        return denied("INVALID_REQUEST")
    for key in ("actor_id", "run_id", "target_id", "operation",
                "policy_digest", "effect_digest"):
        if payload[key] != requested.get(key):
            return denied("TARGET_OR_EFFECT_MISMATCH")
    if not isinstance(payload["approver_id"], str) or not payload["approver_id"]:
        return denied("MISSING_HUMAN_APPROVER")
    if not isinstance(payload["nonce"], str) or len(payload["nonce"]) < 16:
        return denied("INVALID_NONCE")
    if not isinstance(payload["approval_id"], str) or not payload["approval_id"]:
        return denied("INVALID_APPROVAL_ID")
    try:
        observed = effect_fingerprint(target_metadata)
    except (ValueError, TypeError):
        return denied("INCOMPLETE_TARGET_METADATA")
    if not hmac.compare_digest(observed, str(payload["target_fingerprint"])):
        return denied("TARGET_CHANGED")
    try:
        timestamp = now if now is not None else datetime.now(timezone.utc).timestamp()
        issued = float(payload["issued_at"])
        expiry = float(payload["expires_at"])
    except (TypeError, ValueError, OverflowError):
        return denied("INVALID_APPROVAL_TIME")
    if (expiry <= issued or expiry - issued > 900
            or issued > timestamp or timestamp >= expiry):
        return denied("EXPIRED_OR_INVALID_SCOPE")
    if not isinstance(ledger_path, str) or not ledger_path:
        return denied("NO_REPLAY_LEDGER")
    # A durable, shared backend is required for concurrent production workers.
    # SQLite is appropriate only for local, single-host candidate verification.
    try:
        with sqlite3.connect(ledger_path, timeout=5, isolation_level=None) as db:
            db.execute("CREATE TABLE IF NOT EXISTS used_approvals "
                       "(approval_id TEXT PRIMARY KEY, nonce TEXT UNIQUE NOT NULL)")
            db.execute("BEGIN IMMEDIATE")
            db.execute("INSERT INTO used_approvals (approval_id, nonce) VALUES (?, ?)",
                       (payload["approval_id"], payload["nonce"]))
            db.execute("COMMIT")
    except sqlite3.Error:
        return denied("REPLAY_OR_LEDGER_FAILURE")
    return {"decision": "ALLOW_WITH_CONTROLS",
            "reason": "SINGLE_USE_DIRECTOR_APPROVAL_VERIFIED",
            "approval_id": payload["approval_id"], "target_id": payload["target_id"],
            "effect_digest": payload["effect_digest"]}


def make_test_only_signature(payload, secret):
    """Test helper. NEVER expose an approval-signing method to AI clients."""
    return {"payload": payload,
            "signature": hmac.new(secret, _canonical(payload),
                                  hashlib.sha256).hexdigest()}
