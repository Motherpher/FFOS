# FFOS ProjectHub Data Model v0.1

**Process:** FFOS-DEVOPS-PH-RECON-001  
**WP:** PH-WP04  
**State:** DESIGN COMPLETE

## 1. Anchor

Every ProjectHub project has one FFOS core `PROJECT` identity object.

ProjectHub domain state is project-owned and versioned. The core FFOS object remains the orchestration anchor; ProjectHub-specific detail is owned by the ProjectHub model/runtime.

## 2. Project profile

`ProjectProfile`
- projectId
- ownerRef
- mandateRef
- methodologyProfile: FULL_FF | CONFIGURED | PROJECT_NATIVE
- selectedMethodRefs[]
- purpose
- scope
- nonScope
- geography
- timeHorizon
- dataClassCeiling
- status
- version
- provenance[]

## 3. Project Core

`ProjectCore`
- projectId
- version
- need
- purpose
- targetGroups[]
- mechanism
- intervention
- scope
- nonScope
- geography
- timeScale
- constraints[]
- premiseRefs[]
- unknownRefs[]
- owner/governance refs
- sourceRefs[]
- provenance[]

## 4. Project Field

Each dimension is first-class:

`ProjectFieldDimension`
- id
- projectId
- dimension: Need | Purpose | Actors | Evidence | Mechanism | Resources | Funding | Outcomes
- maturity: UNKNOWN | SEED | DRAFT | DESIGNED | NORTH_STAR
- note
- evidenceRefs[]
- premiseRefs[]
- updatedBy
- version
- provenance[]

## 5. Evidence and premises

`Evidence`
- id/projectId
- title/type
- sourceRef/sourceSystem
- evidenceState
- freshness
- rights/dataClass
- supportsRefs[]
- contradictsRefs[]
- version/provenance

`Premise`
- id/projectId
- statement
- evidenceState:
  FACT | SUPPORTED_PREMISE | PLAUSIBLE_PREMISE | UNTESTED_PREMISE | CONTESTED_PREMISE | INVALIDATED_PREMISE | UNKNOWN
- evidenceRefs[]
- owner
- reviewAt
- version/provenance

North Star may count an evidence reference only when the referenced evidence exists, belongs to or is lawfully shared with the project, is readable by the evaluating principal/system, is not invalidated and satisfies the configured freshness rule where freshness is material.

## 6. Governance

`ProjectDecision`
`ProjectGate`
`ChangeRequest`
`ProjectRoleGrant`

All are project-scoped and provenance-bearing.

A `ProjectRoleGrant` contains:
- principalRef
- projectId
- role
- allowedOperations[]
- dataClassCeiling
- validity window
- grantAuthorityRef
- status/version/provenance.

## 7. Work architecture

`WorkPackage`
`Task`
`Milestone`
`Deliverable`
`ProjectDependency`

Dependencies are explicit typed relations:
- DEPENDS_ON
- BLOCKED_BY
- PRECEDES
- REQUIRES

Schedule fields distinguish baseline, current forecast and actual values.

## 8. Resources/economy/funding

`ResourceAllocation`
`BudgetVersion`
`BudgetLine`
`Forecast`
`ActualCostRef`
`FundingOpportunityRef`
`FundingAssessment`
`FundingApplication`
`FundingAward`
`FundingAllocation`
`FundingObligation`

ProjectHub does not claim accounting truth unless a separately admitted accounting source owns/provides it.

## 9. Actors / FIELD adapter state

`ProjectActor`
- actor/source ref
- role/function
- interest
- resource
- knowledge
- influence
- access
- trust/legitimacy
- dependency
- constraint/conflict
- mission relevance
- source protocol/version where derived.

`ActorRelationship` contains explicit relationship dimensions rather than a generic edge only.

These objects may be derived from FIELD but do not claim to be the complete FIELD runtime.

## 10. Outcome/UDL adapter state

`Outcome`
`Indicator`
`MeasurementDefinition`
`Measurement`
`ExposureRecord`
`EvaluationCohort`
`LearningFinding`

If derived from UDL, source protocol/version and evaluation context are mandatory.

Participant-identifiable records are PH-D3 by default and require restricted storage/view rules.

## 11. RAIDO

One shared issue architecture:

`RAIDOItem`
- type: RISK | ASSUMPTION | ISSUE | DEPENDENCY | OPPORTUNITY
- severity
- likelihood where meaningful
- owner
- status
- evidenceRefs
- relatedObjectRefs
- response
- reviewAt
- provenance.

Premises remain semantically distinct; a premise may link to a RAIDO assumption/risk but is not collapsed into it.

## 12. Linked artifacts

`LinkedArtifact`
- artifactId
- projectId
- system
- artifactType
- externalRef
- canonicality
- syncPolicy
- sourceObjectRefs[]
- externalVersion
- internalVersion
- rights
- provenance
- lastReviewedAt
- lastSyncedAt.

## 13. Project Steward

`StewardProposal`
- proposalId/projectId
- actionClass A0–A5
- code/title/reason
- targetRefs[]
- proposedCommand
- approvalRequirement
- state: PROPOSED | ADOPTED | REJECTED | EXPIRED | EXECUTED | FAILED
- createdBy/runRef
- provenance.

An adopted proposal is not proof the resulting effect executed.

## 14. Monitoring

`MonitoringSignal`
- projectId
- stratum
- code
- severity
- status
- sourceRefs[]
- evidenceRefs[]
- detectedAt
- staleAt
- resolvedAt
- provenance.

Monitoring strata are read-model aggregations over signals and project state.

## 15. Event/transition law

Every canonical state-changing command produces:
- new version(s);
- state-transition event(s);
- command/causation reference;
- principal/authority;
- provenance;
- audit/effect evidence as required.

Historical state is append-only.

## 16. Relation scope classes

Relations declare one of:
- `OWNED` — both endpoints must resolve within project scope;
- `SHARED_REFERENCE` — target may be shared, traversal does not inherit target's unrelated graph;
- `EXTERNAL_REFERENCE` — target is outside FFOS canonical graph and carries source authority.

This prevents shared actor/evidence nodes from creating cross-project graph leakage.

## 17. Version semantics

- stable immutable object id;
- monotonic version;
- optimistic write precondition;
- no last-write-wins for canonical ProjectHub mutation.

## Exit

This model is implementable without adding domain-specific UDL/FIELD/Pius internals to the FFOS shared core.
