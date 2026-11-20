# FFOS Estate Meta-Health — Conceptual and Procedural Protocol v1.0

**ID:** FFOS-EMH-001@1.0 · **Class:** estate-level health sensing, diagnosis and learning method · **Owner:** Human Director / FFOS coordinating role · **Authority:** Director establishment directive 2026-11-20; source control and implementation status separate · **State:** draft implementation on review branch; not a new constitutional policy or autonomous runtime.

## I. Purpose, questions and anti-goals

**Mission:** maintain an intelligible, resilient and governable Form & Flöde estate as its independent component systems evolve. The routine does not seek maximum standardisation. It aims to make interconnections usable and accountable while preserving warranted domain independence.

Core questions:
1. **What actually exists?** Which repositories/products/assets and their current source, owners, privacy and availability?
2. **What is supposed to exist?** Which accepted contracts, releases, mandates and desired functions define the baseline?
3. **What flows?** Can users/operators find, access, use, verify, maintain and safely recover the necessary paths?
4. **What fails or drifts?** Where do current source, architecture, authority, operational claims, data or documentation diverge?
5. **What merits intervention?** What evidence-backed correction yields the largest coherence/utility benefit for least new overhead?
6. **What changed after intervention?** Did the corrective action measurably improve the implicated user/system pathway?

Anti-goals: no fake universal maturity score; no single mandatory CI or all-repo Wiki/Project policy; no source takeover; no agent sprawl; no passive heartbeat treated as release evidence; no automatic consequence from a concern alone.

## II. Mandate and authority

- **Director:** determines priorities and independently accepts/declines consequential work and changes to this method.
- **FFOS Meta-Health coordinator:** gathers permitted observations, checks sources, documents diagnoses and routes review candidates; cannot grant domain approvals or issue effects.
- **CDX:** retains applicable effect/authority policy; this routine does not reinterpret CDX.
- **FFC Corpus:** retains its governed methods, identifiers and content/version authority.
- **Source owners:** own corrections, repository settings, approvals, privacy, rights, branches and releases.
- **Pius/AMA/HCC:** retain domain-specific governance and registered runtime boundaries.
- **Projects and dashboards:** show operational projections, not independent approval or truth.

The human directive authorises establishment of a **read-first procedural practice**. Live implementation, delegated execution and additional automation each require separate source/authority evaluation.

## III. Nine dimensions of estate health

| Code | Dimension | Diagnostic evidence | Failure signals |
|---|---|---|---|
| H1 | Coverage & ownership | accessible repo list, owner, visibility, source head, purpose, maintenance responsibility | orphan repo, ambiguous canon, inaccessible scope disguised as complete |
| H2 | Authority & decision coherence | governing policies, accepted versions, approvals, source ownership, exceptions | unapproved proposal represented as law, GitHub status equals Director decision |
| H3 | Documentation & discoverability | root entry, user/operator paths, Wiki/source relation, link status, reader task tests | absent start point, broken paths, source Wiki mistaken for published Wiki |
| H4 | Implementation & release truth | code, test receipts, deployment endpoint, authenticated readback, runtime identity | merged code presented as deployed service, untested integration called live |
| H5 | Security, privacy & rights | exposed secrets, access/RLS, data classification, image/licence clearance | hard-coded token, public personal content, unlicensed image publication |
| H6 | Interoperability & dependencies | explicit versions/interfaces, canonical producers/consumers, cross-owner contracts | ID conflation, speculative sync, integration assumptions, broken handoff |
| H7 | Operability & recovery | backup/restore, reproducible jobs, environment/role, runbooks, incident handling | unrestoreable state, unreproducible process, single-device hidden dependency |
| H8 | Human usability & value | real task paths, operator accessibility, comprehensibility, task success evidence | user cannot locate right system, repeated workarounds, dashboard without action |
| H9 | Workload, learning & change flow | active WPs, blockers, review latency, evidence closure, iteration learning | duplicated issue ecosystems, indefinite HOLD without owner, review bloat |

