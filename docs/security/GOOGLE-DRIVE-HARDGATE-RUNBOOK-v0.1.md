# Google Drive AI Security — Hardgate, Incident and Release Runbook

**Policy authority:** OAI-DRIVE-APPEND-ONLY-001 v1.0 · **Status:** DRAFT OPERATIONAL HANDBOOK, no production acceptance.
**CDX source:** CDX-LAW-001@1.0.0 and CDX-RUNTIME-001@1.0.0.
**Policy root:** `0. Open AI - Access & Privacy Rules`; never auto-edit or auto-clean.
**Inventory:** [GOOGLE-DRIVE-SECURITY-ESTATE-v0.1.json](GOOGLE-DRIVE-SECURITY-ESTATE-v0.1.json).

## Pre-effect rule

**READ authorized task data; CREATE genuinely new private objects in an exact reviewed parent. Existing objects are read-only to AI unless a Director-issued, single-use, exact-object/effect approval is authenticated by a separate issuer. Missing authorization = DENY.** Treat DELETE/TRASH, move, rename, permissions, Docs/Sheets/Slides changes, copy, bulk sync and rollback as mutations. Do not mistake a `POST` for non-destructive behavior.

## What is now coded but NOT released

- `integrations/cloud/drive_storage.py` has a strict Google file-create/request allowlist, code-pinned authorized parent, runtime environment match, per-run new-folder provenance, read restrictions, resumable-session-origin and SHA256 binding, and replay rejection.
- `integrations/cloud/drive_approval.py` checks exact-scope, signed approvals, target metadata freshness, expiry and single-use SQLite replay state. **This is a local reference verifier only**. No human-authenticated approval issuer, independent production signing service or distributed durable replay state exists.
- The FF-Spatial sibling adapter has the same create-only protections; live token isolation and all-application reachability remain UNKNOWN.
- The new CDX external-effect predicate is a proposed control and is not in the 1.0 `POLICY/control-registry.json`.

## Fail-closed environment preparation

**Do not provision production Drive credentials or enable workflow persistence until all gates below pass.**

1. Enumerate the Google account's complete OAuth-connected application list, issued credentials/scopes, Apps Scripts and service accounts through account-owner/provider-authorized read-only inspection. Keep secrets out of chat, GitHub, logs and public docs.
2. For each writer, establish token identity and independently disable direct writes not going through the approved gateway. `drive.file` is not create-only. Google access scopes alone cannot enforce the Director's rule.
3. Verify `FFOS_GDRIVE_APPROVED_ROOT_ID` equals the reviewed source-controlled allowlist ID. The existing `FFOS_GDRIVE_ROOT_FOLDER_ID` must match. Changing an environment variable cannot authorize an unreviewed root.
4. Constrain credentials to dedicated GitHub Actions environment with Director approval and independent negative checks. Do not confuse the ChatGPT plugin's `ask_before_writes` setting with the GitHub OAuth client.
5. Obtain the signed CDX/Director authority, approved run IDs, evidence-preservation capability and independent pre-effect logging implementation; never claim that a SHA256 readback or CI PASS alone proves human authorization.
6. Run tests on newly generated synthetic files only, including denied edit/delete/move/rename/share/Docs/SHEETS API calls. A blocked request must cause **zero** provider effect.
7. Before any live write, capture the policy digest, credential/workload ID, target parent and run identity. Require verified authorization and independent evidence custody. If any prerequisite is missing: HOLD.
8. Re-run negative tests after any GitHub PR merge, OAuth client change, token rotation or allowlist version change.

## Incident STOP/HOLD sequence

1. **STOP** relevant AI/cloud Drive writing jobs. Disable deployment variables and revoke or suspend compromised OAuth grants through authorized Google account controls. The assistant cannot self-issue provider-admin changes.
2. Preserve pre-existing objects untouched. Do NOT 'repair' or 'roll back' in place automatically.
3. Collect *minimum* evidence: affected Drive IDs, parent IDs, provider revision/version, exact effect type, actor/token client metadata, timestamp, correlated CDX decision/SPETL events, and known recipients where sharing changed. Do not publish personal data.
4. Independently verify available restoration options and off-Drive backups.
5. Ask the Director for an explicit, itemized restoration action. Recovery of an existing file is itself a protected mutation.
6. Keep the incident open until evidence preservation, provider access containment, Director review and root-cause remediation are verified.

## Governance and release

- CDX constitutional protected-surface modifications: branch → PR → constitutional/technical audit → **Director sovereign approval** bound to exact head SHA → protected merge. Do not merge merely because CI succeeded.
- FFOS and FF-Spatial: review/merge their draft PRs under source-specific controls; inspect credential/workflow paths and update upstream code pins; do not enable persistent publishing until external approval gate and evidence custody pass.
- A new Google Drive client requires read-only registration, static analysis of its possible write methods, credential isolation, all negative tests and Director acceptance before admission.
- **System-wide HARDGATE is NOT VERIFIED** while any bearer token can write around the enforcing gateway or any client is missing from the inventory.
