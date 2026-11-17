# ProjectHub Reconstitution — PH-WP12 Real-Project Pilot

**Process:** FFOS-DEVOPS-PH-RECON-001  
**State:** PASS  
**Date:** 2026-11-16

## Pilot A — RFSU assignment / FULL_FF

Source of truth:
- `Hybrismannen/RFSU-godex-FF@main`
- `01-assignment/synopsis-v1.1.md` — CANONICAL / ACTIVE
- `01-assignment/DNA-box/FF-DNA-PRJ-RFSU-001-v0.3.md` — CANONICAL / PROPOSAL-STABLE
- `10-RAMx-and-delivery-control/README.md`
- `13-metadata-dashboard/generated/dashboard.md`

Non-sensitive fixture facts used:
- project is proposal-stage;
- methodology is explicit Form & Flöde;
- active purpose is bounded three-case comparative analysis;
- WP0–WP7 delivery architecture;
- 120 h hard ceiling / 112 h base + 8 h reserve;
- working commercial scenario 120,000 SEK ex VAT;
- public/private publication separation;
- current dashboard reports proposal submission deadline as passed and 0/3 clinics selected.

No fieldwork/person-identifiable data is copied into the pilot.

### Pilot pressure tests

- missed milestone/deadline → Delivery ATTENTION;
- funding/economic pressure → explicit gap/forecast signal rather than hidden completion;
- missing/invalid evidence → North Star NOT_READY;
- redesign → A5 cannot be executed through generic Steward path;
- closure → project lifecycle moves only through governed canonical mutation.

## Pilot B — FFOS ProjectHub reconstitution / PROJECT_NATIVE

Source:
- `Motherpher/FFOS#77`
- `FFOS-DEVOPS-OM-001@1.1`
- current ProjectHub reconstitution branch.

Purpose:
Demonstrate that ProjectHub can operate a real project whose governing methodology is the FFOS DevOps process itself, with:
- no Assignment Dossier requirement;
- no DNA-Box requirement;
- no Pius/PIVE requirement;
- no FFC completeness penalty.

## Acceptance

PH-WP12 passes when PostgreSQL-backed automated pilot evidence demonstrates both projects and the pressure-path assertions above without admitting PH-D4/PH-D5 or external effects.


## Execution evidence

- ProjectHub DevOps run **43793039781** — PASS.
- Core job: 29 tests, 27 pass, PostgreSQL-dependent tests skipped as designed.
- PostgreSQL job: **29/29 PASS**, including this real-project pilot.
- CDX Runtime Binding run **43793039758** — PASS on the same implementation head.
- FFOS cloud runtime contract run **43793039860** — PASS.
- DevOps model release watch run **43793039761** — PASS.

### Observed result

The RFSU fixture operated as `FULL_FF` using explicit source references while retaining zero compulsory Pius references.

The live ProjectHub reconstitution operated as `PROJECT_NATIVE` with:
- no FFC refs;
- no Pius refs;
- no Assignment Dossier requirement;
- FFOS DevOps Model 1.1 as its external project method.

Pressure-path assertions passed:
- missed deadline → explicit timeline attention;
- unfunded planned budget → explicit funding-gap attention;
- missing evidence → North Star NOT_READY;
- supplied valid project evidence → North Star READY;
- A5 redesign → generic execution rejected;
- closure → governed versioned ProjectHub state transition.

No participant or fieldwork data from the RFSU assignment was copied into ProjectHub pilot state.

## Exit

**PH-WP12 PASS.**
