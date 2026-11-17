import type {
  IdempotencyReceipt,ProjectHubAuditEvent,ProjectNode,ProjectRecord,ProjectRelation,ProjectRoleGrant
} from "../../../packages/projecthub-model/src/index.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";
import type {ProjectHubStore} from "./store.ts";

type QueryResult={rows:any[]};
export interface SqlClient {query(sql:string,params?:readonly unknown[]):Promise<QueryResult>;release?():void;}
export interface SqlPool extends SqlClient {connect():Promise<SqlClient>;}

function j(v:unknown){return JSON.stringify(v);}
function project(row:any):ProjectRecord{return row.payload as ProjectRecord;}
function node(row:any):ProjectNode{return row.payload as ProjectNode;}
function relation(row:any):ProjectRelation{return row.payload as ProjectRelation;}

export class PgProjectHubStore implements ProjectHubStore {
  constructor(private readonly db:SqlPool|SqlClient,private readonly inTransaction=false){}

  async transaction<T>(fn:(tx:ProjectHubStore)=>Promise<T>):Promise<T>{
    if(this.inTransaction)return fn(this);
    if(!("connect" in this.db))throw new ProjectHubInvariantError("TRANSACTION_REQUIRES_POOL");
    const client=await (this.db as SqlPool).connect();
    try{
      await client.query("BEGIN");
      const result=await fn(new PgProjectHubStore(client,true));
      await client.query("COMMIT");return result;
    }catch(error){
      try{await client.query("ROLLBACK");}catch{}
      throw error;
    }finally{client.release?.();}
  }
  private assertTx(){if(!this.inTransaction)throw new ProjectHubInvariantError("CANONICAL_WRITE_REQUIRES_TRANSACTION");}

  async getProject(id:string){
    const r=await this.db.query("select payload from ffos.projecthub_projects where project_id=$1 order by version desc limit 1",[id]);
    return r.rows[0]?project(r.rows[0]):null;
  }
  async listProjects(){
    const r=await this.db.query(`select distinct on(project_id) payload from ffos.projecthub_projects
      order by project_id,version desc`,[]);
    return r.rows.map(project).sort((a,b)=>a.title.localeCompare(b.title));
  }
  async appendProject(p:ProjectRecord){
    this.assertTx();
    await this.db.query(`insert into ffos.projecthub_projects
      (project_id,version,title,status,data_class,methodology_profile,payload,provenance,created_at,updated_at)
      values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)`,
      [p.id,p.version,p.title,p.status,p.profile.dataClassCeiling,p.profile.methodologyProfile,j(p),j(p.provenance),p.createdAt,p.updatedAt]);
  }
  async getNode(id:string){
    const r=await this.db.query("select payload from ffos.projecthub_nodes where node_id=$1 order by version desc limit 1",[id]);
    return r.rows[0]?node(r.rows[0]):null;
  }
  async appendNode(n:ProjectNode){
    this.assertTx();
    await this.db.query(`insert into ffos.projecthub_nodes
      (node_id,project_id,version,kind,title,payload,provenance) values ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)`,
      [n.id,n.projectId,n.version,n.kind,n.title,j(n),j(n.provenance)]);
  }
  async appendRelation(r:ProjectRelation){
    this.assertTx();
    await this.db.query(`insert into ffos.projecthub_relations
      (relation_id,project_id,version,subject_id,predicate,object_id,scope,payload,provenance)
      values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)`,
      [r.id,r.projectId,r.version,r.subjectId,r.predicate,r.objectId,r.scope,j(r),j(r.provenance)]);
  }
  async listNodes(projectId:string){
    const r=await this.db.query(`select distinct on(node_id) payload from ffos.projecthub_nodes
      where project_id=$1 order by node_id,version desc`,[projectId]);
    return r.rows.map(node);
  }
  async listRelations(projectId:string){
    const r=await this.db.query(`select distinct on(relation_id) payload from ffos.projecthub_relations
      where project_id=$1 order by relation_id,version desc`,[projectId]);
    return r.rows.map(relation);
  }
  async getIdempotency(key:string){
    const r=await this.db.query("select * from ffos.projecthub_idempotency where idempotency_key=$1",[key]);
    if(!r.rows[0])return null;
    const x=r.rows[0];return {idempotencyKey:x.idempotency_key,projectId:x.project_id,operation:x.operation,
      commandDigest:x.command_digest,result:x.result,recordedAt:new Date(x.recorded_at).toISOString()} as IdempotencyReceipt;
  }
  async appendIdempotency(x:IdempotencyReceipt){
    this.assertTx();
    await this.db.query(`insert into ffos.projecthub_idempotency
      (idempotency_key,project_id,operation,command_digest,result,recorded_at) values ($1,$2,$3,$4,$5::jsonb,$6)`,
      [x.idempotencyKey,x.projectId,x.operation,x.commandDigest,j(x.result),x.recordedAt]);
  }
  async appendAuditEvent(e:ProjectHubAuditEvent){
    this.assertTx();
    await this.db.query(`insert into ffos.projecthub_events
      (event_id,project_id,object_id,event_type,from_state,to_state,principal_ref,authority_ref,mandate_ref,
       command_id,correlation_id,causation_id,data_class,occurred_at,payload,provenance)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16::jsonb)`,
      [e.eventId,e.projectId,e.objectId,e.eventType,e.fromState??null,e.toState??null,e.principalRef,e.authorityRef,
       e.mandateRef,e.commandId,e.correlationId,e.causationId,e.dataClass,e.occurredAt,j(e.payload),j(e.provenance)]);
  }
  async listAuditEvents(projectId:string){
    const r=await this.db.query("select * from ffos.projecthub_events where project_id=$1 order by occurred_at,event_id",[projectId]);
    return r.rows.map(x=>({eventId:x.event_id,projectId:x.project_id,objectId:x.object_id,eventType:x.event_type,
      fromState:x.from_state??undefined,toState:x.to_state??undefined,principalRef:x.principal_ref,authorityRef:x.authority_ref,
      mandateRef:x.mandate_ref,commandId:x.command_id,correlationId:x.correlation_id,causationId:x.causation_id,
      dataClass:x.data_class,occurredAt:new Date(x.occurred_at).toISOString(),payload:x.payload,provenance:x.provenance}));
  }
  async appendRoleGrant(g:ProjectRoleGrant){
    this.assertTx();
    await this.db.query(`insert into ffos.projecthub_role_grants
      (grant_id,project_id,version,principal_ref,role,allowed_operations,data_class_ceiling,valid_from,valid_until,status,
       grant_authority_ref,payload,provenance)
      values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb)`,
      [g.grantId,g.projectId,g.version,g.principalRef,g.role,j(g.allowedOperations),g.dataClassCeiling,g.validFrom,
       g.validUntil??null,g.status,g.grantAuthorityRef,j(g),j(g.provenance)]);
  }
  async listRoleGrants(projectId:string,principalRef?:string){
    const r=await this.db.query(`select distinct on(grant_id) payload from ffos.projecthub_role_grants
      where project_id=$1 and ($2::text is null or principal_ref=$2)
      order by grant_id,version desc`,[projectId,principalRef??null]);
    return r.rows.map(x=>x.payload as ProjectRoleGrant);
  }
}
