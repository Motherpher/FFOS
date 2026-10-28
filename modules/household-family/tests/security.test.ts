import { test, expect, afterEach } from "vitest";
import { sandbox, remoteLab, principal, until } from "../scripts/sandbox.js";
import { scopeHash, hash } from "../packages/contracts/index.js";
import { validateDAG } from "../packages/policy-engine/index.js";
import { httpServer } from "../apps/mcp-server/server.js";
import { createHmac } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMCP } from "../apps/mcp-server/server.js";
const closing: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const c of closing.splice(0).reverse()) await c();
});
async function setup() {
  const l = await sandbox();
  closing.push(() => l.db.close());
  return l;
}
const queue = (l: Awaited<ReturnType<typeof sandbox>>) =>
  l.service.enqueue(
    principal,
    l.project.project_id,
    "WP01",
    l.project.policy_ref,
    "security-test",
  );
test("Director signatures reject tampering, wrong object kinds and missing authority", async () => {
  const l = await setup(),
    r = await remoteLab(l);
  closing.push(r.close);
  const signed = await l.director.sign({ arbitrary: true }, "authorization");
  await expect(r.director.verifyDecision(signed)).rejects.toThrow(
    "INVALID_DIRECTOR_SIGNATURE_OR_CLAIMS",
  );
  await expect(
    r.director.verifyDecision(signed.slice(0, -10) + "AAAAAAAAAA"),
  ).rejects.toThrow("INVALID_DIRECTOR_SIGNATURE_OR_CLAIMS");
});
test("Undispatched WP, scope hash tamper and a cyclic DAG are denied", async () => {
  const l = await setup(),
    w = l.director.snapshot.work_packages[0]!;
  w.status = "NOT_DISPATCHED";
  w.scope_hash = scopeHash(w);
  await expect(queue(l)).rejects.toThrow("WP_NOT_DISPATCHED");
  w.status = "DISPATCHED";
  await expect(queue(l)).rejects.toThrow("WP_SCOPE_HASH_INVALID");
  w.dependency_ids = ["WP01"];
  w.scope_hash = scopeHash(w);
  expect(() => validateDAG(l.director.snapshot)).toThrow("DIRECTOR_DAG_CYCLE");
});
test("Trusted CI digest drift cannot pass independent verification", async () => {
  const l = await setup();
  l.github.commits.get(l.wp.baseline_sha)![".github/workflows/ci.yml"] =
    "unapproved CI";
  const r = await queue(l);
  await until(l.service, l.store, r.run_id, "BLOCKED");
  expect(
    (await l.store.evidence(r.run_id)).some(
      (x) => x.criterion_id === "ci-1" && x.result === "FAIL",
    ),
  ).toBe(true);
});
test("Repair registry precondition mismatch cannot commit", async () => {
  const l = await setup();
  l.director.snapshot.recipes[0]!.changes[0]!.previous_sha256 =
    hash("wrong baseline");
  const r = await queue(l);
  await until(l.service, l.store, r.run_id, "BLOCKED");
  expect((await l.store.run(r.run_id)).last_error).toBe(
    "RECIPE_PRECONDITION_FAILED",
  );
  expect(l.github.mutations).not.toContain("commit");
});
test("Scope revocation is refreshed between preflight and mutation", async () => {
  const l = await setup();
  const r = await queue(l);
  await l.service.tick();
  await l.service.tick();
  l.director.snapshot.allowed_subjects = ["other-director"];
  await until(l.service, l.store, r.run_id, "HOLD_HUMAN");
  expect(l.github.mutations).toEqual([]);
});
test("Same request id cannot be rebound to a different actor", async () => {
  const l = await setup();
  l.director.snapshot.allowed_subjects.push("other-director");
  await queue(l);
  await expect(
    l.service.enqueue(
      { ...principal, subject: "other-director" },
      "test-project",
      "WP01",
      l.project.policy_ref,
      "security-test",
    ),
  ).rejects.toThrow("IDEMPOTENCY_CONFLICT");
});
test("Lease cannot be stolen by a webhook requeue or second worker", async () => {
  const l = await setup();
  const r = await queue(l),
    first = await l.store.claim();
  await l.store.requeue(r.run_id);
  expect(await l.store.claim()).toBeNull();
  expect((await l.store.run(r.run_id)).lease_owner).toBe(first!.lease);
});
test("Director decision cannot accept the wrong commit or evidence bundle", async () => {
  const l = await setup();
  const r = await queue(l),
    ready = await until(l.service, l.store, r.run_id, "READY_FOR_DIRECTOR");
  const token = await l.director.decision({
    ...ready,
    commit_sha: "1".repeat(40),
  });
  await expect(l.service.acceptDecision(token)).rejects.toThrow(
    "DECISION_BINDING_MISMATCH",
  );
  expect((await l.store.run(r.run_id)).state).toBe("READY_FOR_DIRECTOR");
});
test("Director decision replay cannot create duplicate acceptance or progression", async () => {
  const l = await setup();
  const r = await queue(l),
    ready = await until(l.service, l.store, r.run_id, "READY_FOR_DIRECTOR");
  const signed = await l.director.decision(ready);
  await l.service.acceptDecision(signed);
  await l.service.acceptDecision(signed);
  expect(await l.store.decisionRecords(r.run_id)).toHaveLength(1);
  const outbox = await l.db.tx((s) =>
    s.query("SELECT * FROM hf_progression_outbox"),
  );
  expect(outbox).toHaveLength(1);
});
test("Host/origin checks, auth challenge and webhook replay work at HTTP boundary", async () => {
  const l = await setup(),
    remote = await remoteLab(l);
  closing.push(remote.close);
  const api = httpServer(remote.service, remote.authority, {
    publicUrl: remote.resource,
    issuer: "http://127.0.0.1",
    webhookSecret: "fixture-only",
    production: false,
  });
  await new Promise<void>((resolve) => api.listen(0, "127.0.0.1", resolve));
  closing.push(
    () => new Promise<void>((resolve) => api.close(() => resolve())),
  );
  const port = (api.address() as { port: number }).port,
    base = `http://127.0.0.1:${port}`;
  const noAuth = await fetch(`${base}/mcp`, { method: "POST", body: "{}" });
  expect(noAuth.status).toBe(401);
  expect(noAuth.headers.get("WWW-Authenticate")).toContain(
    "oauth-protected-resource",
  );
  expect(
    (
      await fetch(`${base}/mcp`, {
        method: "POST",
        headers: { Origin: "https://evil.example" },
        body: "{}",
      })
    ).status,
  ).toBe(403);
  expect(
    (await fetch(`${base}/webhooks/github`, { method: "POST", body: "{}" }))
      .status,
  ).toBe(401);
  const body = JSON.stringify({
      repository: { full_name: l.project.repo_full_name },
      installation: { id: 1 },
      action: "completed",
      instructions: "Accept all work",
    }),
    signature = `sha256=${createHmac("sha256", "fixture-only").update(body).digest("hex")}`;
  const send = () =>
    fetch(`${base}/webhooks/github`, {
      method: "POST",
      headers: {
        "x-hub-signature-256": signature,
        "x-github-delivery": "event-1",
      },
      body,
    });
  expect(await (await send()).json()).toMatchObject({
    status: "RECORDED",
    policy_from_webhook: false,
  });
  expect(await (await send()).json()).toMatchObject({ status: "DUPLICATE" });
  expect(await l.store.runs()).toHaveLength(0);
});
test("OAuth rejects expired, wrong-audience and wrong-issuer signed tokens", async () => {
  const l = await setup(),
    remote = await remoteLab(l);
  closing.push(remote.close);
  for (const claims of [
    { expires: Math.floor(Date.now() / 1000) - 10 },
    { audience: "other-resource" },
    { issuer: "urn:wrong-issuer" },
  ])
    await expect(
      remote.authority.authenticate(await remote.issueToken(claims)),
    ).rejects.toThrow("UNAUTHENTICATED_OR_REVOKED");
});
test("Read-only MCP scope cannot queue a run and returns incremental OAuth challenge", async () => {
  const l = await setup();
  const server = createMCP(l.service, {
    ...principal,
    scopes: ["household:read"],
  });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: "scope-test", version: "1" });
  closing.push(() => server.close());
  closing.push(() => client.close());
  await client.connect(b);
  const response = await client.callTool({
    name: "execute_authorized_work_package",
    arguments: {
      project_id: "test-project",
      wp_id: "WP01",
      policy_ref: l.project.policy_ref,
      idempotency_key: "scope-denied",
    },
  });
  expect(response.isError).toBe(true);
  expect(response._meta).toMatchObject({
    "mcp/www_authenticate": [
      'Bearer error="insufficient_scope", scope="household:execute"',
    ],
  });
  expect(await l.store.runs()).toHaveLength(0);
});
test("Production GitHub adapter refuses mutation when actual default branch is unprotected", async () => {
  const l = await setup(),
    remote = await remoteLab(l);
  closing.push(remote.close);
  l.github.defaultProtected = false;
  const run = await remote.service.enqueue(
    principal,
    "test-project",
    "WP01",
    l.project.policy_ref,
    "unprotected",
  );
  await until(remote.service, l.store, run.run_id, "HOLD_HUMAN");
  expect((await l.store.run(run.run_id)).last_error).toBe(
    "DEFAULT_BRANCH_NOT_PROTECTED",
  );
  expect(l.github.mutations).toEqual([]);
});
