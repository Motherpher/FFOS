# FFOS Estate Development History — Archive navigation

**Snapshot:** 2026-11-20 · **State:** staged for review, not canonical acceptance  
**Record:** FFOS-ESTATE-HIST-20261120-002 · **Coverage:** 35 GitHub repositories discovered; selected historical chat excerpts and selected original files, PRs, CI and GitHub Actions; local applications not fully copied.

This is the **entry point for a future Director or DevOps operator**. The historical source repositories continue to own their own truth. This index does not move all their code or data into FFOS, create a new authority, or claim a complete export of every ChatGPT chat.

## Read in this order

1. **[Cross-chat and 35-repository development history](../../../integrations/bruno/audit/CROSS-CHAT-AND-ESTATE-DEVELOPMENT-HISTORY-2026-11-20.md)** — chronology from foundations to cloud transition, key apps, evidence hierarchy, contradictions and remaining gaps.
2. **[35-repository machine inventory](../../../integrations/bruno/audit/CONNECTED-ESTATE-REPOSITORY-INVENTORY-2026-11-20.json)** — role classification, source URLs and main-HEAD discovery fingerprints for all repositories visible at audit time.
3. **[Bruno/R/QGIS historical technical audit](../../../integrations/bruno/BRUNO-R-QGIS-HISTORICAL-AUDIT-2026-11-20.md)** — detailed primary links, access, runtime tests, historical exceptions and post-audit corrections.
4. **[Bruno archive/restore guide](../../../integrations/bruno/ARCHIVE.md)** — safe request collection versioning, local migration, credential exclusions and independent reproducibility gate.
5. **[FFOS WP01–03 recovery](../../operations/BRUNO-R-QGIS-THREE-WP-RECOVERY-2026-11-20.md)** — lives on [FFOS draft PR #122](https://github.com/Motherpher/FFOS/pull/122), not main at this audit snapshot; companion on [FF-Spatial PR #50](https://github.com/Motherpher/FF-Spatial/pull/50).

## Learning paths

**New operator / beginner:** read glossary in technical audit → distinguish Bruno/CLI/API provider, R/renv, GeoPackage/QGIS, Git/PR/CI, cloud/Drive storage → study one successful [FFOS cloud Kolada→Drive run](https://github.com/Motherpher/FFOS/actions/runs/44228146764) and one successful [FF-Spatial cloud GIS run](https://github.com/Motherpher/FF-Spatial/actions/runs/43789803086), while noting their separate scopes.

**Review / audit:** confirm immutable source URLs and commit pins → inspect historical PR descriptions/diffs and Actions job/artifact metadata → validate provider access/rights and negative tests → identify missing Mac/non-GitHub evidence → add dated, append-only correction with exact run reference. A previous status is *never silently overwritten* by a later run.

**DevOps/implementation:** keep programme capped at **WP01 API & Data**, **WP02 Spatial & Persistence**, **WP03 End-to-End Acceptance & Handover**. Historical FF-Spatial sourcing tasks and other domain work packages stay in their own preexisting registers; they do not increase the cap for this project.

## Evidence and confidentiality

- Git holds **versioned safe definitions, documents, methods and evidence references**, not credentials or an unlimited raw data archive.
- Live run success is not necessarily schema/rights/semantic/final-output acceptance.
- Personal ChatGPT context extraction is **not a full chat export**. Without the exported source transcripts, do not label this corpus exhaustive.
- Mac Bruno `Development` environment, prior untracked files, local R/QGIS projects and private reports still require secret-safe source reconciliation.
- Google Drive publication is separate from immutable storage; no overwrite/delete permission is implied.
- CDX 1.0 / Pius / AMA / HARP / HCC remain separately governed.

## Status

The archive branch and CI provide an **initial auditable estate history with traceable sources**. Promotion to `CANONICAL / COMPLETE` needs source-coverage signoff, local/non-GitHub evidence review, full restoration rehearsal and Director approval.
