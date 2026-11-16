# FFOS ProjectHub module

Native ProjectHub implementation for `FFOS-DEVOPS-PH-RECON-001`.

**Current build depth:** PH-WP06 core service only.

Implemented:
- independent project creation;
- FULL_FF / CONFIGURED / PROJECT_NATIVE profiles;
- eight Project Field dimensions;
- versioned ProjectHub project state;
- project-owned nodes;
- explicit OWNED / SHARED_REFERENCE / EXTERNAL_REFERENCE relation scope.

Not implemented by this slice:
- production persistence/transactions/RBAC;
- CDX effect mediation;
- domain engines;
- Project Steward execution;
- web UI/API;
- external connectors.

Those belong to later WPs and must not be inferred from this module's presence.
