import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as runtimeNamespace from "../../apps/web/lib/cdx/runtime.ts";

const runtime = (runtimeNamespace as any).default ?? runtimeNamespace;
const {
  buildDirectorSessionContext,
  buildRuntimeProbeContext,
  createSpetlEvent,
  evaluateCdxDecision,
  verifyPinnedPolicy,
} = runtime;

const integrity = await verifyPinnedPolicy();
assert.equal(integrity.valid, true, "Pinned CDX 1.0 policy integrity must pass");
assert.equal(integrity.gitBlob, "git-blob-sha1:55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0");

const allow = await evaluateCdxDecision(buildDirectorSessionContext(true));
assert.equal(allow.decision, "ALLOW");
const deny = await evaluateCdxDecision(buildDirectorSessionContext(false));
assert.equal(deny.decision, "DENY");
const unavailable = await evaluateCdxDecision(buildDirectorSessionContext(true), { policy: null });
assert.equal(unavailable.decision, "SECURITY_STOP");

const probeAllow = await evaluateCdxDecision(buildRuntimeProbeContext(true));
assert.equal(probeAllow.decision, "ALLOW");
const probeDeny = await evaluateCdxDecision(buildRuntimeProbeContext(false));
assert.equal(probeDeny.decision, "DENY");

const blockedEvidence = await createSpetlEvent(buildRuntimeProbeContext(false), probeDeny, "BLOCKED");
assert.equal(blockedEvidence.schema_version, "1.1");
assert.match(String(blockedEvidence.event_hash), /^sha256:[0-9a-f]{64}$/);

const route = readFileSync("apps/web/app/api/session/route.ts", "utf8");
const evaluationIndex = route.indexOf("evaluateCdxDecision(cdxContext)");
const preEvidenceIndex = route.indexOf("emitSpetlEvent(preEffectEvidence)");
const cookieIndex = route.indexOf("response.cookies.set");
assert.ok(evaluationIndex >= 0 && preEvidenceIndex > evaluationIndex && cookieIndex > preEvidenceIndex);

const middleware = readFileSync("apps/web/middleware.ts", "utf8");
assert.ok(middleware.includes('"/api/cdx/runtime-proof"'), "Runtime proof endpoint must bypass Director-session middleware and rely on its dedicated probe token");

const proof = readFileSync("apps/web/app/api/cdx/runtime-proof/route.ts", "utf8");
const proofEval = proof.indexOf("evaluateCdxDecision");
const proofPre = proof.indexOf("emitSpetlEvent(pre)");
const proofCookie = proof.indexOf("response.cookies.set");
assert.ok(proofEval >= 0 && proofPre > proofEval && proofCookie > proofPre);

console.log(JSON.stringify({
  result: "PASS",
  contract: "CDX-RUNTIME-001@1.0.0",
  policy_git_blob: integrity.gitBlob,
  director_allow: allow.decision,
  director_deny: deny.decision,
  policy_unavailable: unavailable.decision,
  probe_allow: probeAllow.decision,
  probe_deny: probeDeny.decision,
  spetl_schema: blockedEvidence.schema_version,
  effect_order: "CDX_POLICY -> PRE_EFFECT_SPETL -> LOCAL_EFFECT -> POST_EFFECT_SPETL"
}, null, 2));
