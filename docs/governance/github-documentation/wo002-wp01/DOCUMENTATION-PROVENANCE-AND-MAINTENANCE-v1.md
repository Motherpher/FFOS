# D03 — Repository Documentation, Provenance and Maintenance Contract

**Work order:** FF-GH-WO-002 / WP01 · **Date:** 2026-11-03 · **Status:** Review candidate; not constitutional source and not DG-01 approved.

## Intended experience

Every one of the 31 registered repositories must supply a reliable answer to:

1. **What is this and what is it currently?** Root README description and explicitly time-bounded state.
2. **How can the intended user use it?** Current source-controlled guide, verified public interface or an explicit `NOT VERIFIED / NO GUIDE`.
3. **What is actually happening?** Native Issues/PRs and, where appropriate, the private [Estate Portfolio](https://github.com/orgs/Motherpher/projects/2).
4. **Where does knowledge live?** Owning canonical source, optional interpretive knowledge or actual published Wiki, with privacy/rights intact.
5. **What is accepted?** Original decision and evidence, not GitHub labels, Project work-stage or a README assertion.

The user should generally reach the correct manual within **two navigation actions from the root README**. Where a repository is a historical/diagnostic source rather than an end-user product, a minimal purpose/source-status entry may suffice; do not fabricate a functional manual.

## Permitted documentation surfaces and precedence

| Surface | Proper role | Limits |
|---|---|---|
| Root `README.md` | Identity, source status and concise navigation | Cannot approve code, release or agent |
| `docs/user-guide/`, `docs/operator/`, domain manuals | Source-linked human instructions | Must distinguish real tested routes from designed interfaces |
| Source architecture/policy/contracts | Actual technical or normative authority under local governance | Must not be copied as a competing Wiki constitution |
| Native GitHub Wiki | Curated knowledge where editorial need and publication permissions exist | Independent Git history; not necessarily populated when feature is ON |
| GitHub Projects V2 | Noncanonical planning, blockers, roadmap, source decision projection | Status Done or Work Stage Accepted is not the decision |
| Live product/App Help | Current user interaction, where authorised and tested | Source presence is not deployed operation |
| Dashboard/snapshot | Point-in-time or live telemetry with explicit source/freshness | Does not create knowledge, usage data or success metrics |

**Owner-specific controls:** Conductellence/CDX remains constitution and effect-contract source; FFC Corpus version and change-control law remain in its own repository; Pius Universe owns current Pius 6 development; UDL owns Blueprint and evaluation semantics; Barnombudet handles organisational privacy; CareerHub profile data and StatsVault/GreenBell company source retain respective boundaries. This directory imposes no additional constitutional authority.

## Required documentation record (D01 schema)

For every repository the register identifies owner, Tier A/B/C/D, privacy, source Git tree SHA, actual root README and guide path, Wiki feature status, Project adoption disposition, named maintainer if verified (otherwise UNASSIGNED), a **specific** navigation action, and as-of source reconciliation date.

A file's existence is evidence of its path only. It does not prove a complete user journey, operational deployment or independent review. Unknown information is `NOT VERIFIED`, never invented.

## Lifecycle and publication states

- `SOURCE_INSPECTED` — repository tree/files read; no signed-in usability claim.
- `REVIEW_CANDIDATE` — changes committed on a specific bounded PR.
- `MERGED_SOURCE` — verified merge SHA appears on owning `main`; still not a runtime PASS.
- `PUBLISHED_AND_ACCESS_TESTED` — intended access role verified against current published page or app.
- `USABILITY_VERIFIED` — independent task tester completed identified steps with evidence.
- `STALE` — guide makes a contradicted state claim or source revision changed materially.
- `SUPERSEDED` / `ARCHIVED` — original source/history retained and pointer to current location given.
- `HOLD` — unsafe, wrong authority, broken source, missing publication rights or unverified effect.

Do not confuse these documentary states with native GitHub Status, AMA lifecycle, CDX policy decisions or Director acceptance.

## Change trigger / reconciliation

`Canonical source change → source owner identifies affected user task → update guide on bounded PR → verify links/source revision → owner review → publish/merge → re-check user access → record evidence`.

Trigger review when: route/function changes; runtime/deployment status changes; root README or linked path moves; release/version milestone; source/Project/Wiki access changes; official decision/approval changes; an incorrect claim or broken link is reported; an external provider check changes; a confidential publication surface is affected.

**No automatic overwrite:** Until independently approved, tools may read and flag divergence but shall not bulk change source README/Wiki or Project fields without mandate. A future synchroniser is subject to separate GitHub credentials, CDX/local policy, concurrency, evidence and Director gates.

## Template for a repository Start Here

A small box or section near root README top may link: `Overview | User Guide | Current work | Knowledge/Source | Status/Evidence | Support`. Never introduce a dead "Wiki" link solely because `has_wiki=true`; use an actual published, checked URL or point to a versioned Wiki seed explicitly marked NOT PUBLISHED.

Prefer existing guide over copies; e.g. FFOS `docs/operator/`, UDL `docs/user-guide/`, Barnombudet `docs/ANVANDARMANUAL.md`, CDX `GOVERNANCE/CDX-1.0-SYSTEM-GUIDE.md`.

## Security and privacy

- Link private materials from private audiences only; an Issue body or Wiki can accidentally create a new publication context even if a file path already exists elsewhere.
- Do not paste API tokens, client data, private professional profiles or child-identifying information into guide samples, Project card metadata, snippets or public Wikis.
- On identifying a source credential, record **only location and remediation direction**, never the value; rotate/revoke through the credential owner and quarantine unsafe runtime.
- Check source rights, citation and third-party licensing before publishing.
- Use least-privilege maintenance and independent nonprivileged user testing before claiming access verified.

## Validation checklist

- [ ] Exactly one owning canonical source per meaning
- [ ] Main/PR head SHA and source guide paths recorded
- [ ] Relative paths resolve from actual Markdown file location; anchors/screens checked where material
- [ ] Current status statements backed by source and evidence
- [ ] No obsolete "draft/unmerged" descriptions after verified GitHub merge
- [ ] No unsupported claims of production, all-Wiki publication or complete GitHub Projects coverage
- [ ] Privacy/rights and a qualified owner reviewer identified
- [ ] Real user tests marked done **only** with outcomes and intended role
- [ ] Change ledger with original PR and resulting commit SHA
- [ ] DG-01 source decision before declaring work-order WP01 accepted

## Out-of-scope and dependency preservation

- Native Wiki initial publication: WO-002 WP03, not WP01.
- Domain Projects creation: WO-002 WP02, not WP01.
- Existing FF-GH-WP04's DG-04 remains HOLD despite bounded PR #47 merge.
- Credential remediation or client app code alteration: separate authorised security/implementation work, not documentation.
- FFC accepted canonical content/version changes: subject to the original FFC Corpus version protocol and must not be silently applied from an estate-navigation task.

**This is an operational standard candidate; it neither amends source law nor authorises production effects.**
