/** Pure, credential-free checks for FF Estate database admission. */
export const FF_ESTATE_REF = "tambsukbyoldkrxnmvpa";
const forbidden = new Set(["postgres", "anon", "authenticated", "service_role", "authenticator"]);
export function checkTarget(connectionString, expectedRole) {
  if (!connectionString || !expectedRole || !expectedRole.trim()) throw Error("MISSING_PRIVATE_CONNECTION_CONFIGURATION");
  if (forbidden.has(expectedRole)) throw Error("PRIVILEGED_OR_API_ROLE_FORBIDDEN");
  let u;
  try { u = new URL(connectionString); } catch { throw Error("INVALID_CONNECTION_CONFIGURATION"); }
  if (!["postgres:", "postgresql:"].includes(u.protocol)) throw Error("INVALID_DATABASE_PROTOCOL");
  // Direct Supabase host contains the project ref; pooler user contains it.
  const identity = decodeURIComponent(u.username || "") + "@" + u.hostname;
  if (!identity.includes(FF_ESTATE_REF)) throw Error("TARGET_PROJECT_NOT_VERIFIED");
  const sslmode = u.searchParams.get("sslmode");
  if (!["require", "verify-full"].includes(sslmode)) throw Error("TLS_REQUIRED");
  if (decodeURIComponent(u.username).split(".")[0] !== expectedRole) throw Error("LOGIN_ROLE_MISMATCH");
  return { projectRef: FF_ESTATE_REF, expectedRole };
}
export function verifyAudit(audit, expectedRole) {
  if (!audit || audit.connection_role !== expectedRole) throw Error("DATABASE_ROLE_MISMATCH");
  if (!audit.writer_membership) throw Error("REGISTRY_ROLE_NOT_INHERITED");
  if (audit.table_count !== 4 || audit.rls_enabled_count !== 4 || audit.target_policy_count !== 8) throw Error("SCHEMA_OR_RLS_MISMATCH");
  if (audit.unexpected_policy_count !== 0 || audit.invalid_privilege_count !== 0) throw Error("UNAUTHORIZED_ACCESS_DETECTED");
  if (!audit.role_select || !audit.role_insert || audit.role_update || audit.role_delete) throw Error("WRITE_ROLE_PRIVILEGES_INVALID");
  return true;
}
