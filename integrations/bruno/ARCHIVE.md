# Bruno — Traceable API Development Archive

**Owner:** FFOS. **Canonical path:** `integrations/bruno/central-api-ledger/`.
**State (2026-11-20):** archival controls staged; the user's full local Bruno collection has **not been imported** or declared synchronised.
**Programme:** WP01 (API & Data Integration) of the three-WP Bruno → R → QGIS programme.

## Archive design

Git is the immutable, inspectable version history for approved **non-secret** API work. Each accepted change is a commit reviewed through a PR. Preserve:
- collection/folder identities, saved HTTP requests, URLs, supported parameters and template header values;
- request tests, non-secret scripts, provider contract notes and reproducible setup guidance;
- safe environment *templates* (variable names and non-sensitive examples), but never local populated environment files;
- provider access-state metadata, entitlement/rights review and references to verified runtime evidence (no raw restricted payloads);
- review/approval decisions, hashes, commit SHA, timestamps, and verified job receipts.

**Not an archive of secret values:** API keys, passwords, refresh/access tokens, private environment exports, personal data and restricted provider responses are *excluded*. Preserve credential references, not credentials. Secret handling is delegated to approved local/runtime secret storage.

The existing local Bruno installation, identified by user screenshot as
`/Users/linusfast/Documents/bruno/Central API Ledger`,
has 18 requests and a selected Development environment. This is **not proof** that the GitHub OpenCollection tree is an identical backup. Bruno Desktop's 'Initialize Git' button does not by itself create GitHub remote connectivity.

## Restoration / cloning model

1. Clone this private repository at a known commit SHA or release tag. Do not overwrite an existing Bruno collection.
2. Open `integrations/bruno/central-api-ledger/` as the versioned OpenCollection in a compatible Bruno version; validate the format before depending on it.
3. Create `Development` locally with the required non-secret variable names. Supply secrets separately through approved mechanisms.
4. Run `python3 integrations/bruno/validate_collection.py` for static contract QA.
5. Execute explicit non-destructive provider tests with response identity, pagination, rate limits, rights and expected schema; record sanitised evidence. Static PASS is not live acceptance.
6. Check the checkout hash and exact commit/ref against the change history when reproducing an earlier result.

## Safe initial migration from existing Mac collection

**Do not copy the whole folder to GitHub.** Local files may contain secrets, populated environment values, logs or sensitive responses.

- Make a local backup outside the Git worktree and leave the original collection untouched.
- Compare local folder inventory against this repository's existing `central-api-ledger/` structure. Record new/changed/missing paths without copying values into tickets.
- Select and manually review ONLY safe request definitions, folder metadata and non-secret documentation. Convert or reconcile `.bru` versus OpenCollection `.yml` formats deliberately rather than forcing an automatic rename.
- Keep local `environments/`, `.env*`, `secrets/`, cookies, certificates, auth caches, payload exports, request/response logs and unrestricted binary artifacts OUTSIDE Git, even if ignored.
- Stage changes in a dedicated feature branch. Execute `git diff --cached --check` and `git diff --cached`; inspect every staged line for keys, encoded credentials, private values, personal data and endpoints. Automated scanning is additional protection, not sufficient approval.
- Open a PR referencing provider, request paths, schema changes, source access/licence, validation scope and rollback. No unattended main merge or automatic syncing of raw local files.
- Maintain old versions in Git history, not timestamped duplicate trees. Tag accepted archive baselines only after Director approval.

## Evidence classification

| Evidence object | Git policy |
| --- | --- |
| API request definition and safe test assertions | Commit on review branch |
| Environment template with placeholders only | Commit after review |
| Provider access-confirmation metadata | Commit status/date/source reference, **not key or private email body** |
| Sanitised test receipt (HTTP status, response identity, schema, timestamp, dataset vintage and hash) | Commit only if rights/privacy allow; otherwise reference approved private evidence store |
| Raw response, API key, secret, cookies, token, client certificate | Never commit |
| R/GIS generated artifact | FF-Spatial owns data/geo product; FFOS references immutable provenance/receipt |

## Provider inventory (Director-reported, untested)

- SCB — Allmänna företagsregistret: key issued; endpoint/auth still NOT TESTED.
- Lantmäteriet: account created; Geotorget access granted; service-level permissions NOT TESTED.
- Bolagsverket: API access granted; product/endpoint/credentials NOT TESTED.
- Kolada, SCB public statistics and other existing folders: retain and verify independently. Folder presence is NOT connectivity.

## Traceability requirements

Every approved PR must identify: provider and request IDs, source branch, before/after paths, compatibility or breaking effects, actor/reviewer, timestamp, credential-safety review, static test result, live test result (or NOT TESTED), and cross-reference to FFOS run receipt if any. Release tag may pin a reproducible baseline.

Use `python3 integrations/bruno/archive_inventory.py` to generate a **non-secret, paths-and-hashes-only inventory** of files in the approved collection. Review the diff against previous committed archive states. Hashes do not prove source authority or live API access.

## Acceptance

The archive is not complete until the *actual local* collection inventory and approved non-secret definitions are reconciled with GitHub, restore works on a second checkout, and all credentials remain out of the tracked state. This document and CI must not be mistaken for successful Mac migration.
