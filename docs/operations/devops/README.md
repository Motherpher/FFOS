# FFOS DevOps Operating Model 1.1 — optional discovery and Director activation

**ID:** FFOS-DEVOPS-OM-001@1.1  
**Decision:** Original forward-only adoption 2026-11-16; **1.1 amendment**: the model is always discoverable and **OPTIONAL** for newly initiated substantial DevOps processes, activated only by Director choice.  
**Purpose:** Improve development coherence, throughput, reproducibility and learning **without turning ordinary work into a nine-gate assurance programme**.  
**Effective:** The 1.1 optional-discovery rule applies prospectively after the Director's 2026-11-16 amendment instruction. The 1.0 rule and work history remain recorded; already-open or completed processes are NOT reclassified.  
**Class:** Operating method / process guidance. NOT a constitutional policy, automatic release authorization, CI status, or certification.

## 1.1 — optional repository discovery

**A hook is a reminder, not a mandate.** The local `.ffos/devops-hook.json` provides one reference to the model. For a small change, or if the Director declines, work continues normally with no additional DevOps administration. For a newly contemplated substantial development effort, the Director may **ACTIVATE / DECLINE / DEFER**; only activation starts the six phases. No hidden CI, mandatory review or automatic work package is introduced. Existing authoritative CDX/AMA/Pius/HCC controls still apply independently.

**Versioned sources:** [Optional-discovery amendment 1.1](AMENDMENT-v1.1-OPTIONAL-DISCOVERY.md) · [Hook contract](HOOK-CONTRACT-v1.1.md) · [Conditional CDX review discovery](CDX-REVIEW-INTERFACE-v1.1.md).

## Keeping the model and 30 repository hooks in sync

The [canonical model release pointer](model-release.json) declares the current version. A hook's link to this README opens current text, but its stored `model.version` is only the last installed snapshot. **It does not update automatically.**

A narrow [version-update pipeline](VERSION-UPDATE-PIPELINE-v1.md) checks model-version consistency when canonical FFOS model documents change and opens a **tracked downstream hook-update issue** after a new version merges. The [estate hook index](HOOK-ESTATE-INDEX.json) records 30 installed hooks, including the seven historical Tier D repositories; the constitutional CDX source remains excluded. Barnombudet is already among the Tier B installs and was not modified for the historical expansion.

This mechanism does not activate the optional DevOps model, require new paperwork for small changes, auto-merge downstream code, or bypass CDX review. Future hook versions propagate through verified normal repository PRs.

## 1. Scope: a new process, not old work

A **DevOps process** is a newly initiated, bounded development effort with an identifiable outcome, owner, source repository, implementation path, verification and closure. It may span several tasks, WPs or repositories. Use this model **once at process intake**, not as six separate approval tickets for every small commit.

| Situation | Application |
|---|---|
| New substantial DevOps process considered after the 1.1 amendment | **Offer** the model; activate L1/L2/L3 **only if Director selects USE** |
| New standalone development process within an existing programme | Offer the model **only for the new process**, never retrofit the parent; Director may decline |
| Existing work package, active development branch, historical process, completed work or accepted release | **Do not retrofit**. Keep its original definitions, stages, evidence and authority |
| Existing agent / runtime or CDX-bound operation | Existing applicable CDX, AMA, Pius/HCC and source-repository controls **continue unchanged**, regardless of process level |
| Small edits or Director declines DevOps | **Continue the normal repository workflow**; no framework task, record or extra approval created |

This is **prospective adoption**, not a migration. Old process artefacts remain auditable in their original form. No historical WPs are renamed, reopened, backfilled, scored or measured against this model.

## 2. Six-phase cycle — move work, do not create unnecessary gates

```text
PLAN → DESIGN → BUILD → TEST → RELEASE → LEARN
  ↑                                  │
  └────────────── next iteration ────┘
```

| Phase | Practical question | Minimum useful output |
|---|---|---|
| **01 Plan** | What outcome should change, why now and who owns it? | Short task/WP description: outcome, scope, owner, definition of done |
| **02 Design** | How will the change fit the current architecture, flow, users and dependencies? | Solution sketch, interfaces/dependencies, known risk/constraints; often just a paragraph for L1 |
| **03 Build** | What is the smallest coherent, versioned implementation? | Scoped code/docs/config change with clear source reference and reproducible edits where needed |
| **04 Test** | Does it work, and what would make it fail? | Proportionate checks plus known limitations; automated CI/negative scenarios for higher-risk work |
| **05 Release** | Is the verified outcome ready to integrate, publish, enable or hand over? | PR/commit/version and actual disposition; deployment only when separately authorized and actually verified |
| **06 Learn** | What happened in operation, what was improved and what remains? | Brief outcome/evidence/learning note; open follow-up only when justified |

**The phases are a practical loop, not formal G0–G8 gates.** A phase may be brief or combined in small work; do not manufacture review meetings, reports or artifacts just to satisfy the labels. A STOP/HOLD arising from an existing authoritative security/runtime control remains binding.

## 3. Three levels of proportionality

Choose the **lowest level that safely handles the work** at initiation. Reclassify prospectively if a real risk or scope change occurs. This is not a maturity or organizational performance score.