Dimensions are lenses, **not independently meaningful numerical scorecards**. Any severity must be tied to a specific observed effect, likelihood/uncertainty, exposed scope and decision owner.

## IV. Evidence quality, claims and confidence

Use these classifications per finding:

- **OBSERVED:** independently read directly from an accessible, identified source at a dated revision or verified provider response.
- **SOURCE-REPORTED:** repository/issue claims an external fact or successful run, but auditor has not checked provider/runtime independently.
- **DERIVED:** reasoned inference from identified observations with assumptions declared.
- **PROPOSED:** candidate improvement or intended state, not implemented.
- **UNKNOWN / NOT TESTED / ACCESS_HOLD:** information absent, independent test not performed or inaccessible. Do not coerce unknown into FAIL/PASS.

Separate **state of artifact** (`draft / merged / tested / deployed / accepted`) from **state of evidence**. A live restricted read PASS is not a write acceptance, a Wiki source folder is not a published native Wiki, and a GitHub Project is not FFOS ProjectHub.

Each finding needs: finding ID, H-dimension, affected owners and source links, observed time and exact ref, evidence state, expected/actual gap, affected user or operational pathway, severity, proposed action, actual decision owner and verification method. Redact private evidence before cross-publication.

## V. Health signals and priority rules

Use a **decision-oriented classification**, not fabricated percentages:

- **CRITICAL — CONTAIN/ESCALATE:** confirmed or credible active credential exposure, unsafe production data access, rights/privacy exposure, unauthorized effect path, or loss of authoritative control. Stop only the unsafe action; route incident to actual policy/security owner; do not self-mutate credentials.
- **HIGH — SOURCE OWNER ACTION:** an evidenced break in critical entry, live release representation, cross-system authority, core integrity or recovery path; or consequential production risk. Open/reuse focused source-owned issue and specify required gate.
- **MODERATE — PLANNED CORRECTION:** degraded navigation, documentation freshness, redundant source projection, bounded missing test or growing maintenance burden with measurable user cost.
- **LOW — WATCH/LEARN:** small, bounded discrepancies without material consequence; monitor or bundle into an appropriate future source change.
- **UNKNOWN — VERIFY FIRST:** conflicting snapshots, missing access or unproven source claims; no negative health label without evidence.

Severity is **per finding**, not a universal repo grade. A private sensitive repo with missing public Wiki is not unhealthy merely because it lacks a Wiki.

## VI. Routine modes, cadences and triggers

| Mode | When | Practical depth | Typical outcome |
|---|---|---|---|
| SNAPSHOT | New repo, merge, release claim, newly changed policy/role, product boundary | one or several affected systems; exact changed refs | concise delta, no full re-audit |
| LIGHT | Recommended ~monthly when Director/owner initiates | current inventory delta, high-risk holds, stale documentation, WPs, evidence state | short health ledger and escalation |
| FULL | Recommended ~every 90 days or major architecture turn | all currently accessible repositories, dimensions H1–H9 and representative reader/operator tasks | estatewide baseline + prioritised change programme |
| INCIDENT | credible material security, authority, privacy or release breach | immediate bounded affected path, incident precedence | containment recommendation and source owner escalation |

No hosted timer, background watcher, cron, agent or automatic delivery is established by these intervals. They are **manual review triggers**; if scheduled monitoring is later desired it needs explicit independent automation setup and authority.

Additional event triggers: new/deleted/reowned repository; change in canonical source; GitHub permission/Wiki/Projects changes; release of a major component; CDX/AMA/Pius interface changes; cloud migration/dependency contract; failed operator task; long-running unverified HOLD; substantial asset/legal licence change.

## VII. Standard nine-step run

