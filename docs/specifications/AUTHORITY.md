# FFOS Authority Boundary — Phase 0

## Purpose

WP-02 establishes the first private human authority boundary for the FFOS control plane. It does not implement Pius, FIELD or any other protocol runtime. It establishes authenticated identity and the initial Director authority class that later governed workflows can reference.

## Initial authority class

`DIRECTOR`

The Director is the sole Phase 0 authenticated authority. Later work may add collaborator, reviewer, operator and service identities, but none are active in this phase.

## Authentication model

Phase 0 uses a temporary single-Director credential model with signed sessions:

- credentials exist only as encrypted deployment environment variables;
- no password or session secret is committed to GitHub;
- sessions are HMAC-signed;
- session cookies are HttpOnly, SameSite=Strict and Secure in production;
- session lifetime is 12 hours;
- protected routes fail closed when authentication is absent, invalid, expired or unconfigured;
- `/login` exposes no operational state.

Required environment variables:

- `FFOS_DIRECTOR_USER`
- `FFOS_DIRECTOR_PASSWORD`
- `FFOS_SESSION_SECRET`

`FFOS_SESSION_SECRET` should be a high-entropy random secret and must not be reused as the Director password.

## Authorization boundary

Authentication proves the active identity is the Phase 0 Director. It does not itself grant protocol-specific waiver or override rights. Those rights must be implemented by the relevant future workflow and recorded in the registry.

## Migration rule

Before FFOS becomes multi-user, the temporary credential mechanism must be replaced by an external identity provider with explicit role-based authorization. The `DIRECTOR` authority semantic must remain stable across that migration.

## Acceptance test

1. Anonymous access to a protected FFOS route redirects to `/login`.
2. Invalid credentials are denied.
3. Valid Director credentials establish a signed session.
4. Tampered or expired sessions are denied.
5. Logout destroys the session.
6. Missing deployment auth variables fail closed.
7. No secret values exist in repository history.
