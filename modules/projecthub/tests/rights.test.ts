import test from "node:test";
import assert from "node:assert/strict";
import {MemoryProjectHubStore} from "../src/store.ts";
import {GovernedProjectHubService} from "../src/governed-service.ts";
import {makeRoleGrant} from "../src/rights.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

const director=(key:string)=>({principalRef:"FFOS:DIRECTOR",principalClass:"DIRECTOR" as const,
 authorityRef:"AUTH:DIRECTOR",mandateRef:"MANDATE:PH",idempotencyKey:key,correlationId:"C-"+key,causationId:"K-"+key});
const owner=(key:string)=>({principalRef:"USER:OWNER",principalClass:"PROJECT_ROLE" as const,
 authorityRef:"AUTH:OWNER",mandateRef:"MANDATE:P1",idempotencyKey:key,correlationId:"C-"+key,causationId:"K-"+key});
const allowGate={executeA3:async (_c:any,_i:any,perform:any)=>perform()};
const input={id:"P1",title:"P",ownerRef:"USER:OWNER",mandateRef:"MANDATE:P1",methodologyProfile:"PROJECT_NATIVE" as const,
 purpose:"Purpose",createdBy:"FFOS:DIRECTOR"};

test("governed mutation is idempotent and audited",async()=>{
 const store=new MemoryProjectHubStore();const svc=new GovernedProjectHubService(store,allowGate as any);
 const a=await svc.createProject(director("CREATE"),input);
 const b=await svc.createProject(director("CREATE"),input);
 assert.equal(a.replayed,false);assert.equal(b.replayed,true);
 assert.equal((await store.listAuditEvents("P1")).length,1);
});

test("same idempotency key with different command is rejected",async()=>{
 const store=new MemoryProjectHubStore();const svc=new GovernedProjectHubService(store,allowGate as any);
 await svc.createProject(director("CREATE"),input);
 await assert.rejects(()=>svc.setField(director("CREATE"),"P1","Need","DRAFT"),
   (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_COMMAND");
});

test("non-Director is denied until a project grant exists",async()=>{
 const store=new MemoryProjectHubStore();const svc=new GovernedProjectHubService(store,allowGate as any);
 await svc.createProject(director("CREATE"),input);
 await assert.rejects(()=>svc.getProject(owner("READ"),"P1"),
   (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="PROJECT_OPERATION_NOT_AUTHORIZED");
 const grant=makeRoleGrant({grantId:"G1",projectId:"P1",principalRef:"USER:OWNER",role:"PROJECT_OWNER",
   allowedOperations:["PROJECT_READ","PROJECT_MUTATE","PROJECT_ROLE_ADMIN"],dataClassCeiling:"PH-D3",
   validFrom:"2026-11-16T00:00:00Z",status:"ACTIVE",grantAuthorityRef:"AUTH:DIRECTOR",provenance:[]});
 await svc.grantRole(director("GRANT"),grant);
 const p=await svc.getProject(owner("READ2"),"P1");assert.equal(p.id,"P1");
});

test("PH-D4 and secrets are not admitted in first native release",async()=>{
 const store=new MemoryProjectHubStore();const svc=new GovernedProjectHubService(store,allowGate as any);
 await assert.rejects(()=>svc.createProject(director("SENSITIVE"),{...input,id:"P4",dataClassCeiling:"PH-D4" as const}),
   (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="PROJECT_DATA_CLASS_NOT_ADMITTED_V1");
 await svc.createProject(director("CREATE"),input);
 await assert.rejects(()=>svc.addNode(director("SECRET"),"P1",{id:"S",kind:"SECRET",title:"No",dataClass:"PH-D5"}),
   (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="SECRETS_NOT_PROJECT_CONTENT");
});

test("transaction rollback removes partial state in memory store",async()=>{
 const store=new MemoryProjectHubStore();
 await assert.rejects(()=>store.transaction(async tx=>{
   await tx.appendAuditEvent({eventId:"E",projectId:"P",objectId:"P",eventType:"X",principalRef:"D",
     authorityRef:"A",mandateRef:"M",commandId:"I",correlationId:"C",causationId:"K",dataClass:"PH-D1",
     occurredAt:new Date().toISOString(),payload:{},provenance:[]});
   throw new Error("fail");
 }));
 assert.equal((await store.listAuditEvents("P")).length,0);
});
