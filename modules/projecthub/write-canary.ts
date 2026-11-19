// ProjectHub production writer canary.
//
// This test is intentionally rollback-only. It verifies the protected backend
// login, exact scoped capability role, actual pinned CDX A3 decision and RLS
// isolation without leaving synthetic ProjectHub rows in FF Estate.
//
// Never print DSN, credentials, provider error messages or project data.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {Pool} from "pg";
import {
  MemoryEffectEvidence,ProjectHubEffectGate
} from "./src/effect-gate.ts";
import {
  withScopedProjectHubRuntimeRead,withScopedProjectHubWrite
} from "./src/scoped-pg.ts";
import {FFOSCdxProjectHubPort} from "../../integrations/cdx/projecthub-runtime.ts";

const url=process.env.FFOS_PROJECTHUB_WRITE_DATABASE_URL;
if(!url)throw new Error("HOLD: restricted writer connection secret absent");

const clientUrl=new URL(url);
assert.ok(["postgres:","postgresql:"].includes(clientUrl.protocol),"Invalid protocol");
assert.equal(clientUrl.hostname,"aws-0-eu-central-1.pooler.supabase.com","Unexpected pooler hostname");
assert.equal(clientUrl.port,"5432","Unexpected pooler port (session mode required)");
assert.equal(clientUrl.pathname,"/postgres","Unexpected database name");
assert.equal(
  clientUrl.username,
  "ffos_projecthub_writer_login.tambsukbyoldkrxnmvpa",
  "Unexpected database login"
);
for(const key of ["sslmode","sslrootcert","sslcert","sslkey","uselibpqcompat"]){
  if(clientUrl.searchParams.has(key))
    throw new Error("HOLD: DSN contains SSL settings that could override the pinned CA");
}
if(!process.env.NODE_EXTRA_CA_CERTS)
  throw new Error("HOLD: verified Supabase CA not configured");

const pool=new Pool({
  connectionString:url,ssl:{rejectUnauthorized:true},max:1,
  connectionTimeoutMillis:7500,statement_timeout:7500,
  application_name:"ffos-projecthub-write-canary"
});

const safeCodes=new Set([
  "28P01","28000","08P01","08001","08006","42501",
  "ECONNREFUSED","ECONNRESET","ETIMEDOUT","ENOTFOUND","EAI_AGAIN",
  "ENETUNREACH","EHOSTUNREACH","ERR_ASSERTION",
  "SELF_SIGNED_CERT_IN_CHAIN","DEPTH_ZERO_SELF_SIGNED_CERT",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE","UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "ERR_TLS_CERT_ALTNAME_INVALID"
]);
const safeCode=(e:any)=>safeCodes.has(e?.code)?e.code:"UNCLASSIFIED";
const digest=(v:string)=>createHash("sha256").update(v).digest("hex");

let stage="CONNECT";
const report={
  schema:"ffos.projecthub.write-canary.v1",
  outcome:"HOLD",
  login_verified:false,
  direct_access_denied:false,
  role_verified:false,
  scope_verified:false,
  cdx_allow_verified:false,
  rollback_verified:false,
  cross_project_denied:false,
  zero_residue_verified:false
};

const scope="FFOS-PROJECTHUB-WRITE-CANARY";
const foreignScope="FFOS-PROJECTHUB-WRITE-CANARY-FOREIGN";
const key="WRITE-CANARY-"+crypto.randomUUID();
const context={
  principalRef:"FFOS:DIRECTOR",
  principalClass:"DIRECTOR" as const,
  authorityRef:"FFOS-AUTH-PHASE0-DIRECTOR",
  mandateRef:"FFOS-DEVOPS-PH-PROD-001",
  idempotencyKey:key,
  correlationId:crypto.randomUUID(),
  causationId:key
};

try{
  const c=await pool.connect();
  try{
    stage="VERIFY_LOGIN_IDENTITY";
    const identity=await c.query("select session_user,current_user");
    assert.equal(identity.rows[0].session_user,"ffos_projecthub_writer_login");
    assert.equal(identity.rows[0].current_user,"ffos_projecthub_writer_login");
    report.login_verified=true;

    stage="VERIFY_DIRECT_ACCESS_DENIED";
    let blocked=false;
    try{await c.query("select 1 from ffos.projecthub_projects limit 1");}
    catch(e:any){if(e?.code==="42501")blocked=true;else throw e;}
    assert.equal(blocked,true,"Writer login has direct ProjectHub table access");
    report.direct_access_denied=true;
  }finally{c.release();}

  stage="VERIFY_SCOPED_ROLE_AND_SCOPE";
  await withScopedProjectHubRuntimeRead(pool,scope,async store=>{
    const result=await store.getProject(scope);
    assert.equal(result,null,"Canary scope unexpectedly contains a project");
  });
  report.role_verified=true;
  report.scope_verified=true;

  stage="VERIFY_PINNED_CDX_AND_ROLLBACK";
  const evidence=new MemoryEffectEvidence();
  const gate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort(),evidence);
  let expectedRollback=false;
  try{
    await gate.executeA3(context,{
      projectId:scope,
      operation:"PROJECT_MUTATE",
      resourceRef:scope,
      localAuthorizationDecisionId:"WRITE-CANARY-LOCAL-AUTH",
      dataMinimization:{
        personalDataPresent:false,
        redactedFields:[],
        rationale:"Rollback-only production writer canary contains no project or personal data."
      }
    },()=>withScopedProjectHubWrite(pool,scope,async store=>{
      await store.appendIdempotency({
        idempotencyKey:key,
        projectId:scope,
        operation:"WRITE_CANARY_ROLLBACK",
        commandDigest:digest("rollback-only"),
        result:{canary:true},
        recordedAt:new Date().toISOString()
      });
      throw new Error("EXPECTED_WRITE_CANARY_ROLLBACK");
    }));
  }catch(e:any){
    if(e?.message==="EXPECTED_WRITE_CANARY_ROLLBACK")expectedRollback=true;
    else throw e;
  }
  assert.equal(expectedRollback,true);
  assert.deepEqual(evidence.events.map((e:any)=>e.stage),["PRE_EFFECT","POST_EFFECT"]);
  assert.ok(["ALLOW","ALLOW_WITH_CONTROLS"].includes(evidence.events[0].decision));
  report.cdx_allow_verified=true;

  const afterRollback=await withScopedProjectHubRuntimeRead(
    pool,scope,store=>store.getIdempotency(key)
  );
  assert.equal(afterRollback,null,"Rollback-only canary left an idempotency row");
  report.rollback_verified=true;
  report.zero_residue_verified=true;

  stage="VERIFY_CROSS_PROJECT_RLS";
  let crossBlocked=false;
  try{
    await withScopedProjectHubWrite(pool,scope,async store=>{
      await store.appendIdempotency({
        idempotencyKey:"FOREIGN-"+crypto.randomUUID(),
        projectId:foreignScope,
        operation:"WRITE_CANARY_CROSS_SCOPE",
        commandDigest:digest("cross-scope"),
        result:{canary:true},
        recordedAt:new Date().toISOString()
      });
    });
  }catch(e:any){
    // Do not emit the provider message. Any failed INSERT must also leave no row.
    if(e)crossBlocked=true;
  }
  assert.equal(crossBlocked,true,"Cross-project insert was not denied");
  report.cross_project_denied=true;

  report.outcome="PASS";
  console.log(JSON.stringify(report));
}catch(error:any){
  console.error(JSON.stringify({...report,stage,error_code:safeCode(error)}));
  process.exitCode=1;
}finally{
  await pool.end();
}
