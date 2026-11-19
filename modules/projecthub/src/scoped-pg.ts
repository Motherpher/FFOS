import {PgProjectHubStore,type SqlPool,type SqlClient} from "./pg-store.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

function assertProjectScope(projectId:string){
  if(typeof projectId!=="string"||!projectId.trim()||projectId.length>256)
    throw new ProjectHubInvariantError("PROJECT_SCOPE_REQUIRED");
}

async function bindScopedRole(client:SqlClient,roleName:"ffos_projecthub_reader"|"ffos_projecthub_runtime",projectId:string){
  await client.query(`SET LOCAL ROLE ${roleName}`);
  const role=await client.query("SELECT current_user AS role");
  if(role.rows[0]?.role!==roleName)
    throw new ProjectHubInvariantError("PROJECTHUB_RESTRICTED_ROLE_NOT_BOUND");
  await client.query("SELECT set_config('ffos.project_scope',$1,true)",[projectId]);
  const current=await client.query("SELECT current_setting('ffos.project_scope',true) AS scope");
  if(current.rows[0]?.scope!==projectId)
    throw new ProjectHubInvariantError("PROJECTHUB_SCOPE_NOT_BOUND");
}

/**
 * Open a DB transaction before selecting the restricted, NOLOGIN read-only role
 * and its project scope. All queries MUST run through this single connection.
 * This helper does not authorize a project, authenticate a Director or supply
 * CDX A3 evidence. Its caller must complete those checks independently.
 */
export async function withScopedProjectHubRead<T>(
  pool:SqlPool,
  projectId:string,
  read:(store:PgProjectHubStore)=>Promise<T>,
):Promise<T>{
  assertProjectScope(projectId);
  const client:SqlClient=await pool.connect();
  let begun=false;
  try{
    await client.query("BEGIN READ ONLY");
    begun=true;
    await bindScopedRole(client,"ffos_projecthub_reader",projectId);
    const result=await read(new PgProjectHubStore(client,true));
    await client.query("COMMIT");
    begun=false;
    return result;
  }catch(error){
    if(begun)try{await client.query("ROLLBACK");}catch{}
    throw error;
  }finally{client.release?.();}
}

/**
 * Production-candidate ProjectHub append transaction.
 *
 * This primitive is deliberately narrower than "write access":
 * - caller authentication, local ProjectHub rights and CDX A3 evidence remain mandatory;
 * - the backend LOGIN must have no direct ProjectHub table privileges and may only
 *   SET LOCAL ROLE to ffos_projecthub_runtime;
 * - one project scope is bound for the entire transaction;
 * - the callback receives a transaction-bound store so canonical state, audit and
 *   idempotency rows commit or roll back together.
 *
 * This helper does not by itself authorize production writes and must remain behind
 * the ProjectHub production admission gate until the dedicated writer identity and
 * CDX canary are independently accepted.
 */
export async function withScopedProjectHubWrite<T>(
  pool:SqlPool,
  projectId:string,
  write:(store:PgProjectHubStore)=>Promise<T>,
):Promise<T>{
  assertProjectScope(projectId);
  const client:SqlClient=await pool.connect();
  let begun=false;
  try{
    await client.query("BEGIN");
    begun=true;
    const mode=await client.query("SHOW transaction_read_only");
    if(String(mode.rows[0]?.transaction_read_only??"").toLowerCase()!=="off")
      throw new ProjectHubInvariantError("PROJECTHUB_WRITE_TRANSACTION_NOT_READ_WRITE");
    await bindScopedRole(client,"ffos_projecthub_runtime",projectId);
    const result=await write(new PgProjectHubStore(client,true));
    await client.query("COMMIT");
    begun=false;
    return result;
  }catch(error){
    if(begun)try{await client.query("ROLLBACK");}catch{}
    throw error;
  }finally{client.release?.();}
}
