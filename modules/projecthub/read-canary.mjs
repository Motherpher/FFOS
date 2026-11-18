// Read-only live DB acceptance. Never print DSN, secrets, SQL parameters,
// connection errors or project data. No permanent writes or DDL.
import assert from "node:assert/strict";
import {Pool} from "pg";
const url=process.env.FFOS_PROJECTHUB_READ_DATABASE_URL;
if(!url)throw new Error("HOLD: restricted read-only connection secret absent");
const clientUrl=new URL(url);
assert.ok(["postgres:","postgresql:"].includes(clientUrl.protocol),"Invalid protocol");
assert.equal(clientUrl.hostname,"aws-0-eu-central-1.pooler.supabase.com","Unexpected pooler hostname");
assert.equal(clientUrl.port,"5432","Unexpected pooler port (session mode required)");
assert.equal(clientUrl.pathname,"/postgres","Unexpected database name");
assert.equal(clientUrl.username,"ffos_projecthub_reader_login.tambsukbyoldkrxnmvpa","Unexpected database login");
for(const key of ["sslmode","sslrootcert","sslcert","sslkey","uselibpqcompat"]){
 if(clientUrl.searchParams.has(key))throw new Error("HOLD: DSN contains SSL settings that could override the pinned CA");
}
if(!process.env.NODE_EXTRA_CA_CERTS)throw new Error("HOLD: verified Supabase CA not configured");
const pool=new Pool({
 connectionString:url,ssl:{rejectUnauthorized:true},max:1,
 connectionTimeoutMillis:7500,statement_timeout:7500,
 application_name:"ffos-projecthub-read-canary"
});
const safeCodes=new Set([
  "28P01","28000","08P01","08001","08006","42501",
  "ECONNREFUSED","ECONNRESET","ETIMEDOUT","ENOTFOUND","EAI_AGAIN",
  "ENETUNREACH","EHOSTUNREACH","ERR_ASSERTION",
  "SELF_SIGNED_CERT_IN_CHAIN","DEPTH_ZERO_SELF_SIGNED_CERT",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE","UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "ERR_TLS_CERT_ALTNAME_INVALID"
]);
const safeCode=e=>safeCodes.has(e?.code)?e.code:"UNCLASSIFIED";
let stage="CONNECT";
const report={schema:"ffos.projecthub.read-canary.v1",outcome:"HOLD",
  login_verified:false,role_verified:false,scope_verified:false,
  direct_access_denied:false,zero_rows_without_scope:false,zero_rows_with_nonexistent_scope:false};
try{
 const c=await pool.connect();
 stage="VERIFY_LOGIN_IDENTITY";
 try {
   const identity=await c.query("select session_user, current_user");
   assert.equal(identity.rows[0].session_user,"ffos_projecthub_reader_login");
   assert.equal(identity.rows[0].current_user,"ffos_projecthub_reader_login");
   report.login_verified=true;
   stage="VERIFY_DIRECT_ACCESS_DENIED";
   // The login itself has no access to ProjectHub; role and scope are required.
   let blocked=false;
   try{await c.query("SELECT 1 FROM ffos.projecthub_projects LIMIT 1");}
   catch(e){if(e?.code==="42501")blocked=true;else throw e;}
   assert.equal(blocked,true,"Login can bypass the restricted reader role");
   report.direct_access_denied=true;
   stage="SELECT_RESTRICTED_ROLE";
   await c.query("BEGIN READ ONLY");
   try {
     await c.query("SET LOCAL ROLE ffos_projecthub_reader");
     const e=await c.query("SELECT current_user AS role");
     assert.equal(e.rows[0].role,"ffos_projecthub_reader");
     report.role_verified=true;
     stage="VERIFY_MISSING_SCOPE";
     const noScope=await c.query("SELECT project_id FROM ffos.projecthub_projects LIMIT 1");
     assert.equal(noScope.rows.length,0);
     report.zero_rows_without_scope=true;
     stage="VERIFY_PROJECT_SCOPE";
     const scope="FFOS-READ-CANARY-NO-REAL-DATA";
     await c.query("SELECT set_config('ffos.project_scope',$1,true)",[scope]);
     const setting=await c.query("SELECT current_setting('ffos.project_scope',true) AS scope");
     assert.equal(setting.rows[0].scope,scope);
     report.scope_verified=true;
     const foreign=await c.query("SELECT project_id FROM ffos.projecthub_projects WHERE project_id=$1",[scope]);
     assert.equal(foreign.rows.length,0);
     report.zero_rows_with_nonexistent_scope=true;
     await c.query("ROLLBACK");
   }catch(e){
     try{await c.query("ROLLBACK");}catch{}
     throw e;
   }
 }finally{c.release();}
 report.outcome="PASS";
 console.log(JSON.stringify(report));
}catch(error){
 // Report only allowlisted SQLSTATE / transport codes and a static stage.
 // Never print provider errors or messages: they can contain DSNs or secrets.
 console.error(JSON.stringify({...report,stage,error_code:safeCode(error)}));
 process.exitCode=1;
}finally{await pool.end();}
