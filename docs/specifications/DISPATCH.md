# Dispatch Object — Initial Specification

## Purpose

Dispatch is the common transport/control object for moving approved work between FFOS rooms, domain repositories and external destinations.

## Initial fields

```text
dispatch_id
source_type
source_id
source_version
target_type
target_id
action
state
approval_required
approval_state
director_decision_id
created_at
updated_at
dispatched_at
completed_at
connector_result
result_reference
failure_code
failure_reason
```

## Initial state classes

- DRAFT
- READY
- HOLD
- DIRECTOR_REVIEW
- APPROVED
- REJECTED
- RETURNED
- DISPATCHING
- COMPLETED
- FAILED
- CLOSED

Domain-specific states such as `UDL_READY` may extend the generic model without replacing it.

## Invariants

1. Every dispatch has a unique ID.
2. Every state transition is logged.
3. Approval-required dispatches cannot enter DISPATCHING without a valid approval or explicit governed override.
4. FAILED is never silently converted to COMPLETED.
5. A destination confirmation must be recorded before publication/deployment is treated as completed.
6. Dispatch history is append-only at the audit level.
