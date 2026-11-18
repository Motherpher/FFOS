# FFOS Cloud Storage v1 — Google Drive adapter

**Initiated:** 2026-11-16 · FFOS DevOps level L3 (external persistent writes / credential scope) · **State:** OAuth branding/domain configuration verified by Director screenshot 2026-11-18; implementation/offline CI ready; authenticated live acceptance still HOLD until Desktop OAuth client/grant, GitHub secret admission, folder preflight and real Drive readback pass.

## Grounded destination

Director-supplied private My Drive folder [Form & Flöde Operational System - workflow cloud](https://drive.google.com/drive/folders/1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD), root folder ID `1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD`. Folder metadata confirmed owner-controlled and empty at handoff. Do **not** change its existing permissions automatically.

## Implemented storage contract

- `integrations/cloud/drive_storage.py` in FFOS and `gateway/drive_storage.py` in FF-Spatial are identical, bounded independent Python stdlib adapters; duplicate code is a temporary explicit cross-repo contract, not a third-party SaaS dependency.
- Each authorized run creates `FFOS_<run_id>` or `FF-Spatial_<run_id>` as a fresh folder directly beneath the approved root. Runs never overwrite or delete prior files. Each uploaded object is checked by an independent authenticated `files.get?alt=media` readback and byte SHA256 comparison, with recorded Google Drive ID and version.
- Writes `drive-receipt.json` into the run's GitHub Actions artifact directory. Do not treat a GitHub Actions success without this receipt as successful durable publication.
- Only `*.csv`, JSON, GeoPackage, GeoJSON and other approved files **already present in the bounded workflow output folder** can be transferred. Maximum 12 regular files, 100 MiB/file; symlinks ignored, unexpected names rejected.
- Google Drive is a useful persistent working file store, **not** immutable object storage: owners/editors can still change/remove files, Drive revisions have separate retention rules, and quotas apply. Do not treat the 'new folder per run' convention as WORM or legally secure archival.
- GitHub Actions retention remains 14 days as a second evidence trail.

## Google Auth Platform identity — branding blocker cleared

Director evidence on 2026-11-18 confirms Google Auth Platform Branding is saved for **FFOS Cloud Drive**, with Form & Flöde logo, support/developer contact, `https://formflode.com` homepage, `/privacy`, `/terms`, authorized domain `formflode.com`, and publishing status **Testing**. Google reports app verification is not required while Testing.

This proves the app identity/domain layer only. OAuth client credentials, offline grant and Drive folder access remain separate.

## Required authentication — OAuth grant not yet live accepted

The ChatGPT Google Drive connector grants **ChatGPT** access. It does not grant GitHub-hosted runners access. To bind Actions, Director must explicitly authorize a separate OAuth client/grant, with offline access and access to this particular root folder. Recommended: a dedicated automation identity and the least-privileged `drive.file` scope **only if the folder is explicitly selected/shared with the app using Google Picker or an equivalent authorized file picker**. Google Drive states `drive.file` does not automatically grant access to arbitrary existing folders. Do not silently escalate to full `drive` scope (restricted, whole-Drive access). A full-scope OAuth grant needs a separate documented Director decision and risk review.

Each repo needs secrets named:
- `FFOS_GDRIVE_CLIENT_ID`
- `FFOS_GDRIVE_CLIENT_SECRET`
- `FFOS_GDRIVE_REFRESH_TOKEN`

Save these secrets ONLY in the dedicated GitHub Actions **`drive-publish` environment** (not `cloud-pilot`); the Drive publication occurs in a separate job after computing and uploading short-lived artifacts. Do not paste secrets into chat, issues, commits, logs, documents or Google Drive. The FFOS `drive-publish` environment has Director (`Hybrismannen`) required reviewer protection verified 2026-11-16. GitHub rejected required reviewers on FF-Spatial's `drive-publish` environment (HTTP 422, current plan does not support this protection); its Drive job therefore requires **both** `persist_to_drive=true` and a separate administrator-set GitHub Actions variable `FFSPATIAL_DRIVE_PUBLISH_ENABLED=true`. Leave that variable unset until a verified equivalent protection mechanism is available, or upgrade/provision an eligible environment. Merely configuring secrets in FF-Spatial is insufficient to activate its Drive writes. Google credentials can expire/revoke; the adapter fails closed.

OAuth consent procedure (authorized operator):
1. In Google Cloud **Clients**, create a **Desktop app** OAuth client for the one-time FFOS bootstrap. Keep the Google Drive API enabled. Do not use a client type that cannot use loopback redirect URIs.
2. Run `python scripts/google_drive_oauth_bootstrap.py --token-file <private-local-path> --folder-id 1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD`. Enter the Desktop client ID/secret locally when prompted. The helper requests only `drive.file`, offline access and PKCE; it never prints the refresh token.
3. If the existing governance root is not visible under `drive.file`, **do not broaden to full Drive scope**. Either authorize that root through Google Picker/equivalent app authorization, or rerun the helper with `--create-managed-root "FFOS Cloud Drive Runtime"`. The latter creates an app-owned folder; manually move that folder beneath the approved governance root, then use its ID as `FFOS_GDRIVE_ROOT_FOLDER_ID`.
4. Create the three named secrets inside GitHub `drive-publish`: `FFOS_GDRIVE_CLIENT_ID`, `FFOS_GDRIVE_CLIENT_SECRET`, `FFOS_GDRIVE_REFRESH_TOKEN`. Never paste them into chat/issues/commits/logs. Delete the local token file after GitHub secret admission is confirmed.
5. Manually run **FFOS Google Drive OAuth preflight**. It refreshes the token and verifies folder identity + writable-folder capability without mutation. If using an app-managed child, pass its ID or set environment variable `FFOS_GDRIVE_ROOT_FOLDER_ID`.
6. Only after preflight PASS, run the Kolada canary with `persist_to_drive=true`.
4. In GitHub Actions manually run `FFOS cloud API — Kolada municipality` with `municipality_id=0380` and `persist_to_drive=true`. Verify that Google Drive contains a new `FFOS_kolada_0380_<runid>` child, the two source files, and the resulting GitHub `drive-receipt.json` with `readback_verified=true`, SHA256, file IDs.
5. Only after FF-Spatial has appropriate access protections, set its `FFSPATIAL_DRIVE_PUBLISH_ENABLED=true` GitHub Actions variable; then run `FF-Spatial cloud headless ADM1` with `persist_to_drive=true`. Verify the GeoPackage (EPSG:3006, 21 features in the previously accepted public pilot) plus provenance; verify authenticated Drive readback digest.
6. Check quotas, access from the intended operator account, storage costs, retrieval and document lifecycle. Mark accepted only after both real uploads and later independent download checks succeed.

## Operational fail-closed behavior

`persist_to_drive` defaults to false. With false, approved public cloud runs still create short-lived GitHub Actions artifacts and do not touch Drive. The separate publication job runs only after completed source artifact upload and environment approval. FF-Spatial additionally refuses publication while `FFSPATIAL_DRIVE_PUBLISH_ENABLED` is not `true`. With true, missing/invalid OAuth secrets, disallowed API hosts, invalid root/folder ID, excessive file size/count, mismatched upload metadata, or SHA mismatch stop the job and yield **no verified receipt**.

The existing FFOS and FF-Spatial API/GIS pilots have real cloud execution PASS evidence from 2026-11-16. **Their Drive persistence is not tested until OAuth is configured**. Do not decommission local installations solely on this documentation.

## Architecture handoff

FFOS owns cross-system storage policies and dispatcher; FF-Spatial retains canonical GIS artifacts and its own isolated publisher until reusable provider package placement is approved. No expansion of Pius/CDX/AMA agent authority. This is the storage step for [FFOS cloud migration programme](https://github.com/Motherpher/FFOS/issues/69).

## DevOps stages

Plan / Design: done. Build: staged. Test: offline CI pending on PR, live Drive write HOLD. Release: HOLD for persistent publication. Learn: compare Drive quota/limits and evaluate versioned object storage if datasets grow.
