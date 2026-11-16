# ADR-0005 — ProjectHub as Autonomous Native FFOS Subsystem

**Status:** Accepted for FFOS-DEVOPS-PH-RECON-001 design baseline  
**Date:** 2026-11-16

## Decision

ProjectHub is an independently owned native FFOS subsystem.

ProjectHub may operate projects under:
- FULL_FF;
- CONFIGURED;
- PROJECT_NATIVE.

Pius/PIVE, FFC/DNA and other methods are optional governed inputs, not mandatory upstream infrastructure for every ProjectHub project.

Barnombudet ProjectHub remains a practical predecessor/design donor only. No runtime, data, release or automatic synchronization dependency is permitted.

New ProjectHub executable implementation belongs in `Motherpher/FFOS`, following current repository structure:
- domain runtime in `modules/projecthub/`;
- reusable ProjectHub contracts/types in `packages/projecthub-model/`;
- human UI/API in `apps/web`;
- external/provider adapters in `integrations/` only when actually implemented.

The old `Motherpher/form-flode/17-ffos` ProjectHub implementation remains historical/migration evidence.

## Compatibility

This ADR preserves ADR-0001 (FFOS control plane), ADR-0002 (Pius RESERVED) and ADR-0003 (UDL external destination).

It resolves the ProjectHub-specific conflict created by historical ProjectHub Contract v0.3's compulsory Pius/PIVE-led canonical chain.

## Consequences

- ProjectHub Contract v0.4 becomes the design target.
- PROJECT_NATIVE must be testable with zero FFC/Pius dependency.
- optional domain adapters must pin exact source/version and preserve domain authority.
- ProjectHub A3/A4/A5 effects must bind to the current FFOS CDX runtime at explicit local enforcement points.
- no historical “operational” claim can substitute for acceptance of the reconstituted runtime.
