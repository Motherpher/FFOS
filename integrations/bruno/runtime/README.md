# FFOS — Bruno CLI integration runtime (pre-agent)

Status: **candidate code; simulated tests available; local Bruno CLI and live API not yet validated**.

This module is an FFOS integration capability. It is **not** an AMA agent, a new agent identity, a ChatGPT plugin, or an authorized remote-shell interface. FFOS source/authority and FF-Spatial domain boundaries remain unchanged.

## Contract

- An operator-approved local configuration maps stable `operation_id` to one reviewed `.bru` request under the local Central API Ledger collection.
- Each request (`.bru` legacy or `.yml` OpenCollection) is cryptographically pinned by SHA256; request edits require review and re-pinning. The collection marker (`bruno.json` or `opencollection.yml`) must match the selected request format.
- Each call specifies exactly `job_id`, `operation_id`, `parameters`; every parameter must match a configured allowlist and regex.
- The default is a **dry run**: it validates but does not call the API.
- Explicit `--execute` invokes Bruno CLI with fixed arguments, no shell, a bounded timeout and a private JSON reporter plus receipt.
- Repeated job IDs are rejected; reports and receipts are local (not for GitHub). HTTP/API validation and result extraction must be verified against the real report before use as a data source.

## Mac preflight

1. Locate the **actual** Central API Ledger folder in Bruno. The Director confirmed `/Users/linusfast/Documents/bruno/Central API Ledger` with an `opencollection.yml` marker; inspect `.yml` request filenames, not just `.bru`.
2. Check `bru --version` and `bru run -h`. Install Bruno CLI separately if needed: `npm install -g @usebruno/cli`.
3. Inspect the exact request file and scripts, including scripts in parent folders. Ensure it is GET/read-only and does not expose secrets. **Do not import or commit local secrets**.
4. Compute `shasum -a 256 'path/to/request.yml'` and register the hash in a *local* config, not an arbitrary chat parameter.
5. If parameters include credentials, use a separate reviewed secret-injection policy; do not pass them as nonsecret job parameters.
6. Before live execution, test: `python3 -m unittest integrations/bruno/runtime/test_bruno_runtime.py -v`.

## Local configuration example — template, NOT active

Save as a local, ignored `~/.config/ffos/bruno-operations.json` after replacing the two placeholders:

```json
{
  "collection_root": "/Users/linusfast/Documents/bruno/Central API Ledger",
  "operations": {
    "kolada.municipality.lookup": {
      "request": "REPLACE_WITH_REVIEWED_REQUEST_FILE.yml",
      "sha256": "REPLACE_WITH_ACTUAL_64_CHARACTER_SHA256",
      "environment": "Development",
      "allowed_parameters": {
        "municipality_id": "[0-9]{4}"
      }
    }
  }
}
```

Local job example (nonsecret parameters):

```json
{
  "job_id": "ffos-kolada-0380-001",
  "operation_id": "kolada.municipality.lookup",
  "parameters": {
    "municipality_id": "0380"
  }
}
```

After placing this job in a local JSON file:

```bash
python3 integrations/bruno/runtime/bruno_runtime.py \
  --config ~/.config/ffos/bruno-operations.json \
  --job /path/to/local-job.json
```

Add `--execute` only after verifying request contents, parameter schema and authorization. Bruno CLI writes a private reporter under `~/.local/share/ffos/bruno-runs/<job_id>/`.

**Important:** The Bruno JSON report is not automatically treated as a validated data payload. Its response-body schema must be observed in a live authorized local execution before a separate adapter can pass it into R. Do not infer that an HTTP 200 means complete dataset coverage.

## Integration boundaries

- ChatGPT → FFOS: **missing deployed ChatGPT-facing tool/MCP endpoint and human-authorized runtime connection**. A GitHub branch is not a remote execution binding.
- FFOS → Bruno: allowlisted runner **implemented in this branch**, local live binding **pending**.
- Bruno → R: reporter handoff design **specified; field mapping against actual report pending**.
- R → QGIS: underlying GeoPackage and QGIS local basic interoperability previously verified; **automated invocation/receipts not tested end-to-end**.
- QGIS → Vercel: optional publishing pipeline **not implemented**.
- Domain source data remains canonical to FF-Spatial registry/gateway.

Keep permissions and QA separate: no arbitrary code execution through the existing QGIS bridge; all new execution is locally bounded and reviewable.

## OpenCollection YAML discovery (2026-11-16)

The Director has located a YAML-based collection rooted at `/Users/linusfast/Documents/bruno/Central API Ledger`, with `opencollection.yml` and folders such as `02 - Statistik & samhällsdata`. Existing `.bru`-only adapters were incompatible; YAML support is now staged in this feature branch. To enumerate *filenames only*, run:

```bash
cd "$HOME/Documents/bruno/Central API Ledger"
find . -type f -name '*.yml' ! -path './environments/*' -print | head -70
bru run -h | head -80
```

Do **not** paste request/environment YAML contents: those may contain live tokens or personally identifying data. Review safely on Mac before hash approval. No live API execution or export is claimed.
