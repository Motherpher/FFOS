// Read-only live DB acceptance. Never print DSN, secrets, SQL parameters,
// connection errors or project data. No permanent writes or DDL.
import assert from "node:assert/strict";
import {Pool} from "pg";
const url=process.env.FFOS_PROJECTHUB_READ_DATABASE_URL;
if(!url)throw new Error("HOLD: restricted read-only connection secret absent");
const clientUrl=new URL(url);
assert.ok(["postgres:","postgresql:"].includes(clientUrl.protocol),"Invalid protocol");
assert.ok(/\.supabase\.com$/.test(clientUrl.hostname),"Unexpected database host");
assert.equal(clientUrl.username.split(".")[0],"ffos_projecthub_reader_login","Unexpected database login identity");
const pool=new Pool({
 connectionString:url,ssl:{rejectUnauthorized:true},max:1,
 connectionTimeoutMillis:7500,statement_timeout:7500,
 application_name:"ffos-projecthub-read-canary"
});
const report={schema:"ffos.projecthub.read-canary.v1",outcome:"HOLD",
  login_verified:false,role_verified:false,scope_verified:false,
  writer_denied:false,zero_rows_without_scope:false,zero_rows_with_nonexistent_scope:false};
try{
 const c=await pool.connect();
 try {
   const identity=await c.query("select session_user, current_user");
   assert.equal(identity.rows[0].session_user,"ffos_projecthub_reader_login");
   assert.equal(identity.rows[0].current_user,"ffos_projecthub_reader_login");
   report.login_verified=true;
   // The login itself has no access to ProjectHub; role and scope are required.
   let blocked=false;
   try{await c.query("SELECT 1 FROM ffos.projecthub_projects LIMIT 1");}
   catch{blocked=true;}
   assert.equal(blocked,true,"Login can bypass the restricted reader role");
   report.writer_denied=true;
   await c.query("BEGIN READ ONLY");
   try {
     await c.query("SET LOCAL ROLE ffos_projecthub_reader");
     const e=await c.query("SELECT current_user AS role");
     assert.equal(e.rows[0].role,"ffos_projecthub_reader");
     report.role_verified=true;
     const noScope=await c.query("SELECT project_id FROM ffos.projecthub_projects LIMIT 1");
     assert.equal(noScope.rows.length,0);
     report.zero_rows_without_scope=true;
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
}catch{
 // Fail closed: redact provider errors; do not leak URL, password or records.
 console.error(JSON.stringify(report));
 process.exitCode=1;
}finally{await pool.end();}
