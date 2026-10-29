# Release and rollback — HF-WP10

Release classification is **CANDIDATE / NOT CANONICALLY ACCEPTED**. This work does not create a release tag, license, production deployment, plugin registry entry or a Piusite registration. Those require a human Director decision and applicable HCC/CDX clearance.

## Release evidence required

- Review exact candidate commit and passing repository CI, including PostgreSQL.
- Verify real OAuth authorization-code/PKCE, issuer/audience/scopes, revocation and project isolation.
- Verify installed GitHub App, trusted CI workflow digests, feature-only writes and read-back.
- Bind current Director and CDX services; retain genuine signed acceptance and SPETL evidence.
- Verify two-WP live sandbox repair/acceptance/automatic progression, durable process restart and acknowledged cancellation.
- Register/install the custom plugin; retrieve the same run in a fresh ChatGPT conversation.
- Approve retention/privacy/CI spending envelope, license and any constitutional release classification.

## Rollback

Stop new Director dispatches, cancel/settle active work and confirm the boundary. Stop the worker before changing the application version. Back up PostgreSQL; retain audit/evidence/decision/operation records. Roll the application image back to the previous reviewed commit while preserving the database. This candidate has one initial additive migration; there is no destructive down migration. Restore from a protected backup only under a deliberate operator decision, never to erase failed evidence.

Feature branches and draft PRs remain review artifacts. Do not delete them or rewrite their history as automatic cleanup. Reverting/merging main or releasing a tag requires a separate explicit authorization. The source build is delivered as an isolated candidate branch with review links recorded in the execution report.

## References

- Motherpher (2026) _FFOS Director_. Available at: https://github.com/Motherpher/form-flode/blob/1a5962b42a6f033bc932ab084a8808607cdf6266/17-ffos/director/README.md (Accessed: 28 October 2026).
