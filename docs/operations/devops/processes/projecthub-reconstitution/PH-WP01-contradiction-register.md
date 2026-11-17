# ProjectHub Reconstitution — PH-WP01 Contradiction Register

**Process:** FFOS-DEVOPS-PH-RECON-001  
**State:** FROZEN FOR DESIGN

| ID | Sources | Contradiction | Resolution rule | Target WP |
|---|---|---|---|---|
| C-01 | ProjectHub Contract v0.3 vs Issue #16 | v0.3 presents Pius/PIVE as the canonical starting chain; Issue #16 makes Pius optional and supports PROJECT_NATIVE projects | ProjectHub autonomy wins as later Director design direction; v0.4 must retain Pius as optional governed ingress | PH-WP03 |
| C-02 | form-flode ProjectHub docs vs current FFOS restructure | historical docs name form-flode/17-ffos as FFOS-PH runtime location | form-flode is projection/history; all new executable implementation belongs in Motherpher/FFOS | PH-WP03/04 |
| C-03 | Phase-V legacy runtime vs current registry | legacy implementation is SQLite/Twin-centric; current FFOS has append-only object/event PostgreSQL registry contracts | reimplement semantics on current registry; legacy is migration fixture only | PH-WP04/07 |
| C-04 | legacy “Pius/PIVE dispatch” expansion vs Pius RESERVED | legacy ProjectHub treats Pius/PIVE dispatch as implemented functionality; current FFOS object model reserves Pius integration | expose optional adapter boundary only until exact current Pius contract is pinned | PH-WP03/08 |
| C-05 | legacy UDL/FIELD engines vs current domain-boundary law | legacy ProjectHub implemented simplified UDL and FIELD/Helix semantics | retain explicit adapter/derived-analysis status; do not claim full canonical domain runtime | PH-WP08 |
| C-06 | PR #15 CDX inventory vs current CDX main | PR #15 says repository runtime enforcement not verified; current FFOS anchor/runtime is VERIFIED_RUNTIME_BOUND | keep effect inventory concepts, refresh status; ProjectHub-specific effect surfaces still require binding/tests | PH-WP09 |
| C-07 | current FFOS authority vs planned ProjectHub roles | current active authority is DIRECTOR only; ProjectHub needs project-owner/operator/reviewer semantics | define target role semantics now, but do not claim roles active until auth/RBAC implementation and tests exist | PH-WP02/04/07 |
| C-08 | donor similarity vs system independence | Barnombudet donor is operationally useful, but user requires a fully independent FFOS ProjectHub | genealogy and explicit ports only; no runtime/data/release coupling | PH-WP03/05 |
| C-09 | old operational acceptance vs missing current ProjectHub module | legacy Phase V says operational; current Motherpher/FFOS main has no ProjectHub native module/app | preserve legacy acceptance as historical; new release state stays NOT_RELEASED until reconstitution passes | PH-WP13 |
| C-10 | ProjectHub evidence refs vs evidence integrity | legacy North Star accepted evidence references without strong referential validation | new data model must validate target existence, scope, provenance, rights and freshness | PH-WP04/08/11 |

## Rule

A contradiction is not “resolved” by deleting one source. Resolution means the new contract explicitly states which source governs which dimension and preserves the displaced source as history.
