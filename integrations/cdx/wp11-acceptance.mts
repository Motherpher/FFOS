import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildDirectorSessionContext,
  createSpetlEvent,
  evaluateCdxDecision,
  verifyPinnedPolicy,
} from "../../apps/web/lib/cdx/runtime";

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

const route = readFileSync("apps/web/app/api/session/route.ts", "utf8");
const evaluationIndex = route.indexOf("evaluateCdxDecision(cdxContext)");
const preEvidenceIndex = route.indexOf("emitSpetlEvent(preEffectEvidence)");
const cookieIndex = route.indexOf("response.cookies.set");
assert.ok(evaluationIndex >= 0 && preEvidenceIndex > evaluationIndex && cookieIndex > preEvidenceIndex,
  "Production session effect must occur only after CDX evaluation and pre-effect SPETL evidence");

console.log(JSON.stringify({
  result: "PASS",
  contract: "CDX-RUNTIME-001@1.0.0",
  policy_git_blob: integrity.gitBlob,
  allow: allow.decision,
  deny: deny.decision,
  policy_unavailable: unavailable.decision,
  route_order: "POLICY_EVALUATION -> PRE_EFFECT_SPETL -> SESSION_COOKIE",
  spetl_schema: blockedEvidence.schema_version
}, null, 2));
