# ProjectHub live writer-principal receipt — 2026-11-20

**Process:** FFOS-DEVOPS-PH-PROD-001  
**Canonical issue:** Motherpher/FFOS#102  
**Target:** FF Estate Supabase `tambsukbyoldkrxnmvpa`  
**Migration:** `0011_projecthub_writer_login_principal.sql`  
**Result:** APPLIED / VERIFIED / NOT ACTIVATED

## Source evidence

- Scoped writer foundation: PR #119, merge `4564d4b13d8fee5be9b0f17e4b98b078d8721ee6`
- Source-gated writer runtime binding: PR #120, merge `f0f0110e6a9889de96f6d5ccc95408e5fe48447a`
- Migration source blob on merged main: `894a6d389792df602e0ee3d7e34167b3bb5b0081`
- Exact candidate ProjectHub DevOps: PASS
- Exact candidate Next.js build + authenticated synthetic HTTP: PASS

## Live migration result

Supabase migration `projecthub_writer_login_principal` returned success.

The resulting identity is:

| Property | Live value |
|---|---|
| role | `ffos_projecthub_writer_login` |
| LOGIN | **false** |
| INHERIT | **false** |
| BYPASSRLS | **false** |
| granted role | `ffos_projecthub_runtime` |
| membership inherit | **false** |
| membership SET | **true** |
| direct ProjectHub SELECT | **false** |
| direct ProjectHub INSERT | **false** |

Supabase post-change checks:
- security advisor: **0 lints**
- health advisor: **0 lints**

## Security interpretation

This is a **prepared principal**, not a production writer.

Because `rolcanlogin=false`:
- no application, GitHub Action or external process can authenticate as the writer;
- there is no writer password or DSN to leak;
- the source-controlled ProjectHub write admission remains `NOT_ACCEPTED`;
- `FFOS_PROJECTHUB_WRITES_ENABLED=true` cannot activate writes by itself.

Even after a later LOGIN credential is admitted, the identity itself still has no direct ProjectHub table privileges. The intended path requires explicit `SET LOCAL ROLE ffos_projecthub_runtime` plus transaction-local project scope.

## Next protected gate

The next test is the rollback-only protected writer canary. It requires all of:

1. a strong writer credential generated and provisioned through a secure operator channel;
2. writer role changed from NOLOGIN to LOGIN without changing NOINHERIT/NOBYPASSRLS;
3. session-pooler DSN stored only as protected environment secret `FFOS_PROJECTHUB_WRITE_DATABASE_URL`;
4. GitHub environment `projecthub-write-canary`;
5. Human Director/operator approval for the canary execution;
6. canary PASS proving login identity, no direct table access, scoped role/RLS, pinned CDX A3, rollback and zero residue.

No available authorized connector in this execution can create or populate that protected environment secret or approve the deployment gate. Those controls remain intact rather than being bypassed.

## State

**LIVE DATABASE PRINCIPAL PREPARED / NOLOGIN / WRITE ADMISSION NOT ACCEPTED / NOT DEPLOYED / NOT PRODUCTION-ACCEPTED**
