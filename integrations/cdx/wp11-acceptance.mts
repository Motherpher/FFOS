import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../../apps/web/app/api/session/route.ts";
import {
  buildDirectorSessionContext,
  createSpetlEvent,
  evaluateCdxDecision,
  verifyPinnedPolicy,
} from "../../apps/web/lib/cdx/runtime.ts";

const integrity = await verifyPinnedPolicy();
assert.equal(integrity.valid, true, "Pinned CDX 1.0 policy integrity must pass");
assert.equal(integrity.gitBlob, "git-blob-sha1:55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0");

const allowContext = buildDirectorSessionContext(true);
const allow = await evaluateCdxDecision(allowContext);
assert.equal(allow.decision, "ALLOW", "Authenticated Director session issuance must be allowed");

const denyContext = buildDirectorSessionContext(false);
const deny = await evaluateCdxDecision(denyContext);
assert.equal(deny.decision, "DENY", "Unauthenticated Director assertion must be denied");

const unavailable = await evaluateCdxDecision(allowContext, { policy: null });
assert.equal(unavailable.decision, "SECURITY_STOP", "Unavailable policy must fail closed");

const blockedEvidence = await createSpetlEvent(denyContext, deny, "BLOCKED");
assert.equal(blockedEvidence.schema_version, "1.1");
assert.equal(blockedEvidence.effect_status, "BLOCKED");
assert.match(String(blockedEvidence.event_hash), /^sha256:[0-9a-f]{64}$/);

process.env.FFOS_DIRECTOR_USER = "wp11-director";
process.env.FFOS_DIRECTOR_PASSWORD = "wp11-password";
process.env.FFOS_SESSION_SECRET = "wp11-test-session-secret-with-sufficient-entropy";

const okRequest = new NextRequest("http://localhost/api/session", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ user: "wp11-director", password: "wp11-password", next: "/work" }),
});
const okResponse = await POST(okRequest);
assert.equal(okResponse.status, 303);
assert.match(okResponse.headers.get("set-cookie") ?? "", /ffos_session=/, "ALLOW must issue the real FFOS session cookie");

const deniedRequest = new NextRequest("http://localhost/api/session", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ user: "wp11-director", password: "wrong", next: "/work" }),
});
const deniedResponse = await POST(deniedRequest);
assert.equal(deniedResponse.status, 303);
assert.equal((deniedResponse.headers.get("set-cookie") ?? "").includes("ffos_session="), false, "DENY must not issue a session cookie");

console.log(JSON.stringify({
  result: "PASS",
  contract: "CDX-RUNTIME-001@1.0.0",
  policy_git_blob: integrity.gitBlob,
  allow: allow.decision,
  deny: deny.decision,
  policy_unavailable: unavailable.decision,
  consequential_effect_test: "DIRECTOR_SESSION_COOKIE_ISSUED_ONLY_ON_ALLOW",
  spetl_schema: blockedEvidence.schema_version
}, null, 2));
