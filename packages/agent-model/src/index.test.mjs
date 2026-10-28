// Agent Stable pure contract guard tests. No CDX adapter, tool invocation or effects.
import test from "node:test";
import assert from "node:assert/strict";
import { assertExecutionContext, effectWithinCeiling } from "./index.ts";

function fixture() {
  const manifest = {
    schema: "ffos.ama.agent-manifest/v1",
    agentId: "FFOS.TEST.OBSERVER",
    name: "Synthetic fixture",
    agentVersion: "0.1.0",
    amaVersion: "0.1.0",
    purpose: "Test",
    mandate: { scope: ["fixtures"], nonGoals: ["external effects"] },
    runtimeClass: "REQUEST_RESPONSE",
    lifecycleState: "ACTIVE",
    authority: {
      governingAuthority: "DIRECTOR",
      authorityRefRequired: true,
      mandateRefRequired: true,
      selfApprovalProhibited: true,
    },
    effectCeiling: "E1_INTERNAL_STATE",
    workflows: ["FIXTURE_INSPECT"],
    commands: ["FIXTURE_STATUS"],
    capabilities: ["FIXTURE_READ"],
    statePolicy: { durableState: false, memoryMode: "NONE" },
    evidence: { runRecordRequired: true, failedRunRecordRequired: true },
    conformance: {
      profile: "STATIC",
      regressionRequired: true,
      authorityDenialTestsRequired: true,
    },
  };
  const context = {
    runId: "test-run",
    agentId: "FFOS.TEST.OBSERVER",
    agentVersion: "0.1.0",
    amaVersion: "0.1.0",
    workflowId: "FIXTURE_INSPECT",
    workflowVersion: "0.1.0",
    principalRef: "test-principal",
    authorityRef: "authority-test",
    mandateRef: "mandate-test",
    requestedEffect: "E1_INTERNAL_STATE",
    inputRefs: [],
  };
  return {manifest, context};
}

test("valid structural context passes without claiming policy approval", () => {
  const {manifest, context} = fixture();
  assert.doesNotThrow(() => assertExecutionContext(manifest, context));
});

test("agent identity mismatch denied", () => {
  const {manifest, context} = fixture();
  context.agentId = "OTHER";
  assert.throws(() => assertExecutionContext(manifest, context), /agentId/);
});

test("unregistered workflow denied", () => {
  const {manifest, context} = fixture();
  context.workflowId = "UNKNOWN";
  assert.throws(() => assertExecutionContext(manifest, context), /not registered/);
});

test("missing authority denied for consequential effect, even when false in manifest", () => {
  const {manifest, context} = fixture();
  manifest.authority.authorityRefRequired = false;
  context.authorityRef = undefined;
  assert.throws(() => assertExecutionContext(manifest, context), /authority_ref/);
});

test("missing mandate denied for consequential effect, even when false in manifest", () => {
  const {manifest, context} = fixture();
  manifest.authority.mandateRefRequired = false;
  context.mandateRef = undefined;
  assert.throws(() => assertExecutionContext(manifest, context), /mandate_ref/);
});

test("inactive lifecycle denied", () => {
  const {manifest, context} = fixture();
  manifest.lifecycleState = "SUSPENDED";
  assert.throws(() => assertExecutionContext(manifest, context), /not ACTIVE/);
});

test("missing principal or run identity denied", () => {
  const {manifest, context} = fixture();
  context.principalRef = "";
  assert.throws(() => assertExecutionContext(manifest, context), /Principal/);
});

test("excess effect denied", () => {
  const {manifest, context} = fixture();
  context.requestedEffect = "E2_REPOSITORY_CHANGE";
  assert.throws(() => assertExecutionContext(manifest, context), /ceiling/);
});

test("effect rank is monotonic", () => {
  assert.equal(effectWithinCeiling("E0_OBSERVE", "E1_INTERNAL_STATE"), true);
  assert.equal(effectWithinCeiling("E2_REPOSITORY_CHANGE", "E1_INTERNAL_STATE"), false);
});
