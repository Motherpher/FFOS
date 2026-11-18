# Google Drive Full Security & CDX Hardgate — Implementation Workplan v1.1 (DRAFT)

**State:** proposed and not production-approved. **Director policy:** OAI-DRIVE-APPEND-ONLY-001 v1.0 remains binding.
**Successor draft:** https://docs.google.com/document/d/1jjimsADzcACFioQEbq98eXOsv1_sO5GGNv2_ma-Qdjw/edit
**CDX design:** https://github.com/Hybrismannen/Conductellence-/blob/policy/openai-drive-create-only-20261118/GOVERNANCE/proposals/GOOGLE-DRIVE-SECURITY-FRAMEWORK-v1.1-DRAFT.md
**Authority contract:** CDX-RUNTIME-001 v1.0.0, CDX-LAW-001, SPETL v1.1, AMA-001. No new sovereign agent.

## Existing facts

- `integrations/cloud/drive_storage.py` currently implements a bounded new child folder/upload pattern and SHA-256 readback; no deletion/overwrite function is intended. Its separate authenticated OAuth live acceptance remains on HOLD as documented in `docs/architecture/GOOGLE-DRIVE-CLOUD-STORAGE-v1.md`.
- Open draft PR #91 includes a pre-request method/body allowlist and offline tests for its specific adapter, not a cross-system Drive API gateway. A Google-issued resumable upload session URL alone does not prove a session was created by this exact authorized run.
- `drive.file` is a per-file-access scope with update/delete capability on allowed files; not a native create-only restriction.
- Other consumers (e.g. FF-Spatial, ChatGPT, possibly scripts and external apps) remain separately accountable. No project-wide GDrive write-path census was verified.

## Design invariant

**No AI machine process may obtain any existing-object mutation effect on Director-controlled Drive unless an authenticated, target-specific, single-use Director approval is independently checked just before that effect.** READ and genuinely NEW creation are the only default allowed operations.

## Implementation order / bounded WPs

| WP | Deliverable | Acceptance gate |
|---|---|---|
| GD01 | Credential/application inventory (OAuth clients, scopes, runners, app accounts, secret locations, routes) with read-only observation | No undocumented writer; unknowns explicitly BLOCKED |
| GD02 | Drive file-ID/parent-ID authorized-root registry and source-derived sensitivity classification | No name/path-only authorization |
| GD03 | Deterministic Drive operation classifier: READ, CREATE_NEW, MUTATE_EXISTING, DELETE, ACL, SYNC, RECOVER, UNKNOWN | Unknown and indirect Docs/Sheets/Slides mutations DENY |
| GD04 | New-object transaction registry and provider upload-session binder with nonce + parent + checksum + session origin | Reused/foreign upload session rejected before network effect |
| GD05 | Exact-object human approval service with signed, expiring, one-time grants and version/diff binding | Forgery, replay, wrong target, changed version fail |
| GD06 | Single credentialed Drive gateway; separate read and restricted writer identities, CDX pre-effect decision and SPETL receipts | No consumer can bypass gateway with same OAuth token |
| GD07 | Broad negative/adversarial tests on synthetic test data, credential revocation tests and controlled integration canary | Every prohibited effect blocked, no existing item changed |
| GD08 | Security Twin graph, independent evidence custody and Drive changes monitor | Detection evidence distinguished from prevention |
| GD09 | Independent authorized backup and restore-to-NEW-object drill | Human-only in-place restore, readback verified |
| GD10 | Repo review, CDX constitutional approval, exact version pin, independent runtime acceptance | Director signs release; evidence for each live writer |

## Technical implementation safeguards

- Apply policy before all network requests at the gateway, not merely as a prompt filter. No direct Drive refresh tokens in other runtime workers.
- Restrict `POST files.create` to approved parent IDs and a fresh create intention; restrict upload `PUT` to a session bound by a trusted registry. Block `PATCH files.update`, `DELETE`, permission APIs, Docs batchUpdate, Sheets batchUpdate and shortcuts unless a separate privileged exact-scope approval executor exists.
- A new file's initial population is an authorized create transaction with bounded duration; once sealed, that ID becomes read-only.
- Bind approvals to actor, target ID, current metadata/version, operation, changed fields, preview digest, run, nonce, TTL and policy digest. Approval cannot be inferred from a chat task or a connected Google account.
- Use SPETL PRE_EFFECT and POST_EFFECT evidence, independent custody and revocation checks. If CDX policy or required custody cannot be reached, stop before the effect.
- Treat Drive changes notifications as audit/detection, never an API pre-effect gate.
- Disallow wildcard cleanup/rollback; a restored existing item is itself a mutation needing explicit Director approval.
- Support future onboarding only after a new app/credential is registered and its negative tests pass.

## Deployment/acceptance truth

Nothing here asserts release, live OAuth revocation, production API gateway, owner-account enforced immutability or operational CRM storage integration. No existing Google Drive files should be edited to implement this draft. Existing CDX/FFOS/AMA protections and HCC remain unaffected.
