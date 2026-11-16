# Optional DevOps → CDX review-discovery interface 1.1

**Class:** Referral / discovery contract only. **Not** a CDX runtime contract, governance law, adapter, reviewer authorization or automatic review system.

## Relationships

```text
Repository/.ffos/devops-hook.json      (optional method discovery)
        ├─► FFOS DevOps Operating Model 1.1 (activated only by Director)
        └─► CDX review *reference* when relevant (no automated effect)

Repository/.cdx/anchor.json            (separate canonical CDX binding)
        └─► CDX-GOV-ANCHOR-001 + pinned CDX policy as applicable
```

The `.ffos` hook must never amend or substitute for `.cdx/anchor.json`. CDX publishes constitutional/policy and review contracts; the repository owns local enforcement. Existing mandatory CDX requirements always take precedence whether or not DevOps is activated.

## Review discovery

A new development process can carry this optional **request record** (as ordinary text or issue metadata, not a new API):

| Field | Meaning |
|---|---|
| `repository` | Canonical repository identity |
| `change_reference` | Existing issue/PR/WP URL |
| `requester` | Named Director or authorized actor |
| `review_reason` | Change of authority, material risk/effect, or Director request |
| `authority_reference` | Relevant existing mandate; unknown means *not approved* |
| `cdx_anchor_reference` | Actual local `.cdx/anchor.json` when present; verify separately |
| `request_state` | `REQUESTED`, `NOT_REQUESTED` or `REFER_TO_CANONICAL_CONTROL` |
| `cdx_decision_reference` | Populated **only** from an actual independent CDX process/decision |

**Discovery flow:** risk or Director prompt → check applicable source policy → locate existing canonical CDX anchor and appropriate authorized review route → create a source-linked request **if authorized** → human/CDX owner reviews under CDX rules → record actual decision and evidence. This is not equivalent to a CDX policy evaluation, `ALLOW`, a signed approval, or runtime effect.

## Suggested prompt in larger new work

> Would you like to request a CDX governance review for this work? This is optional unless an already applicable CDX or domain policy requires it. A request is not an approval, and the existing local CDX anchor and authority rules remain unchanged.

## Safety bounds

- No implicit CDX authority; no automatic SEND/PUBLISH/DEPLOY; no read/write of secrets; no unauthorised cross-repository mutation.
- If no canonical CDX anchor exists, or its standing is unknown, report **not verified** rather than treating the optional hook as a binding.
- Do not silently bypass required CDX/AMA/HCC controls by declining the optional DevOps framework.
- No new runtime interface is claimed by this document.

**CDX source:** [Estate Anchor Standard CDX-GOV-ANCHOR-001](https://github.com/Hybrismannen/Conductellence-/blob/main/GOVERNANCE/CDX-ESTATE-ANCHOR-STANDARD.md); [Runtime Integration contract](https://github.com/Hybrismannen/Conductellence-/blob/main/RUNTIME-INTEGRATION/README.md).