1. **INTAKE / AUTHORITY:** name initiator, mode, intent, decision boundaries and target systems; check required repository/access scope. If unsafe access or missing mandate, stop affected action and record `ACCESS_HOLD`.
2. **BASELINE:** list currently visible repo IDs/owners/branches, snapshot dates, prior run refs, known exclusions and relevant canonical source/authority versions. Mark inherited historic claims explicitly.
3. **DELTA DETECTION:** compare source refs and issues to prior baseline. Classify structural drift versus routine hook/dashboard timestamps; do not equate new commit SHA with new capability.
4. **EVIDENCE INSPECTION:** inspect affected root entry, source contract, release/test receipt, Wiki remote evidence, source-owned decision and operational path. Apply HARP-like source traceability without claiming a Pius runtime was invoked.
5. **SYSTEMIC DIAGNOSIS:** distinguish local defect from estate propagation; identify interaction/friction between forms and flows, source/projection misalignment, governance conflicts and failure mode.
6. **DECISION SUPPORT:** severity with rationale, confidence and most effective limited remedy. Check for duplicate existing issues and avoid new work package proliferation.
7. **ROUTING / AUTHORIZATION:** attach link to canonical owner; route change via existing Issue/PR/WP where possible. Human Director/actual owner decides. Health report never self-approves or releases.
8. **OUTCOME VERIFICATION:** test exact corrected path, independent source/reader access where needed, negative case and actual status. Distinguish merged, deployed and accepted.
9. **LEARNING / CLOSE:** record elapsed state, unresolved blockers, unnecessary process overhead, effect on users, and whether routine itself merits change.

**Run completion:** a valid run can end with `PASS_WITH_LIMITATIONS`, `ACTION_REQUIRED`, `HOLD`, or `INCOMPLETE_ACCESS`; these are **health-review report labels**, never policy authorization or project release states.

## VIII. Output grammar and continuity

Minimum deliverables for LIGHT/SNAPSHOT:
- date, trigger, mode, scope/accessible inventory, prior baseline, checked paths/refs, deltas;
- findings with H-dimension, evidence status, risk/impact and affected authority;
- known unknowns; source-owned action links; what changed and what was not tested;
- end disposition and next conditional review trigger.

FULL additionally:
- validated dated estate inventory and source ownership; critical cross-system map;
- per-dimension representative health evidence;
- actual reader/operator task tests (source, role, pass/partial/blocked);
- prioritised work register with root cause, affected flows, owner and proof-of-correction;
- continuity with prior baselines and accepted history without rewriting them.

Store run records under `docs/governance/estate-meta-health/runs/YYYY-MM-DD-<scope>/` **only on real invocation**. Do not create empty recurring run files. Use [run template](RUN-TEMPLATE-v1.0.md).

## IX. Integration and non-interference

- Existing WO-002 owns its original three-WP GitHub documentation/Projects/Wiki deliverables. Estate Meta-Health may identify later deltas and propose amendments, **not retroactively accept DG-01/DG-02 or start WP03**.
- The FFOS DevOps Operating Model 1.1 remains optional for newly initiated substantial implementation. **Meta-Health is a diagnostic routine**, not another DevOps stage or compulsory source hook; remediation may choose DevOps only under existing criteria.
- A report may suggest Wiki, Project, registry, or public guide changes only based on user needs and rights. It cannot perform those effects without their own approvals.
- Old snapshots and audit reports are historical evidence; their dated counts are never rewritten to fit current inventory.
- New recurring automation, if separately requested, must preserve read-only default, source owner approvals, private visibility and bounded rate/scope.

## X. Quality and anti-bloat checks

Before concluding, ask:
1. Is each consequential claim anchored to inspectable source and as-of timestamp?
2. Is `SOURCE-REPORTED` distinguished from live-verified?
3. Are access gaps/hidden repos accounted for?
4. Are the right human and repository owners named, or `UNASSIGNED`?
5. Does the recommendation improve a real journey, decision or recovery path?
6. Has an existing issue/workorder already solved the same problem?
7. Did this review accidentally establish a new authority, project or mandatory gate?
8. Can a different operator repeat a representative check?
9. Are unknowns, secrets, rights and pending approvals protected?

**Protocol revision:** new method revision after documented evidence or Director direction, source-owner review and explicit change record. Never silently mutate this document to reinterpret older runs.
