// FFOS ProjectHub WP02: real Next.js HTTP -> restricted live Supabase read.
// Safe acceptance evidence only. Never log session cookies, credentials, DSNs,
// CDX SPETL or personal/project data. Test no-existent project: zero writes.
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
const origin="http://127.0.0.1:31981";
const projectId="FFOS-WP02-NONEXISTENT-READ-CANARY";
const projectPath="/api/projecthub/projects/"+projectId;
const report={
 schema:"ffos.projecthub.http-read-acceptance.v1", outcome:"HOLD",
 server_ready:false, anonymous_denied:false, bad_session_denied:false,
 bad_credentials_denied:false, valid_director_session:false,
 db_backed_unknown_project_404:false, db_backed_positive_project_200:false,
 portfolio_blocked:false,
 write_api_blocked:false, oversize_scope_blocked:false
};
const get=(path,cookie)=>fetch(origin+path,{
 method:"GET",headers:cookie?{cookie}:undefined,redirect:"manual",
 signal:AbortSignal.timeout(15000)
});
let step="SERVER_READY";
try{
 let ready=false;
 for(let n=0;n<45;n++){
   try{
     const r=await get("/login");
     if(r.status===200){ready=true;break}
   }catch{}
   await delay(1000);
 }
 assert(ready,"NEXT_SERVER_UNAVAILABLE");
 report.server_ready=true;
 step="ANONYMOUS_DENY";
 const anonymous=await get(projectPath);
 assert([302,303,307,308].includes(anonymous.status),"ANONYMOUS_NOT_REDIRECTED");
 assert(new URL(anonymous.headers.get("location"),origin).pathname==="/login","UNSAFE_ANONYMOUS_REDIRECT");
 report.anonymous_denied=true;
 step="BAD_SESSION_DENY";
 const bad=await get(projectPath,"ffos_session=invalid-signed-cookie");
 assert([302,303,307,308].includes(bad.status),"TAMPERED_SESSION_NOT_REJECTED");
 report.bad_session_denied=true;
 step="BAD_CREDENTIALS_DENY";
 const badForm=new URLSearchParams({
   user:process.env.FFOS_DIRECTOR_USER??"",
   password:"incorrect",
   next:projectPath
 });
 const failedLogin=await fetch(origin+"/api/session",{
   method:"POST",body:badForm,redirect:"manual",signal:AbortSignal.timeout(15000)
 });
 assert([303,401].includes(failedLogin.status),"INVALID_CREDENTIALS_NOT_REJECTED");
 assert(!failedLogin.headers.get("set-cookie")?.includes("ffos_session="),"INVALID_CREDENTIALS_SET_SESSION");
 report.bad_credentials_denied=true;
 step="DIRECTOR_LOGIN";
 assert(process.env.FFOS_DIRECTOR_USER&&process.env.FFOS_DIRECTOR_PASSWORD,"MISSING_EPHEMERAL_DIRECTOR_CREDENTIALS");
 const loginForm=new URLSearchParams({
   user:process.env.FFOS_DIRECTOR_USER,
   password:process.env.FFOS_DIRECTOR_PASSWORD,
   next:projectPath
 });
 const login=await fetch(origin+"/api/session",{
   method:"POST",body:loginForm,redirect:"manual",signal:AbortSignal.timeout(15000)
 });
 assert.equal(login.status,303,"DIRECTOR_SESSION_NOT_GRANTED");
 const setCookie=login.headers.get("set-cookie")??"";
 assert(/(?:^|\s|;)ffos_session=/.test(setCookie),"SIGNED_SESSION_MISSING");
 assert(/httponly/i.test(setCookie),"SESSION_COOKIE_NOT_HTTPONLY");
 assert(/samesite=strict/i.test(setCookie),"SESSION_COOKIE_NOT_STRICT");
 assert(/secure/i.test(setCookie),"SESSION_COOKIE_NOT_SECURE");
 const cookie=setCookie.split(";")[0];
 report.valid_director_session=true;
 step="DB_BACKED_HTTP_READ";
 const project=await get(projectPath,cookie);
 assert.equal(project.status,404,"PROJECT_HTTP_READ_DID_NOT_RETURN_NOT_FOUND");
 const payload=await project.json();
 assert.equal(payload.status,"NOT_FOUND","PROJECT_READ_NOT_DB_BACKED_NOT_FOUND");
 report.db_backed_unknown_project_404=true;
 if(process.env.FFOS_WP02_LOCAL_FIXTURE_ID){
   step="POSITIVE_SYNTHETIC_PROJECT_READ";
   const fixture=await get("/api/projecthub/projects/"+process.env.FFOS_WP02_LOCAL_FIXTURE_ID,cookie);
   assert.equal(fixture.status,200,"SYNTHETIC_PROJECT_READ_DID_NOT_SUCCEED");
   const response=await fixture.json();
   assert.equal(response.status,"OK");
   assert.equal(response.project?.id,process.env.FFOS_WP02_LOCAL_FIXTURE_ID);
   report.db_backed_positive_project_200=true;
 }
 step="PORTFOLIO_DISABLED";
 const portfolio=await get("/api/projecthub/projects",cookie);
 assert.equal(portfolio.status,503,"UNSCOPED_PORTFOLIO_NOT_BLOCKED");
 const portfolioPayload=await portfolio.json();
 assert.equal(portfolioPayload.reason,"PROJECTHUB_PORTFOLIO_QUERY_NOT_ADMITTED");
 report.portfolio_blocked=true;
 step="MUTATIONS_DISABLED";
 const write=await fetch(origin+"/api/projecthub/projects",{
   method:"POST",redirect:"manual",
   headers:{cookie,"Idempotency-Key":"WP02-CANARY-NO-WRITES","Content-Type":"application/json"},
   body:JSON.stringify({id:"NEVER-CREATE-WP02-CANARY"}),signal:AbortSignal.timeout(15000)
 });
 assert.equal(write.status,503,"PROJECTHUB_WRITE_ROUTE_NOT_BLOCKED");
 report.write_api_blocked=true;
 step="INVALID_PROJECT_SCOPE";
 const invalid=await get("/api/projecthub/projects/"+ "X".repeat(300),cookie);
 assert.equal(invalid.status,503,"OVERSIZE_SCOPE_NOT_BLOCKED");
 report.oversize_scope_blocked=true;
 report.outcome="PASS";
 console.log(JSON.stringify(report));
}catch{
 // No provider error or HTTP response bodies: they may contain credentials.
 console.error(JSON.stringify({...report,step}));
 process.exitCode=1;
}
