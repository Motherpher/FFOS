import type {IdempotencyReceipt,ProjectHubAuditEvent,ProjectNode,ProjectRecord,ProjectRelation,ProjectRoleGrant} from "../../../packages/projecthub-model/src/index.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

export interface ProjectHubStore {
  getProject(id:string):Promise<ProjectRecord|null>;
  appendProject(project:ProjectRecord):Promise<void>;
  getNode(id:string):Promise<ProjectNode|null>;
  appendNode(node:ProjectNode):Promise<void>;
  appendRelation(relation:ProjectRelation):Promise<void>;
  listNodes(projectId:string):Promise<ProjectNode[]>;
  listRelations(projectId:string):Promise<ProjectRelation[]>;
  getIdempotency(key:string):Promise<IdempotencyReceipt|null>;
  appendIdempotency(receipt:IdempotencyReceipt):Promise<void>;
  appendAuditEvent(event:ProjectHubAuditEvent):Promise<void>;
  listAuditEvents(projectId:string):Promise<ProjectHubAuditEvent[]>;
  appendRoleGrant(grant:ProjectRoleGrant):Promise<void>;
  listRoleGrants(projectId:string,principalRef?:string):Promise<ProjectRoleGrant[]>;
  transaction<T>(fn:(tx:ProjectHubStore)=>Promise<T>):Promise<T>;
}

export class MemoryProjectHubStore implements ProjectHubStore {
  private projects=new Map<string,ProjectRecord[]>();
  private nodes=new Map<string,ProjectNode[]>();
  private relations=new Map<string,ProjectRelation[]>();
  private idempotency=new Map<string,IdempotencyReceipt>();
  private audit:ProjectHubAuditEvent[]=[];
  private grants=new Map<string,ProjectRoleGrant[]>();

  async getProject(id:string) {
    const rows=this.projects.get(id)??[];
    return rows.length?structuredClone(rows[rows.length-1]):null;
  }
  async appendProject(project:ProjectRecord) {
    const rows=this.projects.get(project.id)??[];
    const current=rows[rows.length-1];
    if(current&&project.version!==current.version+1)
      throw new ProjectHubInvariantError("PROJECT_VERSION_DISCONTINUITY");
    if(!current&&project.version!==1)
      throw new ProjectHubInvariantError("INITIAL_PROJECT_VERSION_MUST_BE_1");
    rows.push(structuredClone(project));this.projects.set(project.id,rows);
  }
  async getNode(id:string) {
    const rows=this.nodes.get(id)??[];
    return rows.length?structuredClone(rows[rows.length-1]):null;
  }
  async appendNode(node:ProjectNode) {
    const rows=this.nodes.get(node.id)??[];
    const current=rows[rows.length-1];
    if(current&&node.version!==current.version+1)
      throw new ProjectHubInvariantError("NODE_VERSION_DISCONTINUITY");
    if(!current&&node.version!==1)
      throw new ProjectHubInvariantError("INITIAL_NODE_VERSION_MUST_BE_1");
    rows.push(structuredClone(node));this.nodes.set(node.id,rows);
  }
  async appendRelation(relation:ProjectRelation) {
    const rows=this.relations.get(relation.id)??[];
    const current=rows[rows.length-1];
    if(current&&relation.version!==current.version+1)
      throw new ProjectHubInvariantError("RELATION_VERSION_DISCONTINUITY");
    if(!current&&relation.version!==1)
      throw new ProjectHubInvariantError("INITIAL_RELATION_VERSION_MUST_BE_1");
    rows.push(structuredClone(relation));this.relations.set(relation.id,rows);
  }
  async listNodes(projectId:string) {
    return [...this.nodes.values()].map((x)=>x[x.length-1]).filter((x)=>x.projectId===projectId).map(structuredClone);
  }
  async listRelations(projectId:string) {
    return [...this.relations.values()].map((x)=>x[x.length-1]).filter((x)=>x.projectId===projectId).map(structuredClone);
  }
  async getIdempotency(key:string){return this.idempotency.has(key)?structuredClone(this.idempotency.get(key)!):null;}
  async appendIdempotency(receipt:IdempotencyReceipt){
    if(this.idempotency.has(receipt.idempotencyKey))throw new ProjectHubInvariantError("IDEMPOTENCY_KEY_EXISTS");
    this.idempotency.set(receipt.idempotencyKey,structuredClone(receipt));
  }
  async appendAuditEvent(event:ProjectHubAuditEvent){this.audit.push(structuredClone(event));}
  async listAuditEvents(projectId:string){return this.audit.filter(x=>x.projectId===projectId).map(structuredClone);}
  async appendRoleGrant(grant:ProjectRoleGrant){
    const rows=this.grants.get(grant.grantId)??[];const current=rows[rows.length-1];
    if(current&&grant.version!==current.version+1)throw new ProjectHubInvariantError("GRANT_VERSION_DISCONTINUITY");
    if(!current&&grant.version!==1)throw new ProjectHubInvariantError("INITIAL_GRANT_VERSION_MUST_BE_1");
    rows.push(structuredClone(grant));this.grants.set(grant.grantId,rows);
  }
  async listRoleGrants(projectId:string,principalRef?:string){
    return [...this.grants.values()].map(x=>x[x.length-1])
      .filter(x=>x.projectId===projectId&&(!principalRef||x.principalRef===principalRef)).map(structuredClone);
  }
  async transaction<T>(fn:(tx:ProjectHubStore)=>Promise<T>):Promise<T>{
    const snapshot={
      projects:structuredClone(this.projects),nodes:structuredClone(this.nodes),relations:structuredClone(this.relations),
      idempotency:structuredClone(this.idempotency),audit:structuredClone(this.audit),grants:structuredClone(this.grants)
    };
    try{return await fn(this);}catch(error){
      this.projects=snapshot.projects;this.nodes=snapshot.nodes;this.relations=snapshot.relations;
      this.idempotency=snapshot.idempotency;this.audit=snapshot.audit;this.grants=snapshot.grants;throw error;
    }
  }
}
