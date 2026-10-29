# AMA Conformance and Upgrade Protocol

**Protocol ID:** FFOS-AMA-CONFORMANCE-001  
**Version:** 0.1.0

## 1. Admission gates

An agent version advances through:

```text
manifest
→ schema validation
→ identity/mandate validation
→ workflow-command resolution
→ capability/effect validation
→ authority-denial tests
→ state/evidence tests
→ regression suite
→ deployment binding
→ independently authorized activation decision
```

No later gate repairs an earlier failed gate. This protocol is agent-agnostic and never embeds the identity or workflow semantics of a particular agent.

## 2. Mandatory conformance classes

### C1 — Contract
- schema valid;
- required sections present;
- IDs/version strings valid;
- lifecycle state valid.

### C2 — Authority
- self-approval prohibited;
- authority/mandate references required for consequential effects;
- requested effect cannot exceed agent ceiling;
- internal role cannot exceed parent ceiling;
- delegation cannot amplify authority.

### C3 — Binding
- every command resolves to an existing workflow version;
- every workflow resolves to registered capabilities;
- optional disabled modules are not callable;
- deployment/runtime binding matches the accepted agent version.

### C4 — Execution
- happy path;
- denied authority path;
- missing mandate path;
- unavailable capability path;
- timeout/cancellation path;
- blocked/hold path.

### C5 — Evidence
- run ID and correlation preserved;
- input provenance recorded;
- policy/gate decisions recorded;
- mutation/external-effect evidence recorded;
- failures/holds/skips/waivers recorded;
- terminal state recorded.

### C6 — Regression
Candidate agent or AMA versions must be evaluated against the last accepted baseline. Regressions in permissions, denial behavior, evidence, workflow resolution or terminal-state handling block promotion.

## 3. Update propagation

AMA update propagation is inventory-driven, never blanket overwrite.

```text
AMA candidate
→ affected agent inventory
→ compatibility matrix
→ mechanical migrations
→ semantic/authority diff
→ regression
→ deployment candidate
→ authorized human review where triggered
→ rollout
→ post-deploy verification
```

## 4. human-approval triggers

Always require authorized human review when an upgrade changes:

- purpose or mandate;
- first-class agent boundaries;
- authority class;
- effect ceiling;
- command meaning;
- workflow outcome semantics;
- external destination class;
- human review requirement;
- acceptance semantics;
- persistent-memory scope;
- lifecycle transition permissions.

## 5. Mechanical changes

An independently authorized technical maintenance function may prepare or apply a mechanical candidate only when the accepted maintenance policy explicitly permits it and the change does not cross a human-approval trigger.

Permitted classes of mechanical change:

- schema field rename with one-to-one semantics;
- registry metadata normalization;
- non-semantic dependency/version pin;
- generated index refresh;
- deterministic configuration migration within the same accepted scope.

A mechanical change becomes accepted only after normal repository/runtime verification and applicable governing progression.

## 6. Rollback

Every deployable upgrade that can alter runtime behavior must identify a rollback target and rollback procedure before activation.

Rollback cannot be used to restore a version whose authority has been revoked or whose use is constitutionally prohibited.

## 7. Evidence

Every conformance attempt records:

- agent/version;
- AMA source/target version;
- compatibility classification;
- test suite version;
- results;
- material diffs;
- reviewer/authority requirements;
- deployment candidate reference;
- terminal outcome.
