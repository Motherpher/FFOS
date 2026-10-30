import { NextRequest, NextResponse } from "next/server";
import {
  buildRuntimeProbeContext,
  createSpetlEvent,
  emitSpetlEvent,
  evaluateCdxDecision,
  isPermissive,
} from "../../../../lib/cdx/runtime";

const PROBE_COOKIE = "ffos_cdx_runtime_probe";

function sameString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(request: NextRequest) {
  const configured = process.env.CDX_RUNTIME_PROBE_TOKEN ?? "";
  const supplied = request.headers.get("x-cdx-runtime-probe") ?? "";
  const tokenMatch = configured.length >= 32 && sameString(configured, supplied);
  const context = buildRuntimeProbeContext(tokenMatch);

  const requestedMode = request.headers.get("x-cdx-probe-mode");
  const result = requestedMode === "policy-unavailable" && tokenMatch
    ? await evaluateCdxDecision(context, { policy: null })
    : await evaluateCdxDecision(context);

  const permissive = isPermissive(result.decision) && tokenMatch;
  const pre = await createSpetlEvent(
    context,
    result,
    permissive ? "NOT_ATTEMPTED" : "BLOCKED",
  );
  emitSpetlEvent(pre);

  if (!permissive) {
    const status = result.decision === "SECURITY_STOP" || result.decision === "CONSTITUTIONAL_STOP"
      ? 503
      : 403;
    return NextResponse.json(
      { ok: false, decision: result.decision, reason: result.reason ?? null },
      { status },
    );
  }

  const response = NextResponse.json({
    ok: true,
    decision: result.decision,
    contract: "CDX-RUNTIME-001@1.0.0",
  });
  response.cookies.set({
    name: PROBE_COOKIE,
    value: context.run_id,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/cdx/runtime-proof",
    maxAge: 120,
  });

  const post = await createSpetlEvent(
    context,
    result,
    "PERMITTED",
    pre.event_hash,
    "EFFECT_RESULT",
  );
  emitSpetlEvent(post);
  return response;
}
