# Household Family 2.0 — implementation candidate

One authenticated MCP plugin and an independent durable worker for bounded GitHub repository work. Janitor observes; Handyman applies registered J1 recipes to isolated feature branches; Verifier checks immutable repository/CI observations in a fresh process. Director remains external and signs every acceptance. This package does not provide arbitrary shell execution, autonomous priority setting, automatic merge, deployment, publication or constitutional release authority.

**Current delivery:** runnable code and tested contract integration. **Not yet deployed or registered in ChatGPT.** Test Director/CDX services are explicitly artificial; their signatures are not genuine governance clearance. Read [the execution report](docs/work_chat_execution_report.md) for current evidence and gates.

## Run the verified local demonstration

Requires Node 24 and npm. From this directory:

```bash
npm ci --ignore-scripts
npm run check
npm run demo
```

The demonstration uses the production GitHub HTTP adapter, signed Director/CDX adapter contracts and the separate Verifier process against isolated test services. It creates two dependent test WPs, injects a failed criterion, performs one registered repair, independently verifies it, receives signed **fixture** decisions, records acceptance and schedules the next WP. It writes `docs/evidence/sandbox-demo.json`. Recovery, cancellation, OAuth and negative cases run in the acceptance/security suites. Nothing is published or mutated in a live repository by the demo.

## Production operation

Production uses PostgreSQL, a separately supervised worker, a GitHub App, an external OAuth 2.1 authorization server with JWT/JWKS and live token introspection, a current signed Director feed and a pinned CDX policy decision service. SQLite/WAL is an embedded test/single-host option; do not use it across distributed hosts.

```bash
npm run build
npm run schemas
HF_DATABASE_URL='your-operator-supplied-database-url' npm run cli -- migrate
npm run cli -- register-project config/ff-spatial-observe.project.json
npm start
# Start in a second supervised process with the same database and server-side configuration:
npm run worker
```

Supply environment variables using the host's secret manager; `.env.example` contains placeholders only. The two last commands intentionally fail closed when required identity/governance services are missing. `compose.yaml` and `Dockerfile` define a PostgreSQL + MCP + worker deployment. Container execution and public HTTPS deployment remain separate verification gates.

The example project is disabled and OBSERVE only. Its installation ID is a placeholder. A human must install the GitHub App, enter the real installation ID and enable observation. Mutation requires a new explicit configuration and current signed Director permission; enabling a project alone does not grant execution authority.

## Tools and commands

| User phrase               | MCP tool                                                            | Effect                                                   |
| ------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| `ffos household status`   | `get_household_status`                                              | Durable states and blockers                              |
| `ffos household pulse`    | `pulse_household`                                                   | Counts and queue observations                            |
| `ffos household patrol`   | `patrol_repository`                                                 | Read-only allowed-file inspection                        |
| `ffos household run`      | `get_eligible_work_package`, then `execute_authorized_work_package` | Queue current authorized WP; return a run ID             |
| `ffos household evidence` | `get_run_evidence`                                                  | Criteria, raw observations, operation receipts and audit |
| `ffos household resume`   | `resume_run`                                                        | Revalidate and resume a held/interrupted revision        |
| `ffos household stop`     | `stop_run`                                                          | Request cancellation; `STOPPED` confirms the boundary    |

`list_projects` and `get_agent_capabilities` expose additional read-only metadata. Command phrases are aliases to request the tool, not claims of ChatGPT registration. A queued run is not completion. Passing tests is not Director acceptance. Director acceptance is not a merge or release.

## Connect to ChatGPT after deployment

1. Verify your stable HTTPS `/mcp` endpoint, OAuth metadata, identity, scopes and runtime health. Configure authorization-code + PKCE (`S256`), resource/audience binding and the exact callback shown by ChatGPT. Register a stable OAuth client or an officially supported client registration method.
2. In ChatGPT Plugins choose **+ → Add custom MCP server**. Name it **Household Family**, enter the verified HTTPS `/mcp` URL and configure OAuth. Review the provider permission/security consent and create the plugin.
3. Install it from personal/workspace plugins. In a new Work conversation, select `@Household Family` and call `get_agent_capabilities`, `list_projects`, `get_household_status` and a permitted `patrol_repository`.
4. Keep `household:execute` and `household:control` off until the bounded sandbox permission envelope is approved. Then test queue, repair, evidence, external Director acceptance, stop and resume. A second conversation must retrieve the same persistent run before AT25 is marked live-verified.

For a packaged manifest run `npm run configure-plugin -- https://YOUR-VERIFIED-HOST/mcp`; this writes `plugin/mcp.json` beside `plugin/plugin.json`. The committed template uses `.invalid` intentionally. Generating metadata does not register a plugin. Secure MCP Tunnel is another officially supported private connection path, but does not itself supply durable hosting or identity (OpenAI, 2026a; 2026b).

## Source and release boundaries

Canonical J0 is ephemeral cleanup; J1 is deterministic registered repair; J2 is an interpretive/constitutional stop. AMA remains `AMBIGUOUS_SOURCE_AMA` and grants no authority. September orders marked fulfilled/closed do not authorize this new runtime. Pius is still an external reserved domain in FFOS; this module does not install an old Pius runtime (Motherpher, 2026a; 2026b).

See [source lineage](docs/source_lineage.md), [protocol reconciliation](docs/protocol_reconciliation.md), [operator manual](docs/operator_manual.md), [Director integration](docs/director_contract.md), [security model](docs/security_threat_model.md), [decision register](docs/decision_register.md) and [release/rollback](docs/release.md). License selection and release acceptance remain human decisions.

## References

- Motherpher (2026a) _FFOS Household Family_, repository source pinned in `docs/source_lineage.json`. Available at: https://github.com/Motherpher/form-flode/blob/1a5962b42a6f033bc932ab084a8808607cdf6266/17-ffos/household/README.md (Accessed: 28 October 2026).
- Motherpher (2026b) _FFOS Architecture Baseline_. Available at: https://github.com/Motherpher/FFOS/blob/3a93eb3d7a5195232acc850c7d301bf901014306/docs/architecture/ARCHITECTURE.md (Accessed: 28 October 2026).
- OpenAI (2026a) _Add custom MCP server_. Available at: https://developers.openai.com/api/docs/guides/custom-mcp-server (Accessed: 28 October 2026).
- OpenAI (2026b) _Authentication_. Available at: https://developers.openai.com/plugins/build/auth (Accessed: 28 October 2026).
