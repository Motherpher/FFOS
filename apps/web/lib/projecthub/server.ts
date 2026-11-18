import {Pool} from "pg";
import {cookies} from "next/headers";
import {SESSION_COOKIE,verifyDirectorSession} from "../auth";
import {
  GovernedProjectHubService,ProjectSteward
} from "../../../../modules/projecthub/src/index.ts";
import {withScopedProjectHubRead} from "../../../../modules/projecthub/src/scoped-pg.ts";
import type {CommandContext,CreateProjectInput,ProjectRecord} from "../../../../packages/projecthub-model/src/index.ts";

let pool:Pool|null=null;
function configuration(){
  const databaseUrl=process.env.FFOS_PROJECTHUB_DATABASE_URL;
  const authorityRef=process.env.FFOS_PROJECTHUB_AUTHORITY_REF;
  const mandateRef=process.env.FFOS_PROJECTHUB_MANDATE_REF;
  // Both toggles default to false. Configuration alone never proves runtime binding.
  const readsEnabled=process.env.FFOS_PROJECTHUB_READS_ENABLED==="true";
  const writesEnabled=process.env.FFOS_PROJECTHUB_WRITES_ENABLED==="true";
  return {databaseUrl,authorityRef,mandateRef,readsEnabled,writesEnabled,
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
  const readCandidate=c.databaseConfigured&&c.authorityConfigured&&c.readsEnabled;
  return {database:c.databaseConfigured,authority:c.authorityConfigured,
    reads:c.readsEnabled,writes:c.writesEnabled,
    state:readCandidate?"READ_CANDIDATE":"NOT_BOUND",
    release:"RELEASED_INTERNAL_BASELINE",deployment:"DATABASE_PRIVATE_APP_NOT_VERIFIED"};
}
// Global project enumeration would require a separate, authorized portfolio
// read model. Never infer permission to enumerate across project RLS scopes.
export async function listProjectsForUi():Promise<ProjectRecord[]>{
  await director();
  throw new Error("PROJECTHUB_PORTFOLIO_QUERY_NOT_ADMITTED");
}
export async function projectForUi(projectId:string){
  const c=configuration();
  if(!c.readsEnabled||!c.databaseConfigured||!c.authorityConfigured)
    throw new Error("PROJECTHUB_READ_RUNTIME_NOT_ENABLED");
  const s=await director();
  const ctx=context(s.sub,"READ-"+crypto.randomUUID());
  // Scope is set AFTER session verification, inside a read-only transaction,
  // on the exact connection used by every ProjectHub query.
  return withScopedProjectHubRead(db(),projectId,async store=>{
    const existing=await store.getProject(projectId);
    if(!existing)return null;
    const service=new GovernedProjectHubService(store,null);
    const project=await service.getProject(ctx,projectId,existing.profile.dataClassCeiling);
    const events=await store.listAuditEvents(projectId);
    const unknown=Object.entries(project.field).filter(([,x])=>x.maturity==="UNKNOWN").map(([k])=>k as any);
    const steward=new ProjectSteward().propose({projectId,unknownDimensions:unknown});
    return {project,events,steward,context:{principal:s.sub,authorityRef:ctx.authorityRef,mandateRef:ctx.mandateRef}};
  });
}
export async function createProjectFromApi(_input:CreateProjectInput,_idempotencyKey:string){
  // Write binding requires an independently verified transactional executor
  // with CDX pre/post effects. The older unscoped pool is NOT a safe fallback.
  const c=configuration();
  if(!c.writesEnabled)throw new Error("PROJECTHUB_WRITE_RUNTIME_NOT_ENABLED");
  throw new Error("PROJECTHUB_SCOPED_WRITE_AND_CDX_BINDING_NOT_ACCEPTED");
}
