/** Manual, read-only remote connection admission. NEVER prints secrets. */
import { checkTarget, verifyAudit } from "./live-admission-contract.mjs";
import { createAgentStablePool } from "../src/pg-driver.ts";

const conn = process.env.FFOS_DATABASE_URL;
const expected = process.env.FFOS_EXPECTED_LOGIN_ROLE;
try {
  checkTarget(conn,expected);
} catch(e) {
  console.error("FFOS admission BLOCKED:",e.message);
  process.exitCode=2;
}
if (process.exitCode) process.exit();
const pool=createAgentStablePool(conn);
let client;
try {
  client=await pool.connect();
  await client.query("BEGIN READ ONLY");
  const result=await client.query(`
SELECT
 current_user AS connection_role,
 pg_has_role(current_user,'ffos_registry_writer','USAGE') AS writer_membership,
 (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='ffos' AND c.relkind='r' AND c.relname IN
  ('data_work_orders','data_asset_versions','data_reuse_decisions','data_work_order_asset_links')) AS table_count,
 (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='ffos' AND c.relkind='r' AND c.relrowsecurity
    AND c.relname IN ('data_work_orders','data_asset_versions','data_reuse_decisions','data_work_order_asset_links')) AS rls_enabled_count,
 (SELECT count(*)::int FROM pg_policies WHERE schemaname='ffos' AND roles=ARRAY['ffos_registry_writer']::name[]) AS target_policy_count,
 (SELECT count(*)::int FROM pg_policies WHERE schemaname='ffos' AND roles<>ARRAY['ffos_registry_writer']::name[]) AS unexpected_policy_count,
 (SELECT count(*)::int FROM pg_roles r WHERE r.rolname IN ('anon','authenticated','service_role')
   AND (has_schema_privilege(r.rolname,'ffos','USAGE') OR
   has_table_privilege(r.rolname,'ffos.data_work_orders','SELECT,INSERT') OR
   has_table_privilege(r.rolname,'ffos.data_asset_versions','SELECT,INSERT') OR
   has_table_privilege(r.rolname,'ffos.data_reuse_decisions','SELECT,INSERT') OR
   has_table_privilege(r.rolname,'ffos.data_work_order_asset_links','SELECT,INSERT'))) AS invalid_privilege_count,
 has_table_privilege(current_user,'ffos.data_work_orders','SELECT') AS role_select,
 has_table_privilege(current_user,'ffos.data_work_orders','INSERT') AS role_insert,
 has_table_privilege(current_user,'ffos.data_work_orders','UPDATE') AS role_update,
 has_table_privilege(current_user,'ffos.data_work_orders','DELETE') AS role_delete
`);
  const data=result.rows[0];
  verifyAudit(data,expected);
  await client.query("COMMIT");
  console.log(JSON.stringify({status:"PASS",target:"FF Estate",role_verified:true,rls:true,policies:true,forbidden_roles_denied:true,action:"READ_ONLY_ADMISSION",runtime_connected:false}));
} catch(e) {
  if(client) try {await client.query("ROLLBACK")} catch {}
  // Never print raw database/driver errors: they can include connection strings.
  const safe=e.message && /^(DATABASE_ROLE_MISMATCH|REGISTRY_ROLE_NOT_INHERITED|SCHEMA_OR_RLS_MISMATCH|UNAUTHORIZED_ACCESS_DETECTED|WRITE_ROLE_PRIVILEGES_INVALID)$/.test(e.message) ? e.message : "CONNECTION_OR_SQL_FAILURE";
  console.error("FFOS admission BLOCKED:",safe);
  process.exitCode=1;
} finally {
  client?.release();
  await pool.end();
}
