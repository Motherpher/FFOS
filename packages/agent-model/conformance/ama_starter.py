"""Create a minimal, inert AMA M1 v0.2 draft bundle.

Requires caller-supplied identity, purpose, mandate and responsible principal.
No runtime provider, credentials, tools, policy or domain are silently chosen.
"""
import argparse
import json
from pathlib import Path

from ama_vnext import digest, validate_bundle


def pin(row, key):
    return {"id": row[key], "version": row["version"], "digest": digest(row)}


def starter(agent_id, name, purpose, scope, governing_principal,
            command_token, version="0.1.0"):
    io = {"type": "object", "additionalProperties": False,
          "properties": {"value": {"type": "string"}}}
    adapter = {
        "schema": "ama.tool-adapter/v0.2-candidate",
        "adapterId": agent_id + ".ADAPTER", "version": version,
        "status": "DRAFT", "invocationKind": "OTHER",
        "supportedEffects": ["E0_OBSERVE"],
        "credentialBindingRequired": True,
        "inputSchema": io, "outputSchema": io,
    }
    cap = {
        "schema": "ama.capability/v0.2-candidate",
        "agentId": agent_id, "capabilityId": agent_id + ".CAPABILITY",
        "version": version, "status": "DRAFT",
        "effectClass": "E0_OBSERVE",
        "resourceScopes": [scope],
        "adapterRef": pin(adapter, "adapterId"), "permissionRefs": [],
        "inputSchema": io, "outputSchema": io,
    }
    cap_ref = pin(cap, "capabilityId")
    step = agent_id + ".START"
    end = agent_id + ".END"
    workflow = {
        "schema": "ama.workflow/v0.2-candidate",
        "agentId": agent_id, "workflowId": agent_id + ".WORKFLOW",
        "version": version, "status": "DRAFT",
        "effectCeiling": "E0_OBSERVE",
        "requiredCapabilities": [cap_ref],
        "entryStep": step,
        "steps": [
            {"stepId": step, "kind": "ACTION", "dependsOn": [],
             "capabilityRef": cap_ref},
            {"stepId": end, "kind": "END", "dependsOn": [step]},
        ],
        "terminalStepIds": [end],
        "inputSchema": io, "outputSchema": io,
    }
    command = {
        "schema": "ama.command/v0.2-candidate",
        "agentId": agent_id, "commandId": agent_id + ".COMMAND",
        "version": version, "token": command_token,
        "workflowRef": pin(workflow, "workflowId"),
        "inputSchema": io,
    }
    agent = {
        "schema": "ama.agent/v0.2-candidate",
        "agentId": agent_id, "agentVersion": version, "amaVersion": "0.2.0",
        "name": name, "purpose": purpose,
        "mandate": {
            "scope": [scope],
            "nonGoals": ["No external effects or authority changes without separate approval"],
        },
        "authority": {
            "governingPrincipalRef": governing_principal,
            "mandateRequired": True,
            "selfApprovalProhibited": True,
            "approvalMode": "HUMAN_RESERVED",
        },
        "runtimeClass": "REQUEST_RESPONSE", "lifecycleState": "DRAFT",
        "effectCeiling": "E0_OBSERVE",
        "workflowRefs": [pin(workflow, "workflowId")],
        "commandRefs": [pin(command, "commandId")],
        "capabilityRefs": [cap_ref],
        "modules": [],
    }
    bundle = {"schema": "ama.bundle/v0.2-candidate",
              "agent": agent, "workflows": [workflow],
              "commands": [command], "capabilities": [cap],
              "toolAdapters": [adapter], "profiles": []}
    errors = validate_bundle(bundle)
    if errors:
        raise ValueError("INVALID_STARTER:" + ",".join(errors))
    return bundle


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--agent-id", required=True)
    p.add_argument("--name", required=True)
    p.add_argument("--purpose", required=True)
    p.add_argument("--scope", required=True)
    p.add_argument("--governing-principal", required=True)
    p.add_argument("--command-token", required=True)
    p.add_argument("--version", default="0.1.0")
    p.add_argument("--output", type=Path, required=True)
    args = p.parse_args()
    bundle = starter(args.agent_id, args.name, args.purpose, args.scope,
                     args.governing_principal, args.command_token, args.version)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(bundle, indent=2) + "\n", encoding="utf-8")
    print("AMA DRAFT bundle written; host binding and acceptance remain absent.")
