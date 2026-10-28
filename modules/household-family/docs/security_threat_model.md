# Security and verification limits

## Trust boundaries

OAuth establishes a subject; a server-side subject/project binding restricts visibility. Each HTTP request verifies signature, issuer, audience, required claims and expiration, then performs live introspection. Scope checks also run inside every tool handler. Durable workers use an explicit external Director delegation rather than persisting a user's bearer token. Director revocation, subject removal, project disablement, changed policy hash or expired mandate stops further effects. Expiration of a submitting chat token alone does not silently cancel a separately delegated durable job; revoke that delegation at Director or use `stop_run`.

Director and CDX signing private keys must remain outside Household. Household only verifies their public keys. The GitHub App private key is a server-side secret; reduced installation tokens are minted for the exact configured repository and access level. Installation/default-branch identity is checked, requests fail on expiry/revocation/rate limits, and redirects are refused. No PAT, user password or session cookie is copied from the existing FFOS shell (OpenAI, 2026; GitHub, 2026a).

## Enforced controls

| Threat                                    | Implemented control                                                                                                          | Remaining operator responsibility                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Prompt injection in issues/files/logs     | No task prose interpreted as policy; fixed deterministic evaluator; signed typed contracts only                              | Review registered recipes and acceptance criteria                          |
| Unauthorized code path or workflow change | Traversal/symlink/submodule rejection, path/action allowlists, sensitive-path deny rules, byte/file limits, pinned CI digest | Approve narrow application paths; avoid blanket source roots               |
| Self-acceptance                           | External signed decision bound to exact scope/commit/evidence; independent acceptance recheck                                | Protect Director key and substantive human gates                           |
| CDX/authority unavailable                 | Fail closed; fresh signed pinned receipts before effects                                                                     | Supply genuine canonical CDX enforcement and SPETL retention               |
| Duplicate or uncertain GitHub writes      | Transactional operation intent, deterministic branch/recipe IDs, non-force updates and read-back reconciliation              | Resolve conflicting externally edited/closed branches or PRs               |
| Crash or concurrent replicas              | Database locks, version guards, unique run revision, fenced expiring leases, durable queue/outbox                            | PostgreSQL backups, worker supervision, resource limits                    |
| Cancellation race                         | Request/settling/confirmed boundary; every new effect rechecks stop and authority                                            | Wait for `STOPPED` before treating cancellation as complete                |
| Invalid/replayed webhook                  | HMAC SHA-256 constant-time comparison; unique delivery/body hash; hints cannot create acceptance                             | Keep webhook secret private and rotate on compromise                       |
| Evidence tamper                           | Append-only triggers and per-project hash chain                                                                              | Restrict database owner access; backups and independent evidence retention |
| Unbounded repair/resource use             | Three maximum registered repairs; time budget; bounded HTTP/child-process output/time; transport retry dead letters          | Configure CI spending caps and existing-capacity approval                  |
| Host/origin confusion                     | Host and Origin checks, HTTPS requirement in production, OAuth audience binding                                              | Trusted reverse proxy, TLS, DNS, rate limiting and request limits          |

The Verifier runs a new Node process with an empty credential environment and fixed trusted code. This is process/context separation, not a hostile-code VM. Repository code never executes there. GitHub Actions provides independent test execution; raw run/job/artifact observations and their digests are retained. A green workflow is insufficient without every WP criterion and current policy scope passing.

Secrets are absent from committed configuration; `deploy-secrets/`, `.env`, private-key files and runtime databases are ignored. Do not put secrets in approved repository paths, recipes, criterion text or task artifacts. Observation evidence may contain private repository content by design and must remain within the same project authorization/retention envelope. This version provides project-level access and no third-party publication endpoint.

## Known operational limits

- The service never dispatches paid model APIs or workflow-dispatch operations. Commits/PRs can trigger existing CI. Mutation is denied until the project and signed Director policy explicitly approve that existing CI capacity; actual GitHub spending controls remain external.
- PostgreSQL transaction changes are globally serialized. This is intentionally low-throughput. Remote write correctness depends on exclusive ownership of Household feature branches; another identity racing a non-force GitHub ref write can produce a held conflict. There is no cross-provider atomic transaction.
- Worker shutdown lets the current bounded step settle. Hard process loss relies on lease expiry and external-state reconciliation.
- Public TLS, real IdP enrollment, current Director/CDX integration, host hardening, retention policy and a live ChatGPT reconnect are not established by fixtures.

## References

- OpenAI (2026) _Authentication_. Available at: https://developers.openai.com/plugins/build/auth (Accessed: 28 October 2026).
- GitHub (2026a) _Authenticating as a GitHub App installation_. Available at: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation (Accessed: 28 October 2026).
- GitHub (2026b) _Validating webhook deliveries_. Available at: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries (Accessed: 28 October 2026).
