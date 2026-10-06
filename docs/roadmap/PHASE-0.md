# FFOS Phase 0 — Operational Spine

## Objective

Establish the minimum viable operating spine before broad domain integration.

## Work packages

### WP-00 — Repository and architecture
Status: BASELINE COMPLETE

- initialize canonical repository
- establish architecture baseline
- establish ADR discipline
- define control-plane boundary

### WP-01 — Vercel application shell
Status: CANONICAL ORG DEPLOYED / PRODUCTION READY

- Next.js application shell created under `apps/web`
- initial Dispatch Counter screen created
- navigation rooms created for Work, FFC, Conducellence, UDL, Pius, Knowledge and System
- Pius explicitly reserved / not implemented
- UDL represented as external destination / connector pending
- responsive visual baseline created
- canonical source: `Motherpher/FFOS`
- Vercel project: `ffos`
- canonical repository is linked directly to Vercel; the former `Hybrismannen/FFOSm` mirror is no longer the deployment path
- production deployment from `main` is READY

### WP-02 — Authentication and authority
Status: DEPLOYED / ACCESS GATE TESTED / DIRECTOR LOGIN ACCEPTANCE PENDING

- deny-by-default operations boundary implemented
- `DIRECTOR` established as the sole Phase 0 authority class
- signed HMAC session with 12-hour expiry implemented
- HttpOnly, SameSite=Strict session cookie; Secure in production
- login and logout routes implemented
- public login route separated from protected operational layout
- credentials and signing secret are deployment environment variables only
- missing authentication configuration fails closed
- `FFOS_DIRECTOR_USER`, `FFOS_DIRECTOR_PASSWORD` and `FFOS_SESSION_SECRET` configured in Vercel
- production redeployed after environment activation
- unauthenticated `/work` verified to redirect to `/login?next=/work`
- login surface verified reachable in production
- successful Director credential login remains a manual acceptance step because the password is intentionally not available to the connector
- multi-user identity-provider migration explicitly deferred until collaboration is introduced

### WP-03 — Core object model
Status: BASELINE COMPLETE

- canonical hierarchy locked: Programme → Project → Mission → Work Package → Run → Dispatch → Output → Decision
- shared base object fields defined
- lifecycle vocabularies defined for work, run, dispatch and decision objects
- provenance reference contract defined
- append-only state-transition event shape defined for WP-04
- Director authority transitions bounded without implementing Pius runtime semantics
- generic dispatch gating supports PASS / PASS_WITH_WARNING / explicit Director waiver
- Pius, FIELD, UDL and Conducellence boundaries explicitly preserved
- TypeScript core model created at `packages/core-model/src/index.ts`
- specification created at `docs/specifications/OBJECT-MODEL.md`

### WP-04 — Registry
Status: SCHEMA + STORE CONTRACT COMPLETE / LIVE DATABASE BINDING PENDING

- append-only PostgreSQL schema created
- immutable object-version ledger created
- immutable state-transition event ledger created
- external destination receipt ledger created
- current-object and current-state views derived from historical rows
- update/delete mutation triggers reject history rewriting
- registry store interface and transition-continuity invariants implemented
- remaining step: bind a persistent PostgreSQL instance and deployment credentials, then connect the application

### WP-05 — Dispatch Counter
Status: STRUCTURAL MOCK CREATED / LIVE DATA NOT STARTED

- active traffic
- holds
- failures
- ready dispatches
- completed dispatches

### WP-06 — Director Console
Status: NOT STARTED

- approval
- rejection
- return for rework
- hold
- governed override/waiver where applicable

### WP-07 — UDL connector
Status: CONTRACT STAGED / IMPLEMENTATION NOT STARTED

- `UDL_READY` route
- Director approval gate
- external deployment confirmation
- version/URL registration

### WP-08 — Conducellence room
Status: STRUCTURAL ROOM CREATED / CANONICAL RELEASE PENDING

- first-class external domain surface
- canonical source remains the Conducellence repository
- FFOS may surface Conducellence state but must not duplicate its canonical law, control, policy or evidence source
- FFOS runtime binding: NOT STARTED
- integration is gated by Conducellence release closure and an explicit versioned adapter contract

### WP-09 — FFC room
Status: STRUCTURAL ROOM CREATED

- assignment/project business surface
- later RAMx linkage

### WP-10 — Pius reserved room
Status: STRUCTURAL ROOM CREATED

- visible reserved state only
- no runtime implementation

## Phase 0 acceptance test

One real artifact must complete:

`Work → READY → UDL_READY → Director approval → UDL dispatch → confirmed result → registry CLOSED`

Phase 0 is not complete until this end-to-end flow works with a real artifact and preserved provenance.
