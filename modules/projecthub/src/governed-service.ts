import {createHash,randomUUID} from "node:crypto";
import type {
  CommandContext,CreateProjectInput,FieldMaturity,ProjectDataClass,ProjectFieldDimensionName,
  ProjectHubAuditEvent,ProjectOperation,ProjectRoleGrant,ProvenanceRef,RelationScope
} from "../../../packages/projecthub-model/src/index.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";
import {ProjectHubService} from "./service.ts";
import type {ProjectHubStore} from "./store.ts";
import {StoreBackedProjectHubAuthorizer} from "./rights.ts";

function digest(value:unknown){
  return createHash("sha256").update(JSON.stringify(value,Object.keys(value as object).sort())).digest("hex");
}
function stamp(){return new Date().toISOString();}
function audit(ctx:CommandContext,projectId:string,objectId:string,eventType:string,dataClass:ProjectDataClass,payload:Record<string,unknown>,provenance:ProvenanceRef[]=[]):ProjectHubAuditEvent{
  return {eventId:randomUUID(),projectId,objectId,eventType,principalRef:ctx.principalRef,
    authorityRef:ctx.authorityRef,mandateRef:ctx.mandateRef,commandId:ctx.idempotencyKey,
    correlationId:ctx.correlationId,causationId:ctx.causationId,dataClass,occurredAt:stamp(),payload,provenance};
}

export class GovernedProjectHubService {
  constructor(private readonly store:ProjectHubStore){}

  private async execute<T>(ctx:CommandContext,projectId:string,operation:ProjectOperation,dataClass:ProjectDataClass,
    body:Record<string,unknown>,fn:(tx:ProjectHubStore)=>Promise<{result:T;event:ProjectHubAuditEvent}>,
    create=false):Promise<{result:T;replayed:boolean}>{
    const existing=await this.store.getIdempotency(ctx.idempotencyKey);
    if(existing){
      if(existing.commandDigest!==digest(body))throw new ProjectHubInvariantError("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_COMMAND");
      return {result:structuredClone(existing.result) as T,replayed:true};
    }
    return this.store.transaction(async tx=>{
      const inside=await tx.getIdempotency(ctx.idempotencyKey);
      if(inside){
        if(inside.commandDigest!==digest(body))throw new ProjectHubInvariantError("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_COMMAND");
        return {result:structuredClone(inside.result) as T,replayed:true};
      }
      const auth=new StoreBackedProjectHubAuthorizer(tx);
      if(create)await auth.assertCreate(ctx);else await auth.assertProjectOperation(ctx,projectId,operation,dataClass);
      const out=await fn(tx);
      await tx.appendAuditEvent(out.event);
      await tx.appendIdempotency({idempotencyKey:ctx.idempotencyKey,projectId,operation,
        commandDigest:digest(body),result:out.result,recordedAt:stamp()});
      return {result:out.result,replayed:false};
    });
  }

  async createProject(ctx:CommandContext,input:CreateProjectInput){
    if(["PH-D4","PH-D5"].includes(input.dataClassCeiling??"PH-D2"))
      throw new ProjectHubInvariantError("PROJECT_DATA_CLASS_NOT_ADMITTED_V1");
    return this.execute(ctx,input.id,"PROJECT_MUTATE",input.dataClassCeiling??"PH-D2",input as any,async tx=>{
      const result=await new ProjectHubService(tx).createProject(input);
      return {result,event:audit(ctx,input.id,input.id,"PROJECT_CREATED",input.dataClassCeiling??"PH-D2",
        {methodologyProfile:input.methodologyProfile,status:result.status},input.provenance)};
    },true);
  }

  async setField(ctx:CommandContext,projectId:string,dimension:ProjectFieldDimensionName,maturity:FieldMaturity,opts?:{
    note?:string|null;evidenceRefs?:string[];premiseRefs?:string[];provenance?:ProvenanceRef[];
  }){
    const body={projectId,dimension,maturity,opts:opts??{}};
    return this.execute(ctx,projectId,"PROJECT_MUTATE","PH-D2",body,async tx=>{
      const result=await new ProjectHubService(tx).setField(projectId,dimension,maturity,opts);
      return {result,event:audit(ctx,projectId,projectId,"PROJECT_FIELD_CHANGED","PH-D2",
        {dimension,maturity,version:result.version},opts?.provenance)};
    });
  }

  async addNode(ctx:CommandContext,projectId:string,input:{
    id:string;kind:string;title:string;dataClass?:ProjectDataClass;provenance?:ProvenanceRef[];
  }){
    const dataClass=input.dataClass??"PH-D2";
    return this.execute(ctx,projectId,"PROJECT_MUTATE",dataClass,{projectId,...input} as any,async tx=>{
      const result=await new ProjectHubService(tx).addNode(projectId,input);
      return {result,event:audit(ctx,projectId,input.id,"PROJECT_NODE_ADDED",dataClass,{kind:input.kind},input.provenance)};
    });
  }

  async addRelation(ctx:CommandContext,projectId:string,input:{
    id?:string;subjectId:string;predicate:string;objectId:string;scope:RelationScope;provenance?:ProvenanceRef[];
  }){
    return this.execute(ctx,projectId,"PROJECT_MUTATE","PH-D2",{projectId,...input} as any,async tx=>{
      const result=await new ProjectHubService(tx).addRelation(projectId,input);
      return {result,event:audit(ctx,projectId,result.id,"PROJECT_RELATION_ADDED","PH-D2",
        {subjectId:input.subjectId,predicate:input.predicate,objectId:input.objectId,scope:input.scope},input.provenance)};
    });
  }

  async grantRole(ctx:CommandContext,grant:ProjectRoleGrant){
    return this.execute(ctx,grant.projectId,"PROJECT_ROLE_ADMIN","PH-D2",grant as any,async tx=>{
      await tx.appendRoleGrant(grant);
      return {result:grant,event:audit(ctx,grant.projectId,grant.grantId,"PROJECT_ROLE_GRANTED","PH-D2",
        {principalRef:grant.principalRef,role:grant.role,operations:grant.allowedOperations},grant.provenance)};
    });
  }

  async getProject(ctx:CommandContext,projectId:string,dataClass:ProjectDataClass="PH-D2"){
    await new StoreBackedProjectHubAuthorizer(this.store).assertProjectOperation(ctx,projectId,"PROJECT_READ",dataClass);
    return new ProjectHubService(this.store).getProject(projectId);
  }
}
