import {PgProjectHubStore,type SqlPool,type SqlClient} from "./pg-store.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

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
  if(typeof projectId!=="string"||!projectId.trim()||projectId.length>256)
    throw new ProjectHubInvariantError("PROJECT_SCOPE_REQUIRED");
  const client:SqlClient=await pool.connect();
  let begun=false;
  try{
    await client.query("BEGIN READ ONLY");
    begun=true;
    await client.query("SET LOCAL ROLE ffos_projecthub_reader");
    const role=await client.query("SELECT current_user AS role");
    if(role.rows[0]?.role!=="ffos_projecthub_reader")
      throw new ProjectHubInvariantError("PROJECTHUB_RESTRICTED_ROLE_NOT_BOUND");
    await client.query("SELECT set_config('ffos.project_scope',$1,true)",[projectId]);
    const current=await client.query("SELECT current_setting('ffos.project_scope',true) AS scope");
    if(current.rows[0]?.scope!==projectId)
      throw new ProjectHubInvariantError("PROJECTHUB_SCOPE_NOT_BOUND");
    // Store is read-only for the lifetime of this transaction. No queries
    // escape the bound connection, and the scope disappears at transaction end.
    const result=await read(new PgProjectHubStore(client,true));
    await client.query("COMMIT");
    begun=false;
    return result;
  }catch(error){
    if(begun)try{await client.query("ROLLBACK");}catch{}
    throw error;
  }finally{client.release?.();}
}
