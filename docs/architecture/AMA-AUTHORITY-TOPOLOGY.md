# AMA Authority Topology — Director-defined estate hierarchy

**ID:** FFOS-AMA-AUTH-001  
**Status:** DIRECTOR-DEFINED TARGET TOPOLOGY; IMPLEMENTATION NOT VERIFIED  
**Date:** 2026-10-29

## 1. Canonical structural hierarchy

The Director has specified the intended structure:

```text
HUMAN DIRECTOR
    └── CDX (Conductellence)
         └── FFC
              └── FFOS
                   ├── Stable
                   │    ├── AMA (Agent Master Architecture)
                   │    └── Agent Mechanic
                   └── Pius
                        ├── HCC ───── linked to CDX
                        └── Piusites ─ built on AMA
```

The indented tree represents **organizational / systems architecture placement**. It does not by itself mean CDX delegates constitutional sovereignty to FFC, that FFOS controls HCC judgments, or that AMA can grant permissions.

## 2. Exact component roles

- **Human Director**: principal human command and acceptance authority.
- **CDX / Conductellence**: governing constitutional, authority, policy and assurance layer for the estate; HCC has an explicit cross-link to CDX.
- **FFC**: parent operating/business structure linking CDX governance to FFOS; placement is Director-defined, not yet proof of implemented runtime delegation.
- **FFOS**: operational control plane for work, dispatch, decisions, state and registry.
- **Stable**: FFOS subsystem housing the shared agent architecture and the technical maintenance function.
- **AMA**: master agent construction/compatibility contract within Stable. Agents and Piusites use AMA; AMA does not itself make governance decisions.
- **Agent Mechanic**: Stable's technical agent-management and conformance function; cannot enlarge mandate or self-accept.
- **Pius**: FFOS-contained system/domain in the target structure, with distinct Pius-specific governance and agentive operation. Its application runtime integration remains **RESERVED/PENDING** under the current FFOS baseline.
- **HCC**: Pius-specific moral/ethical oversight with an explicit connection to CDX. HCC remains identifiable and cannot be collapsed into Agent Mechanic or an AMA module.
- **Piusites**: Pius agents constructed with AMA's common agent contract, plus Pius-specific Codex/HCC constraints, registration and activation requirements.

## 3. Construction and control links

**Containment:** Human Director → CDX → FFC → FFOS → {Stable, Pius}. Stable → {AMA, Agent Mechanic}. Pius → {HCC, Piusites}.

**Cross-links:** HCC ↔ CDX (governance alignment and applicable escalation/assurance); Piusites → AMA (agent construction/conformance dependency). Cross-links are **not** parent-child containment.

**Execution rule:** Human-authorized mandate and Director dispatch + registered AMA agent/Piusite + applicable CDX controls + relevant HCC/Pius gates + local enforcement + independent evidence/acceptance. Neither HCC nor CDX is presumed to be fully implemented in FFOS runtime from the diagram alone.

## 4. Implementation/status boundaries

1. User-specified topology is a **target design decision**, not a claim that repository code already enforces it.
2. The earlier assertion that Pius and FFOS are always parallel siblings is superseded **as target architecture**. Existing FFOS repository baseline still records Pius as RESERVED. Do not silently claim a completed migration.
3. Stable is the architectural home for AMA and Mechanic. Their current files in FFOS `docs/` and `packages/` are implementation locations and do not contradict Stable's ownership; runtime service/registry bindings remain to be implemented.
4. HCC–CDX link needs an explicit versioned interface contract; do not invent authority precedence, direct API coupling or automatic override.
5. Piusites must satisfy both AMA conformance and their additional Pius/HCC-specific gates, without allowing AMA to redefine the Pius Codex.
6. Runtime claims follow: DEFINED ≠ IMPLEMENTED ≠ CONNECTED ≠ TESTED ≠ CANONICAL.

## 5. Sources and decision precedence

- **2026-10-29 Human Director instruction:** canonical *target containment graph* in section 1.
- **FFOS** `docs/architecture/ARCHITECTURE.md`, `docs/specifications/AUTHORITY.md`: current implementation baseline and Pius RESERVED boundary.
- **Conductellence** `RUNTIME-INTEGRATION/README.md`, `DISTRIBUTION/policy-shards/authority.json`: policy pinning, local enforcement, mandate/authority references and verification status.
- **Pius System Codex 5.0** Part 7, Appendix M and Appendix O: bounded registered Piusites and source validation.
- **Legacy Household** `form-flode/17-ffos`: domain-specific agent patterns only, not the owner of AMA.

Where existing documents depict a different estate *containment* than the Director's new target hierarchy, mark the old depiction as current/legacy, not the canonical future target. Do not rewrite historical decisions or misstate deployment.
