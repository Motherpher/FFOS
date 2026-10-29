# F8 — Conductellence Security and Risk Integration for AMA

**Date:** 2026-10-29  
**Host:** FFOS, feature branch `feat/ama-foundation-20261028`  
**Constitutional source:** `Hybrismannen/Conductellence-` / `CDX-LAW-001` (adopted internal law 1.0.0)  
**Runtime source:** `RUNTIME-INTEGRATION/CDX-RUNTIME-001.json` (release-candidate 1.0.0)  
**Candidate status:** F8 consumer adapter engineering; no CDX constitutional amendment, no verified production binding.

## Authoritative source reconciliation

The source repository `GOVERNANCE/system-state.json` observed 29 October 2026 reports:

- constitutional state `ADOPTED`;
- core runtime `VERIFIED_REFERENCE_RUNTIME`;
- release `PRE_RELEASE`, enforcement `BOOTSTRAP`;
- estate integration `PENDING_RUNTIME_BINDINGS`;
- `Motherpher/FFOS` consumer binding `NOT_STARTED`, separate repository-level anchor `CDX_CI_MONITORED`;
- core release blocker `CDX-BLOCK-REPO-PROTECTION-001`;
- estate integration blocker `CDX-BLOCK-ESTATE-RUNTIME-001`;
- `WP07` release authorization `false`.

The FFOS `.cdx/anchor.json` remains `PINNED_COMMIT` at the historical SHA `7edbc47899af23b415114628469aca2970779ea1`, with runtime state `BOUND_PENDING_RUNTIME_INTEGRATION`. The CDX Estate Anchor Standard requires `PINNED_RELEASE` for consequential production enforcement. **Neither repository-CI verification nor mock policy tests may promote this to `VERIFIED_RUNTIME_BOUND`.**

The CDX 1.0 frozen core release boundary prohibits unapproved new law sections, authority classes or first-class systems. Accordingly, all candidate F8 engineering resides in FFOS's **consumer integration**; no upstream frozen-core changes were made.

## Seven-part implementation and source-based disposition

| F8 | Requirement and canonical evidence | Implemented candidate work | Remaining gate |
| --- | --- | --- | --- |
| 8.1 | 131 frozen sections, 69 reference controls, 62 review-governed; `CONTROL-CATALOGUE`/policy/Act | `integrations/cdx/f8/control-coverage.json` covers each section; captures exact control IDs, enforcement surface, audit vector count and SPETL requirements; independent CI audit | Independent catalogue attestation against released immutable policy |
| 8.2 | `CDX-RUNTIME-001`: identity, authority, mandate, revocation and current trusted facts | `CDXF8VerifiedAdapter` requires external released-policy source, trusted fact collector and independent signature/fact verifier; no model-supplied control flags | Bind real authenticated principal, mandate, revocation and policy services |
| 8.3 | Seven decisions `ALLOW`, `ALLOW_WITH_CONTROLS`, `REQUIRE_HUMAN`, `QUARANTINE`, `DENY`, `SECURITY_STOP`, `CONSTITUTIONAL_STOP` | Extended `AgentEffectGate` preserves all seven, refuses unverified permissible decisions, requires confirmed obligations and records restrictive outcomes distinctly. Consumer adapter evaluates complete mandatory controls per governing surface | Real signed policy decision/obligation adapter; all release-pinned |
| 8.4 | `SECURITY-TWIN` path- and history-aware authority reachability | Trusted, signed fact interface includes source identity and graph/history digests; second check before effect detects drift; E3 deterministically adds `EXTERNAL_EFFECT` controls | Real Security Twin graph and historical event feed; live revocation proof |
| 8.5 | SPETL 1.1, append-only ledger and separately verified custody | No permissive dispatch until independent custody adapter confirms correlated policy receipts; pre/post intent evidence required; independent read evidence sink; custody failure denies | Authenticated consumer custody, replay/reconciliation and real SPETL v1.1 event attestations |
| 8.6 | CDX audit denial and recovery expectations | Adversarial tests cover omitted/cherry-picked controls, wrong surfaces, forged/missing facts, changed graph, policy outage, decision downgrade, expired anchor, sensitive E0 read, self-selected recipient and evidence outage | Live incident exercises, penetration evaluations and independent false-denial calibration |
| 8.7 | Frozen CDX release boundary + Estate Anchor Standard, WP07 then WP11 | Strengthened production anchor guard; recorded authoritative source-state snapshot; `preflight.py` outputs machine-readable `BLOCKED_EXTERNAL_GATES` without pretending live release | CDX repository protection and 1.0 release, approved `PINNED_RELEASE`, independent runtime/estate acceptance |

## Mandatory-policy-control selection

The consumer adapter does not implement a second policy engine and does not accept model-selected `surface`, `control_ids` or `external_effect` flags.

For consequential internal effects, it requires full control results on eight canonical surfaces: `AUTHORITY`, `IDENTITY_AUTHORITY`, `CAPABILITY_DELEGATION`, `BOUNDARY`, `MODEL_AGENT`, `TOOL_CONNECTOR`, `RUNTIME_AUTH`, `EVIDENCE`. E3 effects additionally require `EXTERNAL_EFFECT`. E0 has a separate read-only policy mode including `DATA` and `CONTENT_MEMORY`, plus a separately bound read authorization gate.

Each surface evaluation must return **all** source-catalogued control IDs and their exact law section, a signed/verified decision, a matching context/policy digest and a non-contradictory result. A restrictive result dominates less restrictive results. Unfulfilled or hidden obligations never become ALLOW. Source catalogue drift is a release issue and cannot be resolved by reducing the set of mandatory controls.

## Confidential E0 reads

`CDXF8ReadGuard` separately enforces E0 reads by recipient, purpose, trusted grant, actual classification, target scope, CDX read-policy decision and evidence; it checks the current grant again immediately before reading. The general consequential-effect gate continues to exclude E0 and E4. A schema-valid E0 operation is **not** automatically a harmless read.

## Authentication and evidence caveat

An unsigned string or a claim named `verified=true` is not security proof. The new consumer adapter only trusts separate host-injected ports that must authenticate policy release, input facts, signed control decisions, obligations and SPETL custody. Current tests use explicit test doubles; these ports **are not wired to live CDX services**. The external SPETL reference custody profile `CDX-CUSTODY-GHA-001` is verified for the **CDX reference evidence pipeline only** and does not establish independent FFOS runtime custody.

## CI, assurance and promotion boundary

The FFOS workflow now audits the 131/69/62 mapping, executes the F8 JavaScript negative tests along with M0–M5 regressions, and emits a report of live release blockers. It also repairs the previously malformed multi-file artifact upload path so M5 and F8 JSON reports can be retained. The CDX repository binding audit remains a separate anchor-level check.

**F8-CONTRACT-ENGINEERING-PASS** is possible when CI passes. **M2-CDX-VERIFIED-RUNTIME-BOUND** is blocked until CDX WP07 authenticates the release, the FFOS WP11 integration establishes real mandatory-control and receipt handling and the human governing authority accepts evidence. No production migration, CDX state override or PR merge is authorized by this candidate.
