import {Pool} from "pg";
import {cookies} from "next/headers";
import {SESSION_COOKIE,verifyDirectorSession} from "../auth";
import {
  PgProjectHubStore,GovernedProjectHubService,ProjectHubEffectGate,StoreEffectEvidenceWriter,ProjectSteward
} from "../../../../modules/projecthub/src/index.ts";
import {FFOSCdxProjectHubPort} from "../../../../integrations/cdx/projecthub-runtime.ts";
import type {CommandContext,CreateProjectInput,ProjectRecord} from "../../../../packages/projecthub-model/src/index.ts";

let pool:Pool|null=null;
function configuration(){
  const databaseUrl=process.env.FFOS_PROJECTHUB_DATABASE_URL;
  const authorityRef=process.env.FFOS_PROJECTHUB_AUTHORITY_REF;
  const mandateRef=process.env.FFOS_PROJECTHUB_MANDATE_REF;
  const writesEnabled=process.env.FFOS_PROJECTHUB_WRITES_ENABLED==="true";
  return {databaseUrl,authorityRef,mandateRef,writesEnabled,
    databaseConfigured:Boolean(databaseUrl),authorityConfigured:Boolean(authorityRef&&mandateRef)};
}
function db(){
  const c=configuration();
  if(!c.databaseUrl)throw new Error("PROJECTHUB_DATABASE_NOT_CONFIGURED");
  if(!pool)pool=new Pool({connectionString:c.databaseUrl,max:4,connectionTimeoutMillis:3000,idleTimeoutMillis:10000});
  return pool;
}
async function director(){
  const c=await cookies();const token=c.get(SESSION_COOKIE)?.value;
  const session=await verifyDirectorSession(token,process.env.FFOS_SESSION_SECRET);
  if(!session)throw new Error("PROJECTHUB_DIRECTOR_SESSION_REQUIRED");
  return session;
}
function context(subject:string,key:string):CommandContext{
  const c=configuration();
  if(!c.authorityRef||!c.mandateRef)throw new Error("PROJECTHUB_AUTHORITY_NOT_CONFIGURED");
  return {principalRef:subject,principalClass:"DIRECTOR",authorityRef:c.authorityRef,mandateRef:c.mandateRef,
    idempotencyKey:key,correlationId:crypto.randomUUID(),causationId:key};
}
export function projectHubRuntimeStatus(){
  const c=configuration();
  return {database:c.databaseConfigured,authority:c.authorityConfigured,writes:c.writesEnabled,
    state:c.databaseConfigured&&c.authorityConfigured?"BOUND_INTERNAL_BASELINE":"NOT_BOUND",
    release:"RELEASED_INTERNAL_BASELINE",deployment:"NOT_DEPLOYED"};
}
export async function listProjectsForUi():Promise<ProjectRecord[]>{
  await director();const c=configuration();if(!c.databaseConfigured||!c.authorityConfigured)return [];
  return new PgProjectHubStore(db()).listProjects();
}
export async function projectForUi(projectId:string){
  const s=await director();const ctx=context(s.sub,"READ-"+crypto.randomUUID());
  const store=new PgProjectHubStore(db());
  const service=new GovernedProjectHubService(store,null);
  // Reads do not require the A3 effect gate; use the authorizer-backed store directly here.
  const project=await store.getProject(projectId);if(!project)return null;
  const events=await store.listAuditEvents(projectId);
  const unknown=Object.entries(project.field).filter(([,x])=>x.maturity==="UNKNOWN").map(([k])=>k as any);
  const steward=new ProjectSteward().propose({projectId,unknownDimensions:unknown});
  return {project,events,steward,context:{principal:s.sub,authorityRef:ctx.authorityRef,mandateRef:ctx.mandateRef}};
}
export async function createProjectFromApi(input:CreateProjectInput,idempotencyKey:string){
  const c=configuration();if(!c.writesEnabled)throw new Error("PROJECTHUB_WRITE_RUNTIME_NOT_ENABLED");
  const s=await director();const ctx=context(s.sub,idempotencyKey);
  const store=new PgProjectHubStore(db());
  const evidence=new StoreEffectEvidenceWriter(store,ctx);
  const gate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort(),evidence);
  return new GovernedProjectHubService(store,gate).createProject(ctx,input);
}
