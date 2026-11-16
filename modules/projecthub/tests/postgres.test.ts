import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {PgProjectHubStore} from "../src/pg-store.ts";
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
   const store=new PgProjectHubStore(pool);const svc=new GovernedProjectHubService(store,allowGate as any);
   await svc.createProject(ctx("CREATE"),{id:"PG-P1",title:"PG",ownerRef:"OWNER",mandateRef:"M",
     methodologyProfile:"PROJECT_NATIVE",purpose:"Test",createdBy:"FFOS:DIRECTOR"});
   await svc.setField(ctx("FIELD"),"PG-P1","Need","DRAFT",{note:"test"});
   const p=await store.getProject("PG-P1");assert.equal(p.version,2);
   assert.equal((await store.listAuditEvents("PG-P1")).length,2);
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
