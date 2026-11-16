# FFOS Cloud Storage v1 — Google Drive adapter

**Initiated:** 2026-11-16 · FFOS DevOps level L3 (external persistent writes / credential scope) · **State:** implementation and offline CI candidate, not authenticated live accepted until a Google OAuth grant is configured and a real Drive readback passes.

## Grounded destination

Director-supplied private My Drive folder [Form & Flöde Operational System - workflow cloud](https://drive.google.com/drive/folders/1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD), root folder ID `1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD`. Folder metadata confirmed owner-controlled and empty at handoff. Do **not** change its existing permissions automatically.

## Implemented storage contract

- `integrations/cloud/drive_storage.py` in FFOS and `gateway/drive_storage.py` in FF-Spatial are identical, bounded independent Python stdlib adapters; duplicate code is a temporary explicit cross-repo contract, not a third-party SaaS dependency.
- Each authorized run creates `FFOS_<run_id>` or `FF-Spatial_<run_id>` as a fresh folder directly beneath the approved root. Runs never overwrite or delete prior files. Each uploaded object is checked by an independent authenticated `files.get?alt=media` readback and byte SHA256 comparison, with recorded Google Drive ID and version.
- Writes `drive-receipt.json` into the run's GitHub Actions artifact directory. Do not treat a GitHub Actions success without this receipt as successful durable publication.
- Only `*.csv`, JSON, GeoPackage, GeoJSON and other approved files **already present in the bounded workflow output folder** can be transferred. Maximum 12 regular files, 100 MiB/file; symlinks ignored, unexpected names rejected.
- Google Drive is a useful persistent working file store, **not** immutable object storage: owners/editors can still change/remove files, Drive revisions have separate retention rules, and quotas apply. Do not treat the 'new folder per run' convention as WORM or legally secure archival.
- GitHub Actions retention remains 14 days as a second evidence trail.

## Required authentication — NOT yet connected

The ChatGPT Google Drive connector grants **ChatGPT** access. It does not grant GitHub-hosted runners access. To bind Actions, Director must explicitly authorize a separate OAuth client/grant, with offline access and access to this particular root folder. Recommended: a dedicated automation identity and the least-privileged `drive.file` scope **only if the folder is explicitly selected/shared with the app using Google Picker or an equivalent authorized file picker**. Google Drive states `drive.file` does not automatically grant access to arbitrary existing folders. Do not silently escalate to full `drive` scope (restricted, whole-Drive access). A full-scope OAuth grant needs a separate documented Director decision and risk review.

Each repo needs secrets named:
- `FFOS_GDRIVE_CLIENT_ID`
- `FFOS_GDRIVE_CLIENT_SECRET`
- `FFOS_GDRIVE_REFRESH_TOKEN`

Save these secrets ONLY in the dedicated GitHub Actions **`drive-publish` environment** (not `cloud-pilot`); the Drive publication occurs in a separate job after computing and uploading short-lived artifacts. Do not paste secrets into chat, issues, commits, logs, documents or Google Drive. The FFOS `drive-publish` environment has Director (`Hybrismannen`) required reviewer protection verified 2026-11-16. GitHub rejected required reviewers on FF-Spatial's `drive-publish` environment (HTTP 422, current plan does not support this protection); its Drive job therefore requires **both** `persist_to_drive=true` and a separate administrator-set GitHub Actions variable `FFSPATIAL_DRIVE_PUBLISH_ENABLED=true`. Leave that variable unset until a verified equivalent protection mechanism is available, or upgrade/provision an eligible environment. Merely configuring secrets in FF-Spatial is insufficient to activate its Drive writes. Google credentials can expire/revoke; the adapter fails closed.

OAuth consent procedure (authorized operator):
1. Configure a Google Cloud project and enable Google Drive API; set an OAuth consent screen and an appropriate OAuth client for the designated automation identity.
2. Authorize **offline** access using a controlled OAuth flow with the appropriate `drive.file` scope and explicitly select the destination root folder via Picker. Record consent scope and identity privately. Never use the existing ChatGPT connector's token in GitHub.
3. Create the three named secrets inside `drive-publish` in both repositories. Keep FF-Spatial's extra enable variable unset until equivalent deployment protection has been established, and ensure Director acceptance. Validate the OAuth grant has **writer access** specifically to folder `1xO4YWl4yQmyRJ6t-A_4j9vaVDkiBhArD` without broadening permissions.
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
