# FFOS — Bruno Central API Ledger

**State: repository landing zone ready; local Bruno Git link NOT established.**

Developer collection destination: `integrations/bruno/central-api-ledger/`.

Bruno on the user's Mac currently holds `Central API Ledger` with 14 Kolada test requests and a Development environment. Those local request files have **not** been transferred to this repository. No verified collection export is present in this commit.

## Secure import — Mac

Bruno collection shown by user:
`/Users/linusfast/Documents/bruno/Central API Ledger`

1. In Bruno, ensure **all requests saved**. Close any open key fields. Do not export environment secrets.
2. In a local terminal, clone a **private** copy of `Motherpher/FFOS` into a trusted folder. Work on a feature branch, not directly on `main`.
3. Compare local Bruno files against `integrations/bruno/central-api-ledger/`. Only copy vetted `.bru` request definitions and the non-secret `bruno.json` collection metadata when its content is independently checked. Do NOT copy `.env`, environment files containing secrets, `secrets/`, `.git/`, data responses, screenshots, or key-bearing files.
4. Inspect EVERY staged line locally for credentials, personal data, and unexpected host endpoints. Git's `git diff --cached` is mandatory. Never treat an automated regex check as sufficient.
5. Commit only sanitized definitions on a review branch. Push the branch, open a PR for review. Director/authority gates still apply before canonical adoption.
6. Re-open the safe collection path with Bruno (after a backup) to check whether its requests and non-secret variables resolve. The original local collection remains untouched until that verification.

Example local terminal sequence (after manual safe file selection):

```bash
git clone git@github.com:Motherpher/FFOS.git
cd FFOS
git switch -c feature/bruno-central-api-ledger
# Manually inspect and copy ONLY non-secret .bru and bruno.json files
git status --short
git diff --check
git add integrations/bruno/central-api-ledger/
git diff --cached --check
git diff --cached
# Commit/push only after confirming zero secrets or restricted data
git commit -m "Stage sanitized Bruno Central API Ledger requests"
git push -u origin feature/bruno-central-api-ledger
```

**Important:** A local Git repository created by Bruno is not connected by clicking `Initialize Git`. GitHub binding requires an actual clone/remote/branch/push. The local collection itself is not accessible from this ChatGPT GitHub connector.

The FFOS root `.gitignore` already ignores `.env` and `.env.*`, but `.gitignore` is not a security boundary. Never assume that all Bruno secret mechanisms are excluded merely because an `.env` pattern exists.

## Versioning and identity

- One provider folder per API under the shared collection. Consumer-specific use cases belong in domain repositories.
- Pin API source and update date in source registry; retain explicit access/rights and HARP review.
- Keep URL path parameters distinct from provider-supported query filters. Kolada `region_type` values are `municipality` or `region`, not `K`/`L`.
- Never call returned `200 OK` a full integration acceptance without checking response identity, paging and provenance.

See `docs/decisions/ADR-API-LEDGER-OWNERSHIP-PROPOSED.md`.
