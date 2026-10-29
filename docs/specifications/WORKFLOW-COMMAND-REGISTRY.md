# AMA Workflow & Command Registry

**Contract:** `ffos.ama.workflow-command-registry/v1`

## Purpose

Provide one shared registry for operator commands and executable workflows across AMA-based agents.

## Command

A command is a stable invocation surface. It resolves to a workflow and carries no independent authority.

Minimum fields:

- `commandId`
- `token`
- `agentId`
- `workflowId`
- `workflowVersion`
- `inputSchemaRef`
- `activationModes`
- `requiredAuthority`
- `status`

## Workflow

A workflow is a versioned executable procedure.

Minimum fields:

- `workflowId`
- `version`
- `agentId`
- `purpose`
- `steps`
- `requiredCapabilities`
- `effectCeiling`
- `authorityRequirements`
- `verification`
- `evidenceRequirements`
- `terminalStates`
- `rollbackPolicy`
- `status`

## Invariants

1. One command resolves to exactly one workflow version at execution time.
2. Workflow resolution is recorded in the Run evidence.
3. A workflow cannot exceed its parent agent's effect ceiling.
4. A workflow cannot grant itself a capability.
5. A workflow cannot bypass authority or mandate requirements.
6. Workflow version upgrades require compatibility/regression evaluation.
7. Named procedures should remain workflows rather than agents unless they satisfy the AMA first-class entity test.
