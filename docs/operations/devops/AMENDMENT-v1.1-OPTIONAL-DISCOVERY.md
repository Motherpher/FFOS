# FFOS DevOps Operating Model — Amendment 1.1

**ID:** FFOS-DEVOPS-OM-001@1.1  
**Adopted instruction:** Director, 2026-11-16  
**Scope:** Non-invasive discovery and **optional activation** for newly considered DevOps development activities.  
**Status:** Operating-method amendment; no CDX, AMA, HCC or repository-policy modification.

## The corrected default

**The repository remembers the model. The Director decides whether to use it.**

- A local `.ffos/devops-hook.json` offers the current [model](README.md), without opening a process, creating a work package, invoking an agent, requiring a CI check or authorizing a deployment.
- A **small change** continues through the repository's normal methods; no DevOps model assessment or mandatory record is necessary.
- For larger NEW efforts, the Director may choose **ACTIVATE**, **DECLINE** or **DEFER**. Only **ACTIVATE** starts a six-phase DevOps process with proportionate L1/L2/L3 support. **DECLINE** leaves ordinary work intact; DEFER leaves it undecided without blockage.
- Before Director selection, `model_activated=false`. Presence of a hook is never interpreted as consent.
- Already running, historical and completed work remains completely unaffected. Existing work packages keep their original names, evidence, procedures and decisions.
- The six phases themselves, and the L1/L2/L3 definition in Model 1.0, remain intact **when voluntarily activated**. The old text “all new DevOps processes use this model” is superseded prospectively by this optional-activation amendment.

## Minimal activation prompt (nonblocking)

> An optional FFOS DevOps Operating Model is available for this repository. Is this a larger new development process where the Director wishes to use the model? Activate / Decline / Defer. For a minor change, continue normally.

Do not repeatedly interrupt routine edits. Present this once when a newly initiated *substantial development process* is being defined or explicitly when requested. Do not synthesize a Director choice from repository settings, the presence of a file or a generic development instruction.

## CDX review is separate from DevOps activation

CDX review may be **requested** for (a) a Director-authorized review, or (b) a development change where an **existing** CDX/AMA/Pius or domain contract calls for governance evaluation. That referral is independent of whether the optional DevOps model is activated.

The hook may carry a **review-discovery link** to [CDX](https://github.com/Hybrismannen/Conductellence-) and the well-known local canonical `.cdx/anchor.json` path. This is **not** a second CDX anchor. The actual anchor's existence, policy pin, current state and relevant review authorization must be checked independently before claiming any binding. No automatic `ALLOW`, CDX policy decision, SPETL receipt or verified runtime integration is produced by reading the hook.

A review can be **REQUESTED**, **NOT_REQUESTED** or **REFER_TO_CANONICAL_CONTROL** in its local work record; it cannot itself grant a mandate. See [conditional review interface](CDX-REVIEW-INTERFACE-v1.1.md).

## Rollout policy

- Install the tiny hook to discover the model in actively maintained **Tier A/B** repositories and **Tier C** projects where new development may occur. Historic/derivative Tier D is excluded.
- Avoid replacing any existing repo-specific `.ffos/devops-hook.json` without inspection; use an owner-compatible PR and preserve the repo's canonical sources.
- Every copy points to **one** canonical FFOS model. Do not duplicate model or CDX constitutional content.
- This hook is a passive discovery record. No GitHub Actions trigger, recurring job, mandated review count, auto-generated Issue or agent orchestration is introduced.
- Repositories may uninstall or disable this optional hook through ordinary source control without affecting constitutional governance.

## Decision / version semantics

Version 1.0 is preserved in Git history and remains a valid historic process reference for work started during its effective period. From the 1.1 amendment onward, *new* use is optional and Director-controlled. Do not retrofit 1.1 to previously started work.

**Administrative outcome:** Once this bounded amendment and selected-repository linkage are verified, FFOS issue #62 may be closed as the final framework issue. Future changes require a separate explicit mandate and incremented version.

## Verified completion and scope exception

The [rollout report](ROLLOUT-REPORT-v1.1-2026-11-16.md) and [machine ledger](ROLLOUT-MANIFEST-v1.1-2026-11-16.json) record **23/23 active consuming repositories** installed and read back, with seven historical Tier D repositories excluded. CDX's constitutional authority root is independently excluded because its protected, frozen release boundary and mandatory human-sovereign-approval must not be weakened for a passive optional pointer. The conditional CDX review link remains present in consuming hooks. These counts are a dated snapshot, not a live monitoring system.
