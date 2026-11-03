# FF-GH-WP04-D27 — Project Synchronisation Contract v1.0

**Status:** REVIEW CANDIDATE; read-only offline reconciliation implemented, live cross-owner sync and consequential writes **NOT IMPLEMENTED / NOT AUTHORISED**. **Date:** 2026-11-03.
**Owner:** FFOS estate coordination. **Project:** [Motherpher Estate Portfolio #2](https://github.com/orgs/Motherpher/projects/2). **Source:** [WP04 Issue #46](https://github.com/Motherpher/FFOS/issues/46).

## 1. Boundary and purpose

Provide reliable, traceable **projections** of repository Issue/PR/WP state into a private GitHub Projects V2 board, without granting source authority or disguising project status as verified outcome.

**Source-precedence:** native repository object and canonical decision/evidence record → permitted Project projection. Never reverse this merely because a Project field has changed. Do not use GitHub's built-in Status=Done as a Director decision, and keep **Auto-close issue OFF**.

## 2. Four bounded operational levels

| Level | Capability | State at WP04 implementation |
|---|---|---|
| L0 | Offline source-preserving snapshot validation and issue-diff detection | **IMPLEMENTED CANDIDATE:** `tools/estate/reconcile.py` + tests + dated JSON; CI results still to be checked |
| L1 | Authenticated live GraphQL READ from both owners with bound installation/least-privilege scope | **MANUAL CONNECTOR READ TESTED**, no independently deployed recurring runtime |
| L2 | Cross-owner Project metadata writes after source verification, scope/policy gate and idempotency | **MANUAL AUTHORISED PORTFOLIO INTAKE PERFORMED**, autonomous worker **NOT IMPLEMENTED / NOT AUTHORISED** |
| L3 | Consequential effects (source issue closure, branch permissions, releases, production changes) | **PROHIBITED by this contract**; require independent CDX/local and Director approvals |

The first production synchroniser must be staged as a separate reviewed change, with credentials/permissions, a test environment, alerting and rollback. The current file does **not** turn a documented workflow into a running service.

## 3. Source record identity and event contract

Each input event should carry:

```json
{
  "schema": "ff-gh-estate-event/v1",
  "event_id": "GitHub delivery ID or stable synthetic snapshot ID",
  "event_type": "ISSUE_CHANGED",
  "source_owner": "owner",
  "source_repository": "owner/repo",
  "source_repository_id": "stable GitHub numeric ID",
  "source_node_id": "native GitHub Issue/PR node ID",
  "source_url": "https://github.com/owner/repo/issues/N",
  "source_revision": "source updated_at or commit SHA",
  "observed_at": "ISO-8601 UTC",
  "principal": "verified authenticated acting identity",
  "policy_context": "CDX/local policy revision where applicable",
  "mandate_ref": "Director/source mandate reference or null",
  "intended_projection": {
    "programme": "Products & Platforms",
    "work_stage": "Intake",
    "evidence_url": null
  }
}
```

The event carries desired *projection*, not a licence to perform a write. Missing identity, authority or source revision remains `HOLD`. Never rely on mutable titles as stable keys.

## 4. Source-to-Project mapping

- Resolve GitHub `repositoryId`, `Issue.node_id` / `PullRequest.node_id` and existing Project item ID before any add/update.
- If the item already exists, **update permitted fields only**; do not create a duplicate.
- If a source Issue is closed, native Project automation may update Status; do **not** infer acceptance or promote `Work Stage` to Accepted without a separately verified decision.
- If a source Issue's status differs from Project planning state, emit divergence for review; do not silently change source.
- Source-owned stable work-package ID is copied exactly. Where unknown, keep native URL as the authoritative identity and label the identifier `UNSPECIFIED`.
- Source owner/repo visibility is preserved; Project remains **private**. Never widen Project visibility to accommodate public read.
- `Authority Gate = Approved (Source Recorded)` requires an actual independently readable approval source URL and competent authority.

## 5. Idempotency and concurrent-write protection

Define an idempotency key from `project_id + source_node_id + event_id/type + source_revision`. For every event:

1. Verify signature or trusted authenticated source; reject unauthenticated content.
2. Resolve the source node and its latest version.
3. Read Project item and last applied version/delivery.
4. Reject stale, contradictory or revoked approval data.
5. If the same revision/key is already projected, return a **NO_OP**, not a duplicate Item.
6. If a mutation is authorised, compare the current item version immediately before write and record the exact change/revision.
7. Log outcome and receipt; on ambiguous timeout, re-read before retry.
8. No automated "last-writer-wins" on authority fields.

`tools/estate/reconcile.py` currently supplies **offline** duplicate detection, acceptance/evidence consistency checks, and previous/current snapshot changes. It does **not** implement a live event queue, token-authenticated writer or guaranteed distributed idempotency. Those remain external verification gates.

## 6. Failure, access and rate limits

| Failure | Required behaviour |
|---|---|
| Project/item inaccessible | HOLD: emit ACCESS_DENIED, no source mutation |
| Private source unexpectedly public | SECURITY_HOLD; investigate access boundary |
| New Issue not automatically added | Log INTAKE_GAP; explicitly link only after source review |
| API/GraphQL rate limit | Retry only with bounded backoff / no duplicate writes |
| Policy decision unavailable | HOLD before any consequence, never infer ALLOW |
| Missing canonical reference | WARN; native URL remains identity |
| Conflicting approval or revocation | HOLD; escalate to Director and owning governance source |
| Project data stale | Re-read from original sources; never assert current |
| Partial write/timeout | Read-back and reconcile source and item; no blind repeated mutation |
| GitHub workflow changes | Revalidate Auto-close OFF; block if unexpectedly enabled |
| Missing required runtime deployment check | NOT VERIFIED; do not promote release status |

## 7. Credentials and security

- Existing ChatGPT/GitHub connectors may have cross-owner **read** ability. Do not assume those permissions transfer to hosted Actions or a future FFOS runtime.
- Default `GITHUB_TOKEN` is repository-scoped and cannot be assumed to read an organisation Project plus private personal account repositories.
- A future recurring live read will need an explicitly provisioned short-lived GitHub App or separately approved `read:project`/repository read scope, with rotation, logging and access review.
- No PAT, app private key, client secret or user credential shall appear in a Project field, Issue, repository file or Actions log.
- No automatic project write, publication, issue closure or runtime effect shall be added under this WP04 implementation without a separate local policy and Director gate.

## 8. Snapshot process currently implemented

`python3 tools/estate/reconcile.py --adoption docs/governance/github-estate/data/estate-adoption-register-v1.json --project docs/governance/github-estate/data/portfolio-snapshot-2026-11-03.json --output /tmp/estate-report.json`

This is read-only **with respect to GitHub**. It writes only the user-specified local report. It flags duplicates, unknown repo, Project visibility, Auto-close workflow and unsupported acceptance projection. It does not query GitHub.

A GitHub Actions workflow `.github/workflows/estate-snapshot-audit.yml` runs tests/this offline verification with `contents: read` and has no access to production credentials, local repo writes or Project mutations. A passing run establishes only the integrity of the **dated fixture**, not real-time estate state.

## 9. Acceptance conditions for future L1/L2 runtime

Before a recurring synchronisation can be marked live: exact app scope, live Projects V2 GraphQL permissions, read/write principal identity, source/version reconciliation, native GitHub auto-add behaviour tested, idempotency with repeated deliveries, concurrent conflict tests, fail-closed policy unavailability, rate-limit/backoff, audit receipts, explicit human-granted action scope, recovery test and independent verification.

**Current verdict:** L0 source code staged; L1 manual reading proven; L2 manual Project intake proven; **durable production binding NOT VERIFIED**. No L3 action.
