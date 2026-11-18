# Barnombudet — Local-governance exception to FFOS optional hook enrolment

**Decision date:** 2026-11-16  
**Disposition:** EXCLUDED_FROM_OPTIONAL_FFOS_HOOK_ROLLOUT  
**Affected repository:** [Hybrismannen/Barnombudet](https://github.com/Hybrismannen/Barnombudet)  
**Removal evidence:** [Barnombudet PR #3](https://github.com/Hybrismannen/Barnombudet/pull/3), merged, deleting only `.ffos/devops-hook.json`  
**Earlier installation:** [Barnombudet PR #2](https://github.com/Hybrismannen/Barnombudet/pull/2), retained as Git history  
**Technical source of truth:** [Live hook index](HOOK-ESTATE-INDEX.json), not dated rollout reports

## Reason and organisational boundary

Barnombudet has its own internal development and operational governance. Its repository [README](https://github.com/Hybrismannen/Barnombudet/blob/main/README.md) gives authorised human decisions and approved internal controls precedence and explicitly describes no external agent-governance integration. Its [agent-development standard](https://github.com/Hybrismannen/Barnombudet/blob/main/agent-development/AGENT-DEVELOPMENT-STANDARD.md) distinguishes organisational mandate from technical availability; [access classification](https://github.com/Hybrismannen/Barnombudet/blob/main/docs/ACCESS-CLASSIFICATION.md) imposes internal-information controls.

The FFOS optional discovery hook installed earlier did not itself execute code or send data. Nevertheless, no verified Barnombudet-specific adoption/administrative transfer authorized continued enrolment in a **Director-controlled FFOS** framework or automatic inclusion in future optional-model rollout requests.

Barnombudet has no observed local `.cdx/anchor.json`; the passive FFOS reference must not be treated as establishing a CDX governance binding.

## Controlled remediation

1. Removed the one passive hook file through an isolated Barnombudet PR and verified the change scope. **No** organisational policy, Budget Buddy contracts, dashboard, operational dataset, state engine, scheduled workflow or historical work item was modified.
2. Removed `Hybrismannen/Barnombudet` from [FFOS downstream hook update index](HOOK-ESTATE-INDEX.json) and added an explicit `LOCAL_ORGANISATIONAL_GOVERNANCE_NOT_ADOPTED` exclusion, retaining the earlier installation as historical evidence.
3. Updated the bounded FFOS release-watch validator so it no longer requires Barnombudet to appear among current installations; future downstream model-release issues are generated **from the current enrolled index**, which excludes Barnombudet.
4. Retained `FFOS-DEVOPS-OM-001@1.1` as the canonical model. This is a **repository enrolment correction**, not a new model version, constitutional change, runtime deployment or approval of CDX integration.

## Readback and release boundaries

- **Current enrolled hook index:** 29 repositories (Tier A 3, B 12, C 7, D 7).
- **Explicit exclusions:** CDX constitutional authority source and Barnombudet.
- **Historic snapshot:** 30 installations in the dated Nov 16 rollout report before this organisational correction. Do not rewrite that historical result as if Barnombudet had never been enrolled.
- **Required FFOS status check:** `FFOS DevOps model release integrity` must pass at exact PR head before protected-main merge. An up-to-date required check is necessary; a GitHub PASS does not imply Barnombudet organisational acceptance.
- **Future eligibility:** only a separate explicit Barnombudet-specific adoption and information-governance decision could authorize renewed hook installation. This technical correction does not itself establish that authority.

## Separate follow-up — outside this removal

The Barnombudet repo's `main` branch was observed as unprotected, with a scheduled GitHub workflow capable of committing refreshed generated state. The internal-information classification also calls for server-side authenticated production access. Neither issue was created by the passive hook; they require **separate** security/operations review, not an automatic FFOS/CDX intervention.

**No further change to Barnombudet is implied by this FFOS registry correction.**
