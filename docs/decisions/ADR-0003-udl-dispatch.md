# ADR-0003 — UDL as External Dispatch Destination

**Status:** Accepted

## Decision

UDL remains a distinct product/site/domain. FFOS provides a controlled dispatch route for outputs that are ready to move to UDL.

## Initial state model

```text
DRAFT
→ READY
→ UDL_READY
→ DIRECTOR_REVIEW
→ APPROVED_FOR_UDL | RETURNED | REJECTED
→ DISPATCHING
→ PUBLISHED | FAILED
→ CLOSED
```

## Minimum dispatch record

- Dispatch ID
- Source object ID
- Artifact/version
- Target = UDL
- Requested action: CREATE | UPDATE | REPLACE
- Approval state
- Director decision metadata
- Dispatch timestamp
- Connector result
- Published version/URL when available
- Failure reason when applicable
- Final registry state

## Rule

No `UDL_READY` object may be represented as published solely because content exists in FFOS. Publication requires a connector result or other explicit confirmed deployment event.
