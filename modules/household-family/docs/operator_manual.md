# Operator manual

## Prepare a bounded installation

1. Approve the hosting location, data retention/privacy boundary and CI capacity. Production release requires the human Director's decision and applicable HCC/CDX clearance. No release decision is fabricated by this build.
2. Create/install a GitHub App on only the selected repositories. Initial observation requires Metadata/Contents/Actions/Checks/Pull requests read. Bounded mutation additionally requires Contents and Pull requests write. Do not grant Administration, Secrets, Workflows, deployment or organization-wide blanket permissions. Protect the actual default branch and require the selected CI workflow. The inspected FFOS main branch reports unprotected; the adapter refuses mutation until actual protection is enabled.
3. Configure an external OAuth 2.1 authorization server. Use authorization code + PKCE S256, exact resource/audience, stable clients and supported callback registration. Issue JWT access tokens with `household:read`; admit execute/control scopes separately. Configure live token introspection and server-side subject/project bindings.
4. Configure current signed Director and CDX endpoints as described in `director_contract.md`. Use distinct real production signing identities. Copy the verified FFOS CDX anchor without changing its pin; reconcile any subsequent change explicitly.
5. Provision PostgreSQL and a durable supervised host. Keep private keys/tokens in the host secret manager or protected read-only files; never paste them into a chat or Git commit.

The build inspected the existing Vercel FFOS project without decrypting secrets. It currently contains the Phase-0 Director login/session variables, not the new MCP/OAuth/GitHub App/Director/CDX configuration. No existing deployment, permissions or credentials were modified. The candidate commit received a failing Vercel check linking to account-deployment-blocked guidance; no matching deployment record was returned. The precise account reason remains unverified.

## Deploy the supplied processes

From `modules/household-family`, copy `.env.example` to a local `.env` and fill the operator-supplied values. Place the referenced key/anchor files in `deploy-secrets/` with permissions readable only by the service account. Match `HF_DATABASE_URL` to the configured PostgreSQL password. The Compose service exposes the application on loopback; terminate stable HTTPS in a trusted reverse proxy.

```bash
docker compose build
docker compose up -d postgres
docker compose run --rm mcp npm run cli -- migrate
docker compose run --rm mcp npm run cli -- register-project /app/config/ff-spatial-observe.project.json
docker compose up -d mcp worker
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS https://YOUR-VERIFIED-HOST/.well-known/oauth-protected-resource
```

Before registering the project, replace its placeholder installation ID and deliberately enable OBSERVE. The example never grants branch/PR execution. The supplied image runs as the unprivileged `node` user with read-only filesystem/capability restrictions in Compose. For a restricted production DB role, apply migrations with an owner role first, set `HF_MIGRATE_ON_START=false`, then grant application table access while denying UPDATE/DELETE on evidence, decisions and events. Preserve schema ownership outside the application identity.

These are operational commands, not a claim that Docker was run in the build environment. Verify image build/start, database persistence and HTTPS before progressing HF-WP08.

## Staged admission

**OBSERVE:** Connect the plugin using the README instructions. Verify capabilities, status and allowed-file patrol on the real repository, with accurate source timestamps. Invalid/expired/revoked tokens and a different project must be denied.

**Bounded sandbox:** Use an explicitly approved artificial repository, narrow paths, a pinned trusted workflow and current dispatched WPs. Approve existing CI capacity and set `EXECUTE_BOUNDED` in both project and signed Director policy. Verify one branch/PR write, a failed criterion, a registered repair, separate Verifier evidence, a genuine Director decision and automatic dependency progression. No main push, merge or deployment is supported.

**Durable operation:** Restart the worker while a run is leased and test external-write reconciliation. Restart MCP and connect from a fresh ChatGPT conversation. Retrieve the same run/evidence; do not infer persistence merely from one conversation.

**FF-Spatial:** The inspected sourcing register is still `PLANNED`. Do not choose a repair by interpreting a planned package as current authorization. Director must identify the pilot WP/revision, source/acceptance bindings, permitted paths and current mandate, and resolve the handoff's P1–P5 mismatch.

## Diagnose and recover

| Observed state                | Action                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| `QUEUED`                      | Check independent worker process and database connection                               |
| `VERIFYING` with INCONCLUSIVE | Inspect exact-commit CI run and raw observations; pending CI is never PASS             |
| `READY_FOR_DIRECTOR`          | Review evidence bundle and provide the external signed decision                        |
| `STALE_POLICY_AFTER_LEASE`    | Obtain a correct new Director revision; do not change the stored run to fake freshness |
| `CDX_*` / `HCC_*` / cost gate | Resolve the genuine authority/service/approval condition; no bypass flag exists        |
| `BLOCKED` / `HOLD_HUMAN`      | Repair the cause within authority, then call `resume_run`; the server revalidates      |
| `CANCEL_REQUESTED`            | Wait for the in-flight step/lease to settle                                            |
| `STOPPED`                     | Terminal for this revision; Director must dispatch a new revision to restart work      |
| Queue/outbox `DEAD`           | Inspect preserved error/audit; operator intervention required                          |

Repeat-safe HTTP disconnects retry with exponential backoff three times, then preserve a blocked/dead-letter state. Progression outbox failures retry eight times with capped backoff. Repair failures use the separate WP/project/policy recipe ceiling. Normal completion/repair/next-WP transitions never need another conversational proceed prompt.

To inspect a legacy canonical manifest without changing authority:

```bash
npm run cli -- inspect-manifest /path/to/original/wp-manifest.json
```

Do not alter historical audit/evidence to make a run appear successful. For a dead progression outbox, inspect the signed decision and current Director eligibility, then use an authorized database maintenance operation to requeue the existing outbox row and append an operator audit event. This version intentionally exposes no blanket MCP administration endpoint.

## Backup and shutdown

Use PostgreSQL backups plus restore drills. Evidence/decisions/events are part of the same durable database, not local chat memory. Monitor stale leases, repair counts, dead letters, run lead times and audit-chain validity through status/pulse. Maintain private GitHub/CI artifact retention sufficient for acceptance review.

For shutdown, disable new Director eligibility, request stop on active runs, confirm `STOPPED`, then stop the worker/MCP processes. `docker compose down` retains the named data volume; never use `down -v` as routine rollback. Follow `release.md` for schema-preserving rollback.

## References

- OpenAI (2026) _Add custom MCP server_. Available at: https://developers.openai.com/api/docs/guides/custom-mcp-server (Accessed: 28 October 2026).
- GitHub (2026) _Choosing permissions for a GitHub App_. Available at: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app (Accessed: 28 October 2026).
