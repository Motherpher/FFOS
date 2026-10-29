# AMA M7 Gate Separation — Architecture vs Host Operational Admission

**Effective clarification:** 2026-10-29. **Scope:** domain-agnostic AMA only.

## Architecture identity

AMA is the reusable Agent Master Architecture, not an agent, agent executor, operating principal, host policy engine or deployable instance. Construction and deployment of agents occur outside the AMA architecture baseline.

## Three distinct gates

| Gate | Owns | Required evidence | Does NOT establish |
| --- | --- | --- | --- |
| **M7-A — Architecture baseline acceptance** | Universal AMA schemas, interfaces, compatibility, portability, conformance and independently reviewed reference package | Passing exact-head architecture CI; versioned manifest; complete v1/v0.2 compatibility evidence; independent human technical review; architecture adoption decision | Any agent runtime registration, deployment, external-policy approval or effect authorization |
| **F8.7 — Host-specific CDX runtime binding** | Optional FFOS consumer adapter to externally governed CDX release and its independent security/custody authority | Published immutable CDX release, independently verified runtime policy/identity/revocation and custody, host authorization | Completeness or correctness of AMA's universal architecture |
| **M7-O — Operational conformance model** | Generic reusable reference criteria for admitting an AMA-built *agent instance* in a particular host | Vendor/host-neutral criteria for runtime gates, telemetry, recovery, custody, rollback, governance and independent instance acceptance; synthetic demonstration of criteria | Actual deployment of AMA or operational admission of an instance without host evidence |

M7-E remains a **synthetic engineering reference**, not a deployed agent. Host-specific F8.7 and actual agent-instance M7-O acceptance **must not block M7-A** when the architecture provides correct optional host bindings and non-authorizing generic schemas.

## Prior historical claims

`docs/roadmap/AMA-F8-7-EXECUTION-RECORD-2026-10-29.md` and older M7-E reports are historical FFOS integration snapshots and may contain now-superseded CDX WP05/WP07 descriptions. Do not use them as present-day normative AMA acceptance gates.

The current upstream CDX state has WP05 closed and a sovereign `RELEASE_1_0_0` decision recorded, but `publication_authorized=false` and `release_state=PRE_RELEASE`; that does **not** establish F8.7 live runtime binding. FFOS still reports `PINNED_COMMIT`, not independently verified `PINNED_RELEASE`.

## M7-A disposition and review

**Candidate:** `AMA 0.2.0-candidate`.  
**Engineering:** CI reference passing on earlier observed commits; final PR-head verification must recur after this change.  
**Human review:** User confirmed review of architecture direction; this is not a separate independent technical attestation.  
**Independent technical review:** Pending.  
**Stable architecture adoption:** Pending; `architecture_accepted=false`.

A reviewer must inspect schema dialect/version compatibility, reference digest pinning, scope/effect nonamplification, optional-module isolation, host substitution, fail-closed semantics and non-self-certification. Only a reviewed stable architecture baseline may be adopted.

## M7-O reference criteria (architecture artifact, not operation)

1. Typed instance manifest and externally approved mandate/authority.
2. Independently validated host policy binding, identity, scopes and revocation.
3. Durable bounded workflow execution, idempotency and unknown-effect reconciliation.
4. Independently collected evidence/custody and adversarial evaluation.
5. Operational telemetry, incident/rollback and recovery controls.
6. Independent human/host acceptance bound to exact version and instance.
7. Deployment authorization issued only by host authority; **never by AMA**.

The AMA architecture may specify and test these portable criteria using synthetic profiles without obtaining a live CDX F8.7 binding or deploying any agent.

## Explicit prohibitions

No changes to CDX release state, FFOS anchor, agent registry, Household, MESSI, production credentials, deployment or estate security policy are authorized through this architecture clarification.
