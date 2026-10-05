# FFOS Integrations

Planned boundaries:

- `github/`
- `udl/`
- `vercel/`
- `miro/`
- `drive/`

## Integration rule

An integration is not `CONNECTED` merely because an account, repository or external service exists. FFOS must distinguish:

`DEFINED → IMPLEMENTED → CONNECTED → TESTED → CANONICAL`

Each connector must report failures explicitly and preserve enough provenance to reconstruct the action.
