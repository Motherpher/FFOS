import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {PgProjectHubStore} from "../src/pg-store.ts";
import {withScopedProjectHubRead,withScopedProjectHubWrite} from "../src/scoped-pg.ts";
import {GovernedProjectHubService} from "../src/governed-service.ts";
import {ScopedPgProjectHubStore} from "../src/scoped-store.ts";
import {StoreEffectEvidenceWriter} from "../src/effect-evidence.ts";
import {MemoryEffectEvidence,ProjectHubEffectGate} from "../src/effect-gate.ts";
import {FFOSCdxProjectHubPort} from "../../../integrations/cdx/projecthub-runtime.ts";

const url=process.env.PROJECTHUB_TEST_DATABASE_URL;
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../../..");
const allowGate={executeA3:async (_c:any,_i:any,perform:any)=>perform()};
const ctx=(key)=>({principalRef:"FFOS:DIRECTOR",principalClass:"DIRECTOR",authorityRef:"AUTH:D",
 mandateRef:"MANDATE:PH",idempotencyKey:key,correlationId:"C-"+key,causationId:"K-"+key});

test("PostgreSQL: atomic ProjectHub write and append-only history",{skip:!url},async()=>{
 const {Pool}=await import("pg");const pool=new Pool({connectionString:url});
 try{
   await pool.query(await readFile(resolve(root,"packages/registry/migrations/0008_projecthub.sql"),"utf8"));
   await pool.query(await readFile(resolve(root,"packages/registry/migrations/0009_projecthub_runtime_role.sql"),"utf8"));
   await pool.query(await readFile(resolve(root,"packages/registry/migrations/0010_projecthub_readonly_role.sql"),"utf8"));
   await pool.query(await readFile(resolve(root,"packages/registry/migrations/0011_projecthub_writer_login_principal.sql"),"utf8"));
   const writerPrincipal=await pool.query(`
     select m.rolcanlogin,m.rolinherit,m.rolbypassrls,
            r.rolname as granted_role,am.inherit_option,am.set_option
     from pg_catalog.pg_roles m
     join pg_catalog.pg_auth_members am on am.member=m.oid
     join pg_catalog.pg_roles r on r.oid=am.roleid
     where m.rolname='ffos_projecthub_writer_login'
   `);
   assert.equal(writerPrincipal.rows.length,1);
   assert.equal(writerPrincipal.rows[0].rolcanlogin,false);
   assert.equal(writerPrincipal.rows[0].rolinherit,false);
   assert.equal(writerPrincipal.rows[0].rolbypassrls,false);
   assert.equal(writerPrincipal.rows[0].granted_role,"ffos_projecthub_runtime");
   assert.equal(writerPrincipal.rows[0].inherit_option,false);
   assert.equal(writerPrincipal.rows[0].set_option,true);

   const directWriterPrivilege=await pool.query(`
     select has_table_privilege('ffos_projecthub_writer_login','ffos.projecthub_projects','SELECT') as sel,
            has_table_privilege('ffos_projecthub_writer_login','ffos.projecthub_projects','INSERT') as ins
   `);
   assert.equal(directWriterPrivilege.rows[0].sel,false);
   assert.equal(directWriterPrivilege.rows[0].ins,false);

   const store=new PgProjectHubStore(pool);const svc=new GovernedProjectHubService(store,allowGate as any);
   await svc.createProject(ctx("CREATE"),{id:"PG-P1",title:"PG",ownerRef:"OWNER",mandateRef:"M",
     methodologyProfile:"PROJECT_NATIVE",purpose:"Test",createdBy:"FFOS:DIRECTOR"});
   await svc.setField(ctx("FIELD"),"PG-P1","Need","DRAFT",{note:"test"});
   const p=await store.getProject("PG-P1");assert.equal(p.version,2);
   // Read-only scoped adapter always uses a single transaction/connection.
   const scopedProject=await withScopedProjectHubRead(pool,"PG-P1",store=>store.getProject("PG-P1"));
   assert.equal(scopedProject?.id,"PG-P1");
   const foreignProject=await withScopedProjectHubRead(pool,"UNRELATED",store=>store.getProject("PG-P1"));
   assert.equal(foreignProject,null);
   await assert.rejects(
     ()=>withScopedProjectHubRead(pool,"PG-P1",store=>store.appendProject(p)),
     /read-only transaction/i
   );
   await assert.rejects(
     ()=>withScopedProjectHubRead(pool,"",store=>store.getProject("PG-P1")),
     /PROJECT_SCOPE_REQUIRED/
   );
   assert.equal((await store.listAuditEvents("PG-P1")).length,2);
   // Reader can see only its project's rows; it cannot append anything.
   const reader=await pool.connect();
   try {
     await reader.query("BEGIN");
     await reader.query("SET LOCAL ROLE ffos_projecthub_reader");
     await reader.query("SELECT set_config('ffos.project_scope',$1,true)",["PG-P1"]);
     const rows=await reader.query("SELECT DISTINCT project_id FROM ffos.projecthub_projects");
     assert.equal(rows.rows.length,1);
     await assert.rejects(()=>reader.query(`INSERT INTO ffos.projecthub_idempotency
       (idempotency_key,project_id,operation,command_digest,result,recorded_at)
       VALUES ('reader-must-not-write','PG-P1','TEST',$1,'{}'::jsonb,now())`,["f".repeat(64)]),
       /permission denied/i);
   } finally {await reader.query("ROLLBACK");reader.release();}
   // A scoped NOLOGIN role is an internal execution privilege only.
   // No scope => zero rows; setting a different scope cannot read PG-P1.
   for (const [scope,expected] of [["",0],["OTHER-PROJECT",0],["PG-P1",1]] as const) {
     const client=await pool.connect();
     try {
       await client.query("BEGIN");
       await client.query("SET LOCAL ROLE ffos_projecthub_runtime");
       if(scope)await client.query("SELECT set_config('ffos.project_scope',$1,true)",[scope]);
       const read=await client.query("SELECT DISTINCT project_id FROM ffos.projecthub_projects");
       assert.equal(read.rows.length,expected);
     } finally { await client.query("ROLLBACK");client.release(); }
   }
   // INSERT for a different project is blocked by RLS without changing fixtures.
   const scoped=await pool.connect();
   try {
     await scoped.query("BEGIN");
     await scoped.query("SET LOCAL ROLE ffos_projecthub_runtime");
     await scoped.query("SELECT set_config('ffos.project_scope',$1,true)",["OTHER-PROJECT"]);
     await assert.rejects(()=>scoped.query(`insert into ffos.projecthub_idempotency
       (idempotency_key,project_id,operation,command_digest,result,recorded_at)
       values ('scope-violation','PG-P1','TEST',$1,'{}'::jsonb,now())`,["a".repeat(64)]),
       /row-level security/i);
   } finally {await scoped.query("ROLLBACK");scoped.release();}
   await assert.rejects(()=>pool.query("delete from ffos.projecthub_events where project_id=$1",["PG-P1"]),/append-only/);

   // Unique idempotency and DB transaction rollback: the conflicting insert rolls the event back.
   const before=(await store.listAuditEvents("PG-P1")).length;
   await assert.rejects(()=>store.transaction(async tx=>{
     await tx.appendAuditEvent({eventId:"ROLLBACK-E",projectId:"PG-P1",objectId:"PG-P1",eventType:"ROLLBACK",
       principalRef:"D",authorityRef:"A",mandateRef:"M",commandId:"RB",correlationId:"C",causationId:"K",
       dataClass:"PH-D1",occurredAt:new Date().toISOString(),payload:{},provenance:[]});
     await tx.appendIdempotency({idempotencyKey:"CREATE",projectId:"PG-P1",operation:"X",
       commandDigest:"a".repeat(64),result:{},recordedAt:new Date().toISOString()});
   }));
   assert.equal((await store.listAuditEvents("PG-P1")).length,before);

   // Production-candidate scoped writer: successful canonical command commits
   // state + audit + idempotency inside the exact bound project scope.
   const scopedWrite=await withScopedProjectHubWrite(pool,"PG-W1",async scopedStore=>{
     const scopedSvc=new GovernedProjectHubService(scopedStore,allowGate as any);
     return scopedSvc.createProject(ctx("SCOPED-CREATE"),{
       id:"PG-W1",title:"Scoped writer",ownerRef:"OWNER",mandateRef:"M",
       methodologyProfile:"PROJECT_NATIVE",purpose:"Scoped write acceptance fixture",createdBy:"FFOS:DIRECTOR"
     });
   });
   assert.equal(scopedWrite.result.id,"PG-W1");
   assert.equal(scopedWrite.replayed,false);
   const scopedWrittenRead=await withScopedProjectHubRead(pool,"PG-W1",s=>s.getProject("PG-W1"));
   assert.equal(scopedWrittenRead?.id,"PG-W1");
   assert.equal((await store.listAuditEvents("PG-W1")).length,1);

   // A callback failure rolls back every canonical row from the scoped UoW.
   await assert.rejects(()=>withScopedProjectHubWrite(pool,"PG-RB",async scopedStore=>{
     const scopedSvc=new GovernedProjectHubService(scopedStore,allowGate as any);
     await scopedSvc.createProject(ctx("SCOPED-ROLLBACK"),{
       id:"PG-RB",title:"Rollback",ownerRef:"OWNER",mandateRef:"M",
       methodologyProfile:"PROJECT_NATIVE",purpose:"Rollback fixture",createdBy:"FFOS:DIRECTOR"
     });
     throw new Error("FORCED_SCOPED_WRITE_ROLLBACK");
   }),/FORCED_SCOPED_WRITE_ROLLBACK/);
   assert.equal(await store.getProject("PG-RB"),null);
   assert.equal((await store.listAuditEvents("PG-RB")).length,0);
   assert.equal(await store.getIdempotency("SCOPED-ROLLBACK"),null);

   // Binding one project scope cannot append another project's canonical state.
   await assert.rejects(()=>withScopedProjectHubWrite(pool,"PG-SCOPE-A",async scopedStore=>{
     const scopedSvc=new GovernedProjectHubService(scopedStore,allowGate as any);
     return scopedSvc.createProject(ctx("SCOPED-CROSS"),{
       id:"PG-SCOPE-B",title:"Wrong scope",ownerRef:"OWNER",mandateRef:"M",
       methodologyProfile:"PROJECT_NATIVE",purpose:"Must fail RLS",createdBy:"FFOS:DIRECTOR"
     });
   }),/row-level security/i);
   assert.equal(await store.getProject("PG-SCOPE-B"),null);

   await assert.rejects(
     ()=>withScopedProjectHubWrite(pool,"",async()=>true),
     /PROJECT_SCOPE_REQUIRED/
   );

   // Integration of the scoped writer with the actual pinned FFOS CDX adapter.
   const effectEvidence=new MemoryEffectEvidence();
   const actualGate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort(),effectEvidence);
   const cdxWrite=await withScopedProjectHubWrite(pool,"PG-CDX",async scopedStore=>{
     return new GovernedProjectHubService(scopedStore,actualGate).createProject(ctx("SCOPED-CDX"),{
       id:"PG-CDX",title:"CDX scoped writer",ownerRef:"OWNER",mandateRef:"M",
       methodologyProfile:"PROJECT_NATIVE",purpose:"Pinned CDX integration fixture",createdBy:"FFOS:DIRECTOR"
     });
   });
   assert.equal(cdxWrite.result.id,"PG-CDX");
   assert.deepEqual(effectEvidence.events.map((e:any)=>e.stage),["PRE_EFFECT","POST_EFFECT"]);
   assert.equal((await store.listAuditEvents("PG-CDX")).length,1);

   // Policy-unavailable must fail closed and leave no canonical project state.
   const unavailableEvidence=new MemoryEffectEvidence();
   const unavailableGate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort("UNAVAILABLE"),unavailableEvidence);
   await assert.rejects(()=>withScopedProjectHubWrite(pool,"PG-CDX-BLOCK",async scopedStore=>{
     return new GovernedProjectHubService(scopedStore,unavailableGate).createProject(ctx("SCOPED-CDX-BLOCK"),{
       id:"PG-CDX-BLOCK",title:"Blocked",ownerRef:"OWNER",mandateRef:"M",
       methodologyProfile:"PROJECT_NATIVE",purpose:"Must fail closed",createdBy:"FFOS:DIRECTOR"
     });
   }),/PROJECTHUB_CDX_SECURITY_STOP/);
   assert.equal(await store.getProject("PG-CDX-BLOCK"),null);

   // PH-D4 stays outside the production admission even under an otherwise valid scope.
   await assert.rejects(()=>withScopedProjectHubWrite(pool,"PG-D4",async scopedStore=>{
     return new GovernedProjectHubService(scopedStore,actualGate).createProject(ctx("SCOPED-D4"),{
       id:"PG-D4",title:"Sensitive",ownerRef:"OWNER",mandateRef:"M",
       methodologyProfile:"PROJECT_NATIVE",purpose:"Must remain unadmitted",createdBy:"FFOS:DIRECTOR",
       dataClassCeiling:"PH-D4"
     });
   }),/PROJECT_DATA_CLASS_NOT_ADMITTED_V1/);
   assert.equal(await store.getProject("PG-D4"),null);

   // Full production-candidate sequence: durable PRE_EFFECT, committed canonical
   // UoW, then durable POST_EFFECT. The scoped facade itself cannot append
   // outside transaction().
   const prodCtx=ctx("PROD-CDX-CREATE");
   const prodStore=new ScopedPgProjectHubStore(pool,"PG-PROD");
   await assert.rejects(
     ()=>prodStore.appendAuditEvent({
       eventId:"OUTSIDE-TX",projectId:"PG-PROD",objectId:"PG-PROD",eventType:"INVALID",
       principalRef:"D",authorityRef:"A",mandateRef:"M",commandId:"X",correlationId:"C",causationId:"K",
       dataClass:"PH-D1",occurredAt:new Date().toISOString(),payload:{},provenance:[]
     }),
     /SCOPED_PROJECTHUB_WRITE_REQUIRES_TRANSACTION/
   );
   const prodEvidence=new StoreEffectEvidenceWriter(prodStore,prodCtx);
   const prodGate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort(),prodEvidence);
   const prodSvc=new GovernedProjectHubService(prodStore,prodGate);
   const prodCreated=await prodSvc.createProject(prodCtx,{
     id:"PG-PROD",title:"Production candidate",ownerRef:"OWNER",mandateRef:"M",
     methodologyProfile:"PROJECT_NATIVE",purpose:"Durable effect evidence fixture",createdBy:"FFOS:DIRECTOR"
   });
   assert.equal(prodCreated.result.id,"PG-PROD");
   const prodEvents=await store.listAuditEvents("PG-PROD");
   assert.deepEqual(prodEvents.map(e=>e.eventType),[
     "PROJECTHUB_EFFECT_PRE_EFFECT","PROJECT_CREATED","PROJECTHUB_EFFECT_POST_EFFECT"
   ]);
   assert.equal((await store.getProject("PG-PROD"))?.version,1);

   // A canonical failure occurs after PRE_EFFECT, rolls back state/idempotency,
   // and still leaves a durable POST_EFFECT failure receipt.
   const failCtx=ctx("PROD-CDX-FAIL");
   const failEvidence=new StoreEffectEvidenceWriter(new ScopedPgProjectHubStore(pool,"PG-PROD"),failCtx);
   const failGate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort(),failEvidence);
   const failSvc=new GovernedProjectHubService(new ScopedPgProjectHubStore(pool,"PG-PROD"),failGate);
   await assert.rejects(()=>failSvc.createProject(failCtx,{
     id:"PG-PROD",title:"Duplicate",ownerRef:"OWNER",mandateRef:"M",
     methodologyProfile:"PROJECT_NATIVE",purpose:"Must roll back",createdBy:"FFOS:DIRECTOR"
   }),/PROJECT_ALREADY_EXISTS/);
   assert.equal((await store.getProject("PG-PROD"))?.version,1);
   assert.equal(await store.getIdempotency("PROD-CDX-FAIL"),null);
   const afterFail=await store.listAuditEvents("PG-PROD");
   assert.deepEqual(afterFail.slice(-2).map(e=>e.eventType),[
     "PROJECTHUB_EFFECT_PRE_EFFECT","PROJECTHUB_EFFECT_POST_EFFECT"
   ]);
   assert.match(String(afterFail.at(-1)?.payload.detail),/failed or rolled back/i);
 } finally {await pool.end();}
});
