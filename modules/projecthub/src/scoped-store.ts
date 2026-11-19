import type {
  IdempotencyReceipt,ProjectHubAuditEvent,ProjectNode,ProjectRecord,ProjectRelation,ProjectRoleGrant
} from "../../../packages/projecthub-model/src/index.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";
import type {ProjectHubStore} from "./store.ts";
import type {SqlPool} from "./pg-store.ts";
import {withScopedProjectHubRuntimeRead,withScopedProjectHubWrite} from "./scoped-pg.ts";

/**
 * Project-scoped store for the future production writer identity.
 *
 * Every read executes under ffos_projecthub_runtime in a READ ONLY transaction
 * bound to one project scope. Every canonical transaction executes under the
 * same role and project scope in a separate atomic write transaction.
 *
 * Append methods are intentionally unavailable outside transaction(); this
 * prevents callers from obtaining an apparently scoped store and then issuing
 * unwrapped writes.
 */
export class ScopedPgProjectHubStore implements ProjectHubStore {
  constructor(
    private readonly pool:SqlPool,
    private readonly projectId:string,
  ){}

  private read<T>(fn:(store:ProjectHubStore)=>Promise<T>):Promise<T>{
    return withScopedProjectHubRuntimeRead(this.pool,this.projectId,fn);
  }

  private rejectWrite():never{
    throw new ProjectHubInvariantError("SCOPED_PROJECTHUB_WRITE_REQUIRES_TRANSACTION");
  }

  getProject(id:string){return this.read(s=>s.getProject(id));}
  listProjects():Promise<ProjectRecord[]>{return this.read(s=>s.listProjects());}
  getNode(id:string){return this.read(s=>s.getNode(id));}
  listNodes(projectId:string):Promise<ProjectNode[]>{return this.read(s=>s.listNodes(projectId));}
  listRelations(projectId:string):Promise<ProjectRelation[]>{return this.read(s=>s.listRelations(projectId));}
  getIdempotency(key:string){return this.read(s=>s.getIdempotency(key));}
  listAuditEvents(projectId:string):Promise<ProjectHubAuditEvent[]>{return this.read(s=>s.listAuditEvents(projectId));}
  listRoleGrants(projectId:string,principalRef?:string):Promise<ProjectRoleGrant[]>{
    return this.read(s=>s.listRoleGrants(projectId,principalRef));
  }

  async appendProject(_project:ProjectRecord):Promise<void>{this.rejectWrite();}
  async appendNode(_node:ProjectNode):Promise<void>{this.rejectWrite();}
  async appendRelation(_relation:ProjectRelation):Promise<void>{this.rejectWrite();}
  async appendIdempotency(_receipt:IdempotencyReceipt):Promise<void>{this.rejectWrite();}
  async appendAuditEvent(_event:ProjectHubAuditEvent):Promise<void>{this.rejectWrite();}
  async appendRoleGrant(_grant:ProjectRoleGrant):Promise<void>{this.rejectWrite();}

  transaction<T>(fn:(tx:ProjectHubStore)=>Promise<T>):Promise<T>{
    return withScopedProjectHubWrite(this.pool,this.projectId,fn);
  }
}
