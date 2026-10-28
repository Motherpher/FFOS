import {
  Gate,
  hash,
  now,
  uid,
  ffosRunState,
  type Run,
  type DirectorSnapshot,
  type Project,
  type WorkPackage,
  type Evidence,
} from "../../packages/contracts/index.js";
import { Store, terminal } from "../../packages/state/index.js";
import {
  authorize,
  authorizeRecipe,
  J_CLASSES,
  within,
} from "../../packages/policy-engine/index.js";
import type { Director } from "../../packages/director-adapter/index.js";
import type { GitHub } from "../../packages/github-adapter/index.js";
import { inspect } from "../../packages/roles/janitor/index.js";
import { executeRecipe } from "../../packages/roles/handyman/index.js";
import {
  collect,
  independentVerify,
} from "../../packages/roles/verifier/index.js";
import { evidenceBundle, verifyAudit } from "../../packages/audit/index.js";
import {
  DenyGovernance,
  type Governance,
} from "../../packages/governance-adapter/index.js";

export interface Principal {
  subject: string;
  projects: string[];
  scopes: string[];
}
export class Household {
  constructor(
    public store: Store,
    public director: Director,
    public github: GitHub,
    public governance: Governance = new DenyGovernance(),
  ) {}
  allow(principal: Principal, project_id: string, scope = "household:read") {
    if (
      !principal.projects.includes(project_id) ||
      !principal.scopes.includes(scope)
    )
      throw new Gate("INSUFFICIENT_SCOPE_OR_PROJECT_ACCESS");
  }
  async current(project_id: string, wp_id: string, run?: Run) {
    const project = await this.store.project(project_id),
      policy = await this.director.authorization(project_id);
    const wp = policy.work_packages.find((w) => w.wp_id === wp_id);
    if (!wp) throw new Gate("WP_NOT_IN_DIRECTOR_MANIFEST");
    authorize(project, policy, wp, run);
    if (run && !policy.allowed_subjects.includes(run.origin_subject))
      throw new Gate("DIRECTOR_SUBJECT_REVOKED", "HOLD_HUMAN");
    return { project, policy, wp };
  }
  async enqueue(
    principal: Principal,
    project_id: string,
    wp_id: string,
    policy_ref: string,
    idempotency_key: string,
  ) {
    this.allow(principal, project_id, "household:execute");
    const { project, policy, wp } = await this.current(project_id, wp_id);
    if (
      policy_ref !== policy.policy_ref ||
      !policy.allowed_subjects.includes(principal.subject)
    )
      throw new Gate("DIRECTOR_AUTHORITY_MISMATCH", "HOLD_HUMAN");
    const run: Run = {
      run_id: uid("run"),
      wp_id,
      wp_version: wp.version,
      project_id,
      repo: wp.repo,
      policy_version: policy.policy_version,
      policy_hash: hash(policy),
      eligibility_revision: policy.revision,
      eligibility_snapshot_hash: hash({ wp, eligible: policy.eligible_ids }),
      baseline_sha: wp.baseline_sha,
      commit_sha: wp.baseline_sha,
      branch: `hf/${hash([project_id, wp_id, wp.version]).slice(0, 24)}`,
      pr_ref: null,
      state: "ELIGIBLE",
      revision: 1,
      lease_owner: null,
      lease_expires_at: null,
      current_attempt: 0,
      created_at: now(),
      updated_at: now(),
      completed_at: null,
      last_error: null,
      correlation_id: uid("corr"),
      idempotency_key,
      wp,
      evidence_bundle_hash: null,
      stop_requested: false,
      origin_subject: principal.subject,
      recipe_bases: {},
      recovery_state: null,
    };
    return this.store.enqueue(run);
  }
  async eligible(principal: Principal, project_id: string) {
    this.allow(principal, project_id);
    const project = await this.store.project(project_id),
      policy = await this.director.authorization(project_id);
    for (const id of policy.eligible_ids) {
      const wp = policy.work_packages.find((w) => w.wp_id === id)!;
      authorize(project, policy, wp);
      if (
        !(await this.store.runs(project_id)).some(
          (r) => r.wp_id === id && r.wp_version === wp.version,
        )
      )
        return {
          status: "ELIGIBLE",
          wp,
          policy_version: policy.policy_version,
          revision: policy.revision,
        };
    }
    return {
      status: "NONE_ELIGIBLE",
      wp: null,
      policy_version: policy.policy_version,
      revision: policy.revision,
    };
  }
  async status(principal: Principal, project_id?: string) {
    if (project_id) this.allow(principal, project_id);
    const projects = (await this.store.projects()).filter(
      (p) =>
        principal.projects.includes(p.project_id) &&
        (!project_id || p.project_id === project_id),
    );
    const summaries = [];
    for (const p of projects) {
      const runs = await this.store.runs(p.project_id);
      const events = await this.store.audit(p.project_id);
      const queue = await this.store.db.tx((s) =>
        s.query(
          "SELECT state,attempts,failure_count,last_error,lease_expires_at FROM hf_jobs WHERE project_id=?",
          [p.project_id],
        ),
      );
      const progression = await this.store.db.tx((s) =>
        s.query(
          "SELECT decision_id,state,attempts,last_error FROM hf_progression_outbox WHERE project_id=?",
          [p.project_id],
        ),
      );
      summaries.push({
        project_id: p.project_id,
        repository: p.repo_full_name,
        enabled: p.enabled,
        permission: p.permission,
        runs: runs.map((r) => ({
          run_id: r.run_id,
          wp_id: r.wp_id,
          state: r.state,
          ffos_state: ffosRunState(r.state),
          current_attempt: r.current_attempt,
          commit_sha: r.commit_sha,
          pr_ref: r.pr_ref,
          last_error: r.last_error,
          updated_at: r.updated_at,
        })),
        queue,
        progression,
        metrics: {
          repair_attempts: runs.reduce((n, r) => n + r.current_attempt, 0),
          stale_leases: runs.filter(
            (r) => r.lease_owner && r.lease_expires_at! <= Date.now(),
          ).length,
          dead_letters:
            queue.filter((j) => j.state === "DEAD").length +
            progression.filter((j) => j.state === "DEAD").length,
          recorded_lead_seconds: runs
            .filter((r) => r.completed_at)
            .map(
              (r) =>
                (Date.parse(r.completed_at!) - Date.parse(r.created_at)) / 1000,
            ),
        },
        audit_chain_valid: verifyAudit(events),
        latest_observation: events.at(-1)?.timestamp ?? p.updated_at,
      });
    }
    return {
      status: summaries.some((p) =>
        p.runs.some((r) => r.ffos_state === "RUNNING"),
      )
        ? "RUNNING"
        : summaries.some(
              (p) =>
                p.runs.some((r) => r.ffos_state === "HOLD") ||
                p.metrics.dead_letters > 0,
            )
          ? "HOLD"
          : summaries.some((p) => p.runs.some((r) => r.ffos_state === "QUEUED"))
            ? "QUEUED"
            : "IDLE",
      projects: summaries,
    };
  }
  async patrol(principal: Principal, project_id: string, scope?: string[]) {
    this.allow(principal, project_id);
    const p = await this.store.project(project_id);
    const paths = scope ?? p.allowed_paths;
    if (paths.length > 20 || paths.some((x) => !within(x, p.allowed_paths)))
      throw new Gate("PATROL_SCOPE_NOT_ALLOWLISTED");
    const head = await this.github.head(p, p.protected_branches[0]!);
    const files = [];
    for (const path of paths) {
      const f = await this.github.read(p, path, head);
      files.push({
        path,
        exists: f.content !== null,
        blob_sha: f.blob_sha,
        content_digest: f.content === null ? null : hash(f.content),
        source: f.source,
      });
    }
    return {
      status: "OBSERVED",
      head,
      files,
      J_class: "UNDETERMINED",
      mutation_performed: false,
      canonical_classes: J_CLASSES,
    };
  }
  async evidence(principal: Principal, run_id: string) {
    const r = await this.store.run(run_id);
    this.allow(principal, r.project_id);
    const rows = await this.store.evidence(run_id);
    return {
      status: r.state,
      run: r,
      evidence: rows,
      operations: await this.store.operations(run_id),
      decisions: await this.store.decisionRecords(run_id),
      audit: await this.store.audit(r.project_id, run_id),
    };
  }
  async stop(
    principal: Principal,
    run_id: string,
    reason: string,
    key: string,
  ) {
    const r = await this.store.run(run_id);
    this.allow(principal, r.project_id, "household:control");
    return this.store.stop(run_id, reason, key, principal.subject);
  }
  async resume(principal: Principal, run_id: string, key: string) {
    let r = await this.store.run(run_id);
    this.allow(principal, r.project_id, "household:execute");
    if (r.stop_requested || terminal.has(r.state))
      throw new Gate("TERMINAL_RUN_REQUIRES_NEW_DIRECTOR_REVISION");
    if (r.lease_owner && r.lease_expires_at! > Date.now())
      throw new Gate("RUN_CURRENTLY_LEASED");
    await this.current(r.project_id, r.wp_id, r);
    if (["BLOCKED", "HOLD_HUMAN"].includes(r.state))
      r = await this.store.transition(
        run_id,
        "RECOVERY_CHECK",
        principal.subject,
        { idempotency_key: key },
      );
    await this.store.requeue(run_id);
    return r;
  }
  async acceptDecision(signed: string) {
    const d = await this.director.verifyDecision(signed),
      r = await this.store.run(d.run_id),
      p = await this.store.project(r.project_id),
      s = await this.director.authorization(r.project_id);
    if (
      !p.enabled ||
      s.revoked ||
      !s.allowed_subjects.includes(r.origin_subject) ||
      s.policy_ref !== p.policy_ref ||
      Date.parse(s.expires_at) <= Date.now() ||
      s.policy_version !== d.director_policy_version ||
      s.authority_ref !== d.authority_ref
    )
      throw new Gate("DIRECTOR_DECISION_AUTHORITY_NOT_CURRENT", "HOLD_HUMAN");
    const old = await this.store.decisionRecords(r.run_id);
    if (old.some((x) => x.decision_id === d.decision_id))
      return this.store.decide(d, signed);
    if (d.decision === "ACCEPT") {
      const rows = await independentVerify(await collect(this.github, p, r, s));
      await this.store.appendEvidence(rows);
      if (rows.some((x) => x.result !== "PASS"))
        throw new Gate("ACCEPTANCE_REVALIDATION_FAILED");
    }
    const accepted = await this.store.decide(d, signed);
    if (accepted.state === "ACCEPTED") await this.store.requeue(r.run_id);
    return accepted;
  }
  async guard(
    run_id: string,
    lease: string,
    action?: string,
    recipe_hash?: string,
  ) {
    const r = await this.store.run(run_id);
    this.store.assertLease(r, lease);
    const current = await this.current(r.project_id, r.wp_id, r);
    if (action) {
      const intent = {
        action,
        project_id: r.project_id,
        repo: r.repo,
        run_id: r.run_id,
        wp_id: r.wp_id,
        wp_version: r.wp_version,
        subject: r.origin_subject,
        branch: r.branch,
        baseline_sha: r.baseline_sha,
        commit_sha: r.commit_sha,
        recipe_hash: recipe_hash!,
        authority_ref: current.policy.authority_ref,
        mandate_ref: current.policy.mandate_ref,
      };
      const checked = await this.governance.evaluate(intent);
      await this.store.db.tx((s) =>
        this.store.event(s, {
          project_id: r.project_id,
          run_id: r.run_id,
          actor: "CDX_ENFORCEMENT_POINT",
          event_type: "CDX_EFFECT_ALLOWED",
          source_ref: checked.receipt.spetl_ref,
          policy_hash: r.policy_hash,
          correlation_id: r.correlation_id,
          detail: {
            intent_hash: hash(intent),
            receipt: checked.receipt,
            signed_provenance: checked.signed_provenance,
          },
        }),
      );
      const latest = await this.store.run(run_id);
      this.store.assertLease(latest, lease);
      if (latest.stop_requested) throw new Gate("CANCELLATION_REQUESTED");
      await this.current(latest.project_id, latest.wp_id, latest);
    }
    return current;
  }
  async tick(): Promise<boolean> {
    await this.progress();
    const claimed = await this.store.claim();
    if (!claimed) return false;
    const { lease } = claimed;
    let r = claimed.run;
    let delay = 0,
      dead = false,
      clearFailures = true;
    try {
      if (r.stop_requested) return true;
      if (r.state === "ACCEPTED") {
        await this.store.transition(
          r.run_id,
          "RECORDED",
          "ORCHESTRATOR",
          {},
          lease,
        );
        return true;
      }
      if (r.state === "READY_FOR_DIRECTOR") {
        const signed = await this.director.pollDecision(r.run_id);
        if (signed) await this.acceptDecision(signed);
        else {
          await this.guard(r.run_id, lease);
          delay = 15000;
        }
        return true;
      }
      const { project, policy, wp } = await this.guard(r.run_id, lease);
      const move = (
        state: Run["state"],
        detail: Record<string, unknown> = {},
      ) =>
        this.store.transition(r.run_id, state, "ORCHESTRATOR", detail, lease);
      if (r.state === "ELIGIBLE") {
        await move("LEASED");
        await move("INSPECTING");
      } else if (r.state === "RECOVERY_CHECK") {
        if (
          r.commit_sha !== r.baseline_sha &&
          (await this.github.head(project, r.branch)) !== r.commit_sha
        ) {
          // An interrupted, unconfirmed mutation may be recoverable only through the exact recipe adapter.
          if (!["EXECUTING", "REPAIRING"].includes(r.recovery_state ?? ""))
            throw new Gate("RECOVERY_BRANCH_MISMATCH", "HOLD_HUMAN");
        }
        const target = ["EXECUTING", "REPAIRING"].includes(
          r.recovery_state ?? "",
        )
          ? r.recovery_state!
          : r.commit_sha !== r.baseline_sha
            ? "VERIFYING"
            : "INSPECTING";
        await move(target, { revalidated_authority: true });
      } else if (r.state === "INSPECTING") {
        const report = await inspect(this.github, project, r, policy);
        await this.store.appendEvidence(report.evidence);
        if (report.evidence.some((x) => x.result === "INCONCLUSIVE"))
          throw new Gate("JANITOR_INCONCLUSIVE");
        await move(
          report.already_fulfilled || wp.requested_action === "read"
            ? "VERIFYING"
            : "EXECUTING",
        );
      } else if (r.state === "EXECUTING" || r.state === "REPAIRING") {
        const repair = r.state === "REPAIRING";
        const recipeId = repair
          ? wp.repair_recipe_ids[r.current_attempt - 1]
          : wp.mutation_recipe_id;
        const recipe = policy.recipes.find((x) => x.recipe_id === recipeId);
        if (!recipe) throw new Gate("REGISTERED_REPAIR_MISSING", "HOLD_HUMAN");
        authorizeRecipe(project, policy, wp, recipe, repair);
        await executeRecipe(
          this.store,
          this.github,
          project,
          r,
          lease,
          recipe,
          async (action) => {
            await this.guard(r.run_id, lease, action, hash(recipe));
          },
        );
        await move("VERIFYING");
      } else if (r.state === "VERIFYING") {
        const rows = await independentVerify(
          await collect(this.github, project, r, policy),
        );
        await this.store.appendEvidence(rows);
        await this.guard(r.run_id, lease);
        if (rows.every((x) => x.result === "PASS")) {
          await this.store.mutateRun(r.run_id, lease, {
            evidence_bundle_hash: evidenceBundle(rows),
          });
          await move("READY_FOR_DIRECTOR");
        } else if (rows.some((x) => x.result === "INCONCLUSIVE")) {
          // CI may still be pending. Poll for a bounded time, then preserve an honest BLOCKED state.
          if (
            Date.now() - Date.parse(r.created_at) >
            Math.min(wp.time_budget_seconds, 300) * 1000
          )
            throw new Gate("CI_OR_REPOSITORY_INCONCLUSIVE");
          delay = 1000;
        } else {
          const limit = Math.min(
            project.max_repair_attempts,
            policy.max_repair_attempts,
            wp.max_repair_attempts,
            wp.repair_recipe_ids.length,
          );
          if (r.current_attempt >= limit)
            throw new Gate("REPAIR_RETRY_EXHAUSTED");
          const recipe = policy.recipes.find(
            (x) => x.recipe_id === wp.repair_recipe_ids[r.current_attempt],
          );
          if (!recipe)
            throw new Gate("REGISTERED_REPAIR_MISSING", "HOLD_HUMAN");
          authorizeRecipe(project, policy, wp, recipe, true);
          await this.store.mutateRun(r.run_id, lease, {
            current_attempt: r.current_attempt + 1,
          });
          await move("REPAIRING");
        }
      }
    } catch (error) {
      const current = await this.store.run(r.run_id);
      if (current.stop_requested) return true;
      const gate =
        error instanceof Gate ? error : new Gate("INTERNAL_EXECUTION_ERROR");
      const transient =
        /^(?:GITHUB_DISCONNECTED|DIRECTOR_DISCONNECTED|JANITOR_INCONCLUSIVE|GITHUB_HTTP_(?:429|5\d\d)|DIRECTOR_HTTP_5\d\d)$/.test(
          gate.code,
        );
      if (transient) {
        const failures = await this.store.retryFailure(r.run_id, gate.code);
        clearFailures = false;
        if (failures < 3) {
          delay = 1000 * 2 ** failures;
          return true;
        }
        dead = true;
      }
      if (
        !terminal.has(current.state) &&
        current.state !== "ACCEPTED" &&
        gate.code !== "LEASE_LOST"
      )
        await this.store.transition(
          r.run_id,
          gate.state,
          "ORCHESTRATOR",
          { error: gate.code },
          lease,
        );
    } finally {
      const current = await this.store.run(r.run_id);
      if (
        current.lease_owner === lease &&
        current.lease_expires_at! > Date.now()
      )
        await this.store.release(r.run_id, lease, delay, dead, clearFailures);
    }
    return true;
  }
  async progress() {
    const outbox = await this.store.db.tx((s) =>
      s.query(
        "SELECT * FROM hf_progression_outbox WHERE state='WAITING' AND available_at<=?",
        [Date.now()],
      ),
    );
    for (const item of outbox) {
      try {
        const origin = await this.store.db.tx(
          async (s) =>
            (
              await s.query(
                "SELECT run_id FROM hf_decisions WHERE decision_id=?",
                [item.decision_id],
              )
            )[0],
        );
        if (
          !origin ||
          (await this.store.run(String(origin.run_id))).state !== "RECORDED"
        )
          continue;
        const project_id = String(item.project_id),
          project = await this.store.project(project_id),
          policy = await this.director.authorization(project_id);
        if (policy.revoked || Date.parse(policy.expires_at) <= Date.now())
          throw new Gate("PROGRESSION_AUTHORITY_UNAVAILABLE");
        if (policy.auto_dispatch) {
          const existing = await this.store.runs(project_id);
          for (const wp_id of policy.eligible_ids) {
            const wp = policy.work_packages.find((w) => w.wp_id === wp_id)!;
            if (
              existing.some(
                (r) => r.wp_id === wp_id && r.wp_version === wp.version,
              )
            )
              continue;
            authorize(project, policy, wp);
            const subject = policy.auto_dispatch_subject;
            if (!subject || !policy.allowed_subjects.includes(subject))
              throw new Gate(
                "DIRECTOR_AUTOMATION_IDENTITY_NOT_DELEGATED",
                "HOLD_HUMAN",
              );
            await this.enqueue(
              {
                subject,
                projects: [project_id],
                scopes: ["household:execute"],
              },
              project_id,
              wp_id,
              policy.policy_ref,
              `auto:${String(item.decision_id)}:${wp_id}:${wp.version}`,
            );
            break;
          }
        }
        await this.store.db.tx(async (s) => {
          await s.query(
            "UPDATE hf_progression_outbox SET state='DONE',last_error=NULL WHERE decision_id=?",
            [item.decision_id],
          );
          await this.store.event(s, {
            project_id,
            actor: "ORCHESTRATOR",
            event_type: "DIRECTOR_PROGRESSION_RECONCILED",
            source_ref: policy.authority_ref,
            detail: {
              decision_id: item.decision_id,
              auto_dispatch: policy.auto_dispatch,
            },
          });
        });
      } catch (error) {
        await this.store.db.tx((s) =>
          s.query(
            "UPDATE hf_progression_outbox SET state=?,attempts=attempts+1,available_at=?,last_error=? WHERE decision_id=?",
            [
              Number(item.attempts) >= 7 ? "DEAD" : "WAITING",
              Date.now() +
                Math.min(
                  300000,
                  1000 * 2 ** Math.min(Number(item.attempts), 8),
                ),
              error instanceof Gate ? error.code : "PROGRESSION_ERROR",
              item.decision_id,
            ],
          ),
        );
      }
    }
  }
}