| Level | Use when | Minimum execution discipline | Human decision |
|---|---|---|---|
| **L1 Lightweight** | Documentation, minor fixes, exploration, low-consequence internal changes | Purpose + change + basic verification + outcome note; phases may share one Issue/PR | Normal owner judgment, subject to existing repository rules |
| **L2 Structured** | New functionality, interface, package or integration with meaningful dependencies | Clear WP, design/dependency note, versioned implementation, appropriate automated checks, practical release/learning record | Maintainer review when warranted by code/impact; any existing required approvals |
| **L3 Controlled** | Production effects, privileged access, regulated/sensitive data, live agent actions, CDX policy/effect boundaries, consequential migrations | Threat/rollback reasoning, exact-source verification, negative/failure-path tests, authorization and evidence required by the relevant domain | **Mandatory applicable CDX/AMA/Pius/Director decisions** and any source-repository controls; never replaced by this method |

**Escalation examples:** L1 research becomes L2 if it turns into a deployed integration; L2 becomes L3 if it affects permissions or consequential runtime effects. Record the reason; do not retrospectively relabel earlier completed work.

## 4. Standard operating rhythm

1. **Optional intake, after Director activation**: Name the process and owner, link the canonical source, select L1–L3, state outcome and “done”. For small or declined work, no DevOps intake is needed.
2. **Execution**: Follow the six phases at suitable depth; reuse existing WPs, test suites, CI and review workflows. Prefer one living work record over six duplicative documents.
3. **Decision**: At the relevant point, distinguish `proposed`, `implemented`, `tested`, `merged`, `released`, `deployed` and `accepted`. These are never interchangeable.
4. **Feedback**: Close with a short result, evidence link, an observed constraint and any next iteration; preserve failed attempts without overwriting history.
5. **Learning**: Inspect where work stops moving, where verification produces rework, and where external dependencies consume time. Improve the method only from observed patterns.

**Flow metrics, when useful:** elapsed intake-to-outcome time; blocked time; rework after testing; failed-change incidence; lead time from tested change to integration; time to restore consequential errors. No fixed numeric targets until a real baseline and comparable work types exist.

## 5. Authority boundaries — process is not policy

Source hierarchy and delegated authority remain unchanged:

- **Human Director** authorizes purpose, priorities, release and effect scope where governance requires it.
- **CDX** owns its constitutional authority, policy decisions, effect limits and evidence requirements. DevOps L1–L3 cannot issue CDX `ALLOW`.
- **AMA / Agent Stable** owns its applicable agent contracts and release states; `RUNTIME_BOUND` and `INDEPENDENTLY_ACCEPTED` remain distinct.
- **Pius/HCC** constraints continue to apply to Piusites and relevant domains without being redefined here.
- **Canonical domain repositories** retain their implementation, versioning, release and source ownership. FFOS coordinates; it does not absorb their law.

A mandatory control is mandatory **because of its authoritative source or real risk**, not because a generic DevOps phase has been labelled “security”. No new blanket independent-review requirement is introduced for L1/L2. L3 follows the independent controls already required for its actual domain/effect.

## 6. Minimal process record

**Only if activated:** use [New DevOps process template](NEW-DEVOPS-PROCESS-TEMPLATE.md). An L1 process can fit in a few sentences; L2/L3 record additional evidence as appropriate. Each record answers:

**Process / owner / scope / level / outcome / phase / change / verification / release disposition / learning.**

A new process can start in an Issue, work package, PR or another governed source system. Link rather than duplicate the canonical record. No new agent, mandatory database or background executor is required.

## 7. Transition and previous DSA proposal

- The **FFOS-DSA-001 nine-gate DevSecOps Assurance Framework** staged on [draft PR #56](https://github.com/Motherpher/FFOS/pull/56) is **not adopted as the universal DevOps operating model**. Its historical experiments and evidence remain available but are not a new requirement for other work.
- The two required candidate DSA check contexts on the FFOS `main` ruleset are to be **retired as universal merge barriers** because their workflows remained on an unmerged proposal branch. Ordinary PR, force-push and deletion safeguards may remain.
- Retire/close unmerged DSA candidate PR rather than retroactively rewriting its historical claims or treating CI success as a release.
- Any future request to use parts of DSA for a particular L3 operation needs a separate, bounded decision. Do not silently inherit nine gates.

## 8. Operational rollout

- **FFOS** hosts this model as the cross-system **optional discovery reference** for newly considered substantial DevOps processes.
- **Pius DevOps Galaxy and other active development domains** may install the passive `.ffos/devops-hook.json` to **offer**, not require, this model. CDX review discovery is separate from the canonical `.cdx/anchor.json`. Their existing workflows remain governed by their canonical sources.
- The method applies from initiation **forward**; do not mark existing open WPs or historic deployments noncompliant for lack of this template.
- The first actually **activated** new process should identify `FFOS-DEVOPS-OM-001@1.1` and L1/L2/L3, then close with a learning note. Offered/declined processes do not become compliance findings.

**Verified rollout:** [Final 1.1 report](ROLLOUT-REPORT-v1.1-2026-11-16.md) and [machine registry](ROLLOUT-MANIFEST-v1.1-2026-11-16.json) document 23/23 active consumer repositories with passive hooks; CDX's sovereign source and seven historical repositories are explicitly excluded. No automatic intake or CDX review execution is claimed.

**Decision rule:** Prioritise coherent movement and evidence proportional to consequence. Preserve higher-source controls; do not invent new ones.

<!-- TEST ONLY — intentionally unversioned normative change; DO NOT MERGE -->
