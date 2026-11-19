# ProjectHub production activation — PROD-WP03–05 design

**Process:** FFOS-DEVOPS-PH-PROD-001  
**Status:** DESIGN BASELINE  
**Frozen source:** `d1bbf1545dea19f426ad40b973bd69bb126f1c40`

## PROD-WP03 — persistence and migration

### Runtime pattern

Read path:
```
authenticated Director/project principal
  -> local ProjectHub authorization
  -> restricted backend LOGIN
  -> BEGIN READ ONLY
  -> SET LOCAL ROLE ffos_projecthub_reader
  -> verify current_user
  -> set_config('ffos.project_scope', projectId, true)
  -> project-scoped reads
  -> COMMIT/ROLLBACK
```

Write candidate:
```
authenticated principal + mandate
  -> local ProjectHub authorization
  -> CDX A3 pinned decision + pre-effect receipt
  -> restricted backend writer LOGIN
  -> BEGIN
  -> SET LOCAL ROLE ffos_projecthub_runtime
  -> verify current_user
  -> set_config('ffos.project_scope', projectId, true)
  -> append-only ProjectHub UoW:
       state/version + audit + idempotency
  -> COMMIT/ROLLBACK
  -> post-effect/reconciliation receipt
```

The production writer LOGIN must be separate from the read-only LOGIN, server-only, NOINHERIT/NOBYPASSRLS, and granted only the ability to SET ROLE to `ffos_projecthub_runtime`. No password is stored in Git.

### Recovery

- every canonical command has an idempotency key;
- version discontinuity/conflict rejects the command;
- transaction rollback leaves no partial project state;
- failed/blocked effect attempts require durable evidence outside the rolled-back canonical UoW;
- append-only history is recovered by later compensating version, not destructive UPDATE/DELETE.

## PROD-WP04 — authentication and access

### Application ingress

- Next.js Director session remains the currently admitted human ingress.
- Project reads require session verification before selecting database scope.
- Project writes require the same session plus explicit authority/mandate refs and Idempotency-Key.
- Multi-user role grants remain modelled but broad multi-user production admission is not asserted by this slice.
- Portfolio reads remain disabled until a separately authorized portfolio model exists.

### Database separation

- `FFOS_PROJECTHUB_READ_DATABASE_URL`: reader-only backend login.
- future `FFOS_PROJECTHUB_WRITE_DATABASE_URL`: writer-only backend login.
- never use Supabase postgres/admin or browser-visible keys.
- write toggle remains false until the write E2E/CDX canary is independently accepted.
- PH-D4 stays hard denied in application and database constraints.

## PROD-WP05 — operations, observability and provider boundary

### Health/readiness states

Expose state as factual composition, not one generic "live":
- source merged/tested;
- DB schema deployed;
- reader identity verified;
- authenticated HTTP read verified;
- durable app host deployed;
- writer identity admitted;
- A3 write runtime accepted;
- A4 provider effect admitted.

### Evidence

- CDX policy decision emits SPETL with policy version/digest and attempted effect.
- ProjectHub audit records principal, authority, mandate, command, correlation and causation refs.
- production write acceptance must separately prove:
  - permissive A3;
  - restrictive/UNAVAILABLE fail closed;
  - transaction rollback;
  - idempotent replay;
  - cross-project denial;
  - no PH-D4;
  - commit/reconciliation evidence.

### External surfaces

Miro/Figma/Drive/GitHub/funding systems remain linked surfaces only unless a provider-specific contract, credential, action authority and receipt are separately admitted. ProjectHub production activation must not turn a LinkedArtifact into a live write integration.

## Design exit

PROD-WP03–05 are implementable with the existing FFOS architecture. The next build slice is a scoped writer transaction primitive and production write acceptance harness; it must remain disabled in normal runtime until its L3 acceptance gate passes.
