# Google Drive AI Hardgate — Build Report 2026-11-18

**Release disposition:** HOLD / DRAFT CODE ONLY — no production Google Drive effect executed, no existing Drive data modified.
**Director policy:** OAI-DRIVE-APPEND-ONLY-001 v1.0 binding, v1.1 proposed (not adopted).
**CDX source:** CDX-LAW-001@1.0.0, CDX-RUNTIME-001, source-controlled policy/external-effect controls, SPETL, Security Twin.

## Implemented in this work session

### FFOS — draft PR #91

1. Direct HTTP request allowlist in `integrations/cloud/drive_storage.py`: disallow update/delete/ACL/metadata mutations by method/path, including indirect upload-to-existing ID.
2. Code-pinned exact allowlist `APPROVED_ROOT_IDS` for the known FFC workflow cloud root. Protected policy folder explicitly tracked but never an output destination.
3. Independently configured `FFOS_GDRIVE_APPROVED_ROOT_ID` must match both code allowlist and requested root; unknown configurations fail before obtaining credentials.
4. New-folder creation restricted to approved root ID. Upload restricted to a folder created by this adapter instance. Reads restricted to that root and newly created folder/file IDs.
5. Resumable upload continuation bound to a session URI returned by the same adapter after create-initiation; exact size + SHA256 digest, one-time consumption, refusal of arbitrary/replayed session URIs and untrusted upload routes.
6. Read-only OAuth preflight root binding corrected.
7. New `integrations/cloud/drive_approval.py` standalone **OFFLINE** verifier for signed exact-object mutations. Time-limited, single-use, actor/run/target/operation/policy/effect/metadata bound, local SQLite replay protection; deliberately DOES NOT issue approvals or execute Drive mutations. Shared-key HMAC reference is NOT distributed-production-safe if a consumer can sign, so a separately authenticated issuer and asymmetric verification remain required before deployment.
8. Negative tests for blocked requests without network effects, forged parents, missing root, replay, content mismatch, approval replay/expiry/metadata drift.
9. Workflow `cloud-kolada-municipality.yml` now requires explicit `FFOS_DRIVE_SECURITY_RELEASE_APPROVED=true` plus a matching `FFOS_GDRIVE_APPROVED_ROOT_ID` for Drive publish; disabled by default and still subject to existing environment approval. Offline tests run during validation.
10. `docs/security/GOOGLE-DRIVE-SECURITY-ESTATE-v0.1.json` preserves known clients, unknown OAuth grants, acceptance gaps. Runbook defines explicit stop, revocation, evidence and restoration.

### FF-Spatial — draft PR #49

Same source-controlled root protection and create-only request/session safeguards in `gateway/drive_storage.py`, with offline negative tests. `cloud-headless-adm1.yml` now additionally requires `FFOS_DRIVE_SECURITY_RELEASE_APPROVED=true` and matching separately configured approved root in addition to existing `FFSPATIAL_DRIVE_PUBLISH_ENABLED=true`; default disabled.

### CDX — draft PR #78

Proposed `POLICY/proposals/OAI-DRIVE-EXTERNAL-EFFECT-CONTROL-v1.1.json` uses existing `EXTERNAL_EFFECT` enforcement surface and the canonical 14 kap. 4 § source, with 12 deterministic test vectors. Includes `AUDITS/test_drive_control_candidate.py` and a proposal-only CI workflow. This is **NOT** a new accepted control, law change or active runtime integration; no edits to accepted CDX 1.0 `POLICY/control-registry.json`.

## Independently observed CI (latest exact commits)

- FFOS head `f3ec59a5075717da72e485623d95dc5f100df2ad`: cloud contract CI PASS https://github.com/Motherpher/FFOS/actions/runs/44219862956
- FF-Spatial head `a784535c9329e44b968de0ec709d984a9cef2957`: gateway validation PASS https://github.com/Motherpher/FF-Spatial/actions/runs/44219867621
- CDX head `caef4c51b3a532904562e5fba516c0615d076c9b`: candidate test PASS https://github.com/Hybrismannen/Conductellence-/actions/runs/44219482078 and law/mutation/reconciliation CI PASS on same head.
- All three PRs were observed OPEN / DRAFT / UNMERGED. Their CI proves offline candidate behavior only; it does not attest Google Drive effect mediation in production.

## Required external controls before LIVE enforcement acceptance

**GATE A — Director / CDX:** human sovereign protected PR approval, accepted CDX policy/control registration, version pin, immutable review record and an explicit scope decision. Do not treat generic task authorization as constitutional acceptance.

**GATE B — Google OAuth inventory:** enumerate every installed Google Drive-capable app and OAuth grant, including any scripts, Cloud credentials, sync clients and other MCP providers; verify actual scopes and identities. No full estate client inventory has been attested.

**GATE C — Credential isolation:** every machine writer must use a non-exportable or tightly confined token only in the approved gateway; no sibling process may have a bearer credential that bypasses it. ChatGPT's `ask_before_writes` plugin setting does not control other Google apps.

**GATE D — Director approval issuer:** separately authenticated, tamper-resistant, exact-target, expiring, one-time approval source. The current HMAC and local SQLite verifier is a developer reference, not an acceptable distributed production approval service.

**GATE E — SPETL / independent custody:** emit pre-effect and post-effect policy decisions with correlation, actor, mandate and evidence; preserve in an independently controlled service. Current Drive adapter's checksum receipt is NOT complete SPETL.

**GATE F — Synthetic LIVE negative tests:** use newly created, harmless test documents only; observe no mutations on blocked updates/ACL/delete/move or Docs/Sheets batch operations. Verify candidate create under authorized root and record independent provider readback.

**GATE G — Backup and response:** inventory reliable backups, run restoration to NEW test destination, establish revocation and incident escalation; never automatic in-place repair.

**GATE H — Estate release:** audit all writer routes after merge, deploy, retest, verify Security Twin and Director acceptance; until then `DRIVE_HARDGATE_VERIFIED=false`.

## Current security posture

The ChatGPT Google Drive plugin remains in `ask_before_writes` / Allow read actions mode (connector readback this session). Repository drafts now contain stronger code gates and conditional release HOLDs. No actual Google Drive OAuth grant changes, credential revocations, production deployment or existing-content mutations were performed.

**Correct status:** IMPLEMENTATION_CANDIDATE_CI_PASS / GLOBAL_HARDGATE_NOT_VERIFIED / PRODUCTION_DRIVE_WRITES_HOLD.
