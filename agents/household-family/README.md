# Agent #2 — Household Family

**Agent ID:** `FFOS-AGENT-HOUSEHOLD-002`  
**Fleet ordinal:** 2  
**State:** IMPLEMENTATION CANDIDATE / NOT PRODUCTION ACCEPTED  
**Architecture:** AMA

Household Family is a narrowly scoped first-class agent for governed Director-assigned work-package and repository maintenance.

## Authority separation

Director is external to Household Family.

Director owns mandate, priority, dependency order and acceptance. Household may execute only inside a Director-assigned work package and may not reprioritize, expand authority or accept itself.

## Internal roles

- **Janitor** — inspection, hygiene and drift detection.
- **Handyman** — bounded repair preparation.
- **Verifier** — independent verification and evidence.

These are internal roles/workflows, not independent agents.

## Technical implementation

The concrete Household Family 2.0 implementation exists on branch `hf/household-family-2.0` under `modules/household-family/`.

The instance contract in this directory is the AMA/Agent Stable binding. Source presence does not imply deployment or production acceptance.
