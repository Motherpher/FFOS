import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {PgProjectHubStore} from "../src/pg-store.ts";
import {withScopedProjectHubRead} from "../src/scoped-pg.ts";
import {GovernedProjectHubService} from "../src/governed-service.ts";

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
 } finally {await pool.end();}
});
