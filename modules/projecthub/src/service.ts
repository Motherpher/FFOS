import {randomUUID} from "node:crypto";
import {
  assertFieldMaturity,assertMethodologyProfile,makeEmptyField,PROJECT_FIELD_DIMENSIONS,
  ProjectHubInvariantError,
  type CreateProjectInput,type FieldMaturity,type ProjectFieldDimensionName,
  type ProjectNode,type ProjectRecord,type ProjectRelation,type ProvenanceRef,type RelationScope
} from "../../../packages/projecthub-model/src/index.ts";
import type {ProjectHubStore} from "./store.ts";

function now(){return new Date().toISOString();}
function requireText(value:string|undefined,code:string){
  if(!value?.trim())throw new ProjectHubInvariantError(code);
  return value.trim();
}
function provenance(items:ProvenanceRef[]|undefined){return structuredClone(items??[]);}

export class ProjectHubService {
  constructor(private readonly store:ProjectHubStore){}

  async createProject(input:CreateProjectInput):Promise<ProjectRecord>{
    if(await this.store.getProject(input.id))throw new ProjectHubInvariantError("PROJECT_ALREADY_EXISTS");
    assertMethodologyProfile(input.methodologyProfile);
    requireText(input.ownerRef,"OWNER_REQUIRED");
    requireText(input.mandateRef,"MANDATE_REQUIRED");
    requireText(input.purpose,"PURPOSE_REQUIRED");

    if(input.methodologyProfile==="CONFIGURED" && !(input.selectedMethodRefs?.length))
      throw new ProjectHubInvariantError("CONFIGURED_REQUIRES_SELECTED_METHODS");

    const stamp=now();
    const p=provenance(input.provenance);
    const project:ProjectRecord={
      id:input.id,title:requireText(input.title,"TITLE_REQUIRED"),status:"DRAFT",version:1,
      createdAt:stamp,updatedAt:stamp,createdBy:requireText(input.createdBy,"CREATOR_REQUIRED"),
      profile:{
        projectId:input.id,ownerRef:input.ownerRef,mandateRef:input.mandateRef,
        methodologyProfile:input.methodologyProfile,selectedMethodRefs:[...(input.selectedMethodRefs??[])],
        purpose:input.purpose,scope:[...(input.scope??[])],nonScope:[...(input.nonScope??[])],
        dataClassCeiling:input.dataClassCeiling??"PH-D2",
        optionalAssignmentDossierRef:input.optionalAssignmentDossierRef,
        optionalFfcRefs:[...(input.optionalFfcRefs??[])],
        optionalPiusRefs:[...(input.optionalPiusRefs??[])],
        externalMethodRefs:[...(input.externalMethodRefs??[])],
        version:1,provenance:p,
      },
      core:{
        projectId:input.id,need:null,purpose:input.purpose,targetGroups:[],mechanism:null,
        intervention:null,constraints:[],premiseRefs:[],unknownRefs:[],version:1,provenance:p,
      },
      field:makeEmptyField(),
      provenance:p,
    };
    await this.store.appendProject(project);
    return structuredClone(project);
  }

  async getProject(projectId:string){
    const p=await this.store.getProject(projectId);
    if(!p)throw new ProjectHubInvariantError("PROJECT_NOT_FOUND");
    return p;
  }

  async setStatus(projectId:string,status:ProjectRecord["status"]){
    const current=await this.getProject(projectId);
    const updated:ProjectRecord=structuredClone(current);
    updated.status=status;updated.version=current.version+1;updated.updatedAt=now();
    await this.store.appendProject(updated);
    return updated;
  }

  async setField(projectId:string,dimension:ProjectFieldDimensionName,maturity:FieldMaturity,opts?:{
    note?:string|null;evidenceRefs?:string[];premiseRefs?:string[];provenance?:ProvenanceRef[];
  }){
    if(!(PROJECT_FIELD_DIMENSIONS as readonly string[]).includes(dimension))
      throw new ProjectHubInvariantError("INVALID_FIELD_DIMENSION");
    assertFieldMaturity(maturity);
    const current=await this.getProject(projectId);
    const previous=current.field[dimension];
    const updated:ProjectRecord=structuredClone(current);
    updated.version=current.version+1;updated.updatedAt=now();
    updated.field[dimension]={
      ...previous,maturity,note:opts?.note??previous.note,
      evidenceRefs:opts?.evidenceRefs?[...opts.evidenceRefs]:[...previous.evidenceRefs],
      premiseRefs:opts?.premiseRefs?[...opts.premiseRefs]:[...previous.premiseRefs],
      version:previous.version+1,provenance:provenance(opts?.provenance),
    };
    await this.store.appendProject(updated);
    return updated;
  }

  async addNode(projectId:string,input:{id:string;kind:string;title:string;provenance?:ProvenanceRef[]}){
    await this.getProject(projectId);
    if(await this.store.getNode(input.id))throw new ProjectHubInvariantError("NODE_ALREADY_EXISTS");
    const node:ProjectNode={id:input.id,projectId,kind:requireText(input.kind,"NODE_KIND_REQUIRED"),
      title:requireText(input.title,"NODE_TITLE_REQUIRED"),version:1,provenance:provenance(input.provenance)};
    await this.store.appendNode(node);return node;
  }

  async addRelation(projectId:string,input:{
    id?:string;subjectId:string;predicate:string;objectId:string;scope:RelationScope;provenance?:ProvenanceRef[];
  }){
    await this.getProject(projectId);
    const subject=await this.store.getNode(input.subjectId);
    if(!subject||subject.projectId!==projectId)throw new ProjectHubInvariantError("SUBJECT_OUTSIDE_PROJECT");

    const target=await this.store.getNode(input.objectId);
    if(input.scope==="OWNED"){
      if(!target||target.projectId!==projectId)throw new ProjectHubInvariantError("OWNED_TARGET_OUTSIDE_PROJECT");
    }else if(input.scope==="SHARED_REFERENCE"){
      if(!target)throw new ProjectHubInvariantError("SHARED_TARGET_NOT_FOUND");
    }else if(input.scope!=="EXTERNAL_REFERENCE"){
      throw new ProjectHubInvariantError("INVALID_RELATION_SCOPE");
    }

    const relation:ProjectRelation={
      id:input.id??randomUUID(),projectId,subjectId:input.subjectId,
      predicate:requireText(input.predicate,"PREDICATE_REQUIRED"),objectId:input.objectId,
      scope:input.scope,version:1,provenance:provenance(input.provenance)
    };
    await this.store.appendRelation(relation);return relation;
  }

  async graph(projectId:string){
    await this.getProject(projectId);
    return {nodes:await this.store.listNodes(projectId),relations:await this.store.listRelations(projectId)};
  }
}
