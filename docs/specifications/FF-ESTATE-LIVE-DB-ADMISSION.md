# FF Estate — real, read-only FFOS database admission

The existing FF Estate Supabase project `tambsukbyoldkrxnmvpa` has a live `ffos` schema with the RLS-protected four tables. PostgreSQL role `ffos_registry_writer` is **NOLOGIN**, deliberately not a credential. A separate `LOGIN` principal must first be created, granted membership with **INHERIT TRUE**, and its secret stored by an authorized operator in GitHub Actions environment **ffos-db-admission** (or a separately accepted FFOS server secret manager).

## GitHub manual acceptance

1. Have the database administrator provision a distinct LOGIN role with `NOBYPASSRLS`, `NOCREATEDB`, `NOCREATEROLE`, `NOSUPERUSER`, and membership in `ffos_registry_writer` with `INHERIT TRUE`; do not use `postgres`, `service_role` or Lovable Control Tower credentials.
2. Configure protected GitHub Actions environment `ffos-db-admission`. Add secret `FFOS_DATABASE_URL` (connection to **FF Estate** with TLS, not pasted into commits or chats). Add environment variable `FFOS_EXPECTED_LOGIN_ROLE` matching the dedicated role's username. Require trusted reviewers for manual runs where supported.
3. From Actions, manually run **FF Estate private DB connection admission (manual, read-only)**. This job uses `BEGIN READ ONLY`, tests project ref, effective DB principal and inherited private role, RLS, policies, revoked public access, SELECT/INSERT grants and absence of UPDATE/DELETE.
4. `PASS` proves only a private DB connection and access contract. It is **not** production FFOS run admission, Director authority, CDX/SPETL authorization or a permanently deployed worker. No data rows are written.
5. The security policy may prohibit GitHub-hosted remote database access; if so, run the same script in a trusted FFOS-controlled private runner with the same environment variables, instead of expanding the database network perimeter.

## Operational boundaries

- GitHub workflow has **only** `workflow_dispatch`: no pull request may access live database secrets.
- Never configure the secret as a repository-wide variable, never log it, and never grant permissions to `anon`, `authenticated`, `service_role`.
- Do not attach Control Tower (a read-only Digital Twin presentation UI) as the SQL writer.
- Avoid Vercel entirely.
- To execute an operational work order, an independently verified CDX/AMA/Director gate and a bound, supported FFOS server runtime remain mandatory.

**Status:** configured code and GitHub procedure. No login credentials generated; no secret has been installed; no manual runtime action or production write is claimed.
