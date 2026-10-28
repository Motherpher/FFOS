# AMA Agent Manifest Specification

**Contract:** `ffos.ama.agent-manifest/v1`  
**AMA:** `0.1.0`

## Purpose

The Agent Manifest is the canonical machine-readable definition of one FFOS agent version.

The manifest declares what an agent is permitted to be. It does not by itself prove implementation, deployment, activation or acceptance.

## Required semantic sections

- identity
- purpose and mandate
- runtime class
- authority contract
- effect ceiling
- workflows
- commands
- capabilities
- state/memory policy
- internal roles
- evidence requirements
- conformance profile
- lifecycle
- AMA version pin

## Separation rule

The manifest must not embed executable secrets, private credentials or mutable external tokens.

Tool/provider credentials belong in deployment configuration or secret stores. The manifest binds to capability IDs, not secret material.

## Authority rule

Every agent that may request `E1_INTERNAL_STATE` or above must declare explicit authority and mandate requirements.

No manifest field may designate the agent itself as the authority that approves its own permission expansion.

## Version rule

`agentVersion` and `amaVersion` are independent:

- `agentVersion` changes when the agent definition changes.
- `amaVersion` changes when the shared master contract changes.

A new AMA version therefore does not automatically create a new accepted agent version. It creates a compatibility/migration obligation.

## First-class entity rule

Use an Agent Manifest only for a first-class agent. Commands, workflows, capabilities and internal roles are registered as bound objects under the agent; they are not promoted into agents without an independently governed identity, mandate, permissions/state boundary and lifecycle.
