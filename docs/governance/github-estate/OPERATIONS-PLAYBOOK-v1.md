# WP04 D31 — Estate Operations and Maintenance Playbook v1.0

**Status:** OPERATIONAL PROCEDURE CANDIDATE — DG-04 review; repository owner adoption pending. **Date:** 2026-11-03.  
**Primary surface:** [Private Motherpher Estate Portfolio](https://github.com/orgs/Motherpher/projects/2).  
**Technical source:** [FFOS](https://github.com/Motherpher/FFOS). **Governance:** FF-GH-WO-001, CDX, FFC, AMA/Pius local contracts as applicable.

## 1. Operator responsibilities

**Director:** accepts mandates, cross-system consequences, release and constitutional decisions.  
**Repository owner:** owns original Issue/PR, canonical code/data, local permissions and release.  
**Estate coordinator:** maintains Project links and non-authoritative projections.  
**Verifier:** compares exact source revisions, tests, effect evidence and Project state.  
**CDX/local gate:** when consequential actions are proposed, evaluate genuine policy and delegated rights at the execution point; Project status is not permission.

Roles describe responsibilities, not automatically new agent identities or permanent access grants.

## 2. Daily/weekly operating procedure (recommended cadence, not a scheduled automation)

1. Open [Estate Portfolio](https://github.com/orgs/Motherpher/projects/2) with an authorised account.
2. Review **Director Decisions**, **Risks & Blockers**, **Verification Queue**, and programme-filtered views.
3. Read the original source Issue, associated PR and test outcomes before changing any Project metadata.
4. Check the current Source Issue state and a relevant commit or spec version.
5. Keep `Work Stage` and `Authority Gate` clearly distinct; only set `Approved (Source Recorded)` when the source decision is verified.
6. For newly detected issues, select by relevance, maturity and privacy before Project linking; native auto-add is NOT fully validated.
7. Note outstanding exceptions and owner, proposed next action and deadline only when authorised.
8. Do not infer a runtime, deployment, production or research claim from a planning item.

Suggested cadence: light triage weekly, owner/permissions review monthly, release/evidence review at each source change. No automatic recurrence is active under this document.

## 3. New repository onboarding

1. Enumerate repository through GitHub authenticated listing; confirm installation coverage and user permission.
2. Record name/owner/visibility/archived/default branch, source role, dependencies and current READMEs.
3. Check canonical and constitutional boundaries, product maturity, private/client/participant data.
4. Assign preliminary Tier A/B/C/D in [adoption register](ADOPTION-REGISTER-v1.md).
5. Choose minimum appropriate use of Issues, Projects, docs, templates and automation; a native Wiki is optional, never required by default.
6. Seek local maintainer and Director approval for actual repository settings or template modifications.
7. If useful, link **existing** source Issues to private Project with stable native IDs.
8. Review permissions, Auto-close OFF, nonduplication and source links; register evidence and a maintainer.
9. Confirm dashboard metrics denominator/capture date; update snapshot.
10. Treat configuration as staged until approved PR is merged and read-back verified.

## 4. Historic/archived repository handling

A historic repository stays a historic source even if its Issues are technically open or GitHub project features enabled. Do not auto-add all historical Issues. A repository transfer or visibility change triggers privacy and provenance revalidation; maintain old URL/link redirects and stable IDs if supported.

## 5. Source-work intake and issue lifecycle

**Eligible:** current actionable Issue with accountable source, bounded outcome and meaningful portfolio visibility.  
**Excluded:** duplicate Issue, accidental test Issue, stale job listings, private user records, unrelated client content, finished historical source, non-authoritative generated note.

Before intake, verify the exact source URL and existing Project membership. Avoid Project drafts where a native Issue already exists. No new stable WP ID may be fabricated.

Fields:
- Programme/Work Type: reflect source evidence.
- Priority: only a source-labelled or Director-ranked value; otherwise blank.
- Work Stage: operational projection, not the native Issue state.
- Canonical ID: preserve exact source.
- Dependency: link upstream Issue, PR or manifest; do not auto-close dependency.
- Evidence: source decision/release/test reference; URL alone is not full acceptance validation.

## 6. Acceptance and release operation

1. Identify the owning source decision gate.
2. Gather exact implementation revision, tests and independent verification.
3. Verify competent mandate, effect boundary, applicable CDX/local policy.
4. If a prerequisite or external check is incomplete, HOLD or record a Director-approved *bounded* exception; do not invent PASS.
5. Obtain actual Director/source approval.
6. Write decision to source Issue/ledger, with timestamp and scope.
7. Read back the source record.
8. Update Project `Authority Gate` and `Work Stage` as projection.
9. Read back Project fields and ensure source Issue closure was not inadvertently triggered.
10. Keep follow-up limitations visible even if a bounded pilot is accepted.

Precedents: [DG-02](https://github.com/Motherpher/FFOS/issues/43) and [DG-03](https://github.com/Motherpher/FFOS/issues/45). Neither acceptance authorises another system's runtime.

## 7. Synchronisation and status reconciliation

For current safe mode, use [read-only snapshot reconciler](PROJECT-SYNCHRONISATION-CONTRACT-v1.md) and a dated authenticated Project export.

```sh
python3 -m unittest discover -s tests -p 'test_estate_reconcile.py' -v
python3 tools/estate/reconcile.py \
  --adoption docs/governance/github-estate/data/estate-adoption-register-v1.json \
  --project docs/governance/github-estate/data/portfolio-snapshot-2026-11-03.json \
  --output /tmp/estate-reconcile.json
```

The program reads **local snapshots**, does not query GitHub and must not be described as a live sync. The Actions `workflow_dispatch` is a read-only validation trigger, not a fleet agent or an authority gateway. A fresh snapshot requires independently authorised GitHub Project access.

## 8. Security incident response

**If an unexpected public exposure or credential breach is detected:**
- Stop affected automation/Project publishing action immediately.
- Record event evidence without reproducing the sensitive content in a public Issue.
- Consult affected repository owners and CDX/local governance; revoke compromised permissions through authorised admin.
- Reconcile what data was exposed and what downstream syncs occurred.
- Preserve immutable audit references and a notification/decision trail.
- Resume only after privacy/security and owner approval. Do not silently delete evidence.

**If Auto-close issue is unexpectedly ON:** stop Project Status transitions, verify no source Issues were auto-closed, disable only via authorised Project admin, restore source Issue state if approved, re-read source/projection and log incident.

**If a CDX policy service is unavailable at a consequential effect point:** HOLD/fail closed; do not invoke ungoverned fallback.

## 9. Data/staleness and integration failure

- For rate limiting, authentication, API errors or stale snapshots, mark data NOT CURRENT, escalate and retry only when safe.
- For new auto-add failures, inspect the owning Issue; manual linking is allowed only after source validation.
- For conflicting Project/source statuses, preserve canonical source truth, record discrepancy and reconcile projection after review.
- For failed Vercel/other deployment checks, never mark system release operational; only a relevant, explicit human-authorised exception for an unrelated doc change can be recorded without lying about deployment.

## 10. Backup, recovery and rollback

**Available now:** source repositories, issue URLs, point-in-time authenticated Project JSON snapshot, adoption register and revisioned Git documentation. A Project-only draft add/remove rollback was tested under WP02.

**Not yet validated:** full Project backup/restore, complete role ACL test, all view configurations exported/reconstructed and live event replays. Therefore disaster recovery remains a DG-04 verification HOLD.

Recovery sequence (proposed):
1. Stop unsafe Project automation and preserve source records.
2. Take a fresh read-only metadata/export snapshot if possible.
3. Identify affected native IDs, Project items, field definitions, views and approvals.
4. Reconstruct Project **from source** only under explicit scoped authorisation.
5. Verify no duplicate native Issue and no fabricated acceptance.
6. Independently review permissions, source links, status and source/decision provenance.
7. Record incident and Director resumption decision.

Do not delete GitHub Project, source Issues or historical evidence to prove reversibility.

## 11. Ownership, audit and change control

Each maintainer's actual identity, authority and required cadence is **UNASSIGNED** until confirmed. A Project coordinator cannot impose a private Wiki, turn on unsafe Actions or alter branch rules based on Tier alone. Changes to this playbook require a reviewed PR and source reconciliation. An approved FFC governance effect may separately require its own governed Corpus versioning; the Project register alone does not.

**Current hard boundary:** DG-04 not accepted; production cross-owner sync, automatic Project writes, service principal access, CI/deployment claims and privileged operation are not authorised by this playbook.
