# FFOS DevOps 1.1 — model version publication and hook reconciliation

**Tracking:** [Final version-propagation issue #70](https://github.com/Motherpher/FFOS/issues/70)  
**Scope:** FFOS canonical model only; no cross-repository auto-merge or mandatory DevOps activation.

## Two distinct version meanings

1. The **model.uri** inside a repository hook points to the FFOS model on main. Opening the URL retrieves the **current content** (assuming access to private FFOS).
2. The **model.version** in that same hook is an **installed version snapshot**. It remains unchanged until a normal PR edits that repository.

Therefore, the existing static link does **not** guarantee the per-repository hook has learned about, accepted or become compatible with a new model version.

## Implemented source of truth

- [model-release.json](model-release.json) identifies canonical **current_version**, model source and the distribution policy.
- [HOOK-ESTATE-INDEX.json](HOOK-ESTATE-INDEX.json) holds all **30 installed passive hooks** and their last **observed** versions. It is not live scanning or an approval.
- [model_release.py](../../../tools/devops/model_release.py) checks consistency among release version, model README, local FFOS hook, template and index; it generates a per-version issue body from last-observed versions.
- [GitHub Actions workflow](../../../.github/workflows/devops-model-release-watch.yml) runs a narrow integrity job on **all FFOS pull requests**, but requires version increment only when canonical model or amendment text changes. Unrelated work gets a lightweight PASS; it does not require DevOps activation.
- When a **new model version lands on FFOS main**, the workflow attempts to create **one idempotent FFOS tracking issue** with a checklist for all downstream hooks observed on an earlier version. It uses only a FFOS-local GitHub Token with issues:write. Actual Actions execution must be verified before claiming issue delivery works.

## Normal release sequence

1. An authorized change updates canonical model documentation.
2. In the same PR, increment **model-release.json.current_version** and keep the model identity, template hook and FFOS local hook versions consistent.
3. The narrow GitHub check validates this change. After merge, a main-branch workflow creates a downstream **tracking issue**, rather than silently assuming 30 repositories updated.
4. Normal owner-compatible PRs update local hook version fields, review compatibility and preserve every repository's CDX anchor and historical work.
5. Each installed version is **read back** and the index's observed_model_version updated with verified evidence. Complete rollout issue after reconciliation.

**No cross-repository push credentials or GitHub App have been configured by this workflow.** Cross-repository PR creation and merging are separately authorized work, not part of the version publication pipeline. Do not place a PAT in source or weaken repo protection to automate propagation.

## When no release is needed

- Minor edits to unrelated repositories: no additional process or release check.
- Director declines DevOps: ordinary workflow.
- Edits to historical evidence or the downstream observation index alone do not require incrementing the canonical model version.

## Scope and constitutional exception

30 installed hooks: Tier A (3), B (13), C (7), D (7). **Conductellence's constitutional source remains excluded** because its protected authority requires sovereign approval. Barnombudet remains Tier B and was **not modified** in the Tier D expansion.

The seven new Tier D hooks do not modify historical work: they advertise a possible method for **new work** when chosen. CDX review remains a conditional, non-authorizing reference.

## Failure and recovery

If GitHub Actions fails, investigate rather than assuming hooks updated. The upstream version remains source truth and stale downstream versions remain explicit in the index. Correct the error/permissions and re-run. Issue-creation idempotency prevents duplicates.

This is a distribution **notification and tracking pipeline** with one scoped merge integrity check. It does not claim autonomous cross-repository synchronization, remote secret management, runtime CDX mediation or an estate-wide agent.

## Verification status

The single native FFOS required status check and a negative blocked-merge test are recorded in the [final technical verification](RELEASE-WATCH-VERIFICATION-2026-11-16.md). The first main push ran the issue-publisher safely with no model-version bump; the first **actual future new-version issue publication remains untested** until such a version is released. The 30-repository index is based on authenticated observations, not automatic remote polling.
