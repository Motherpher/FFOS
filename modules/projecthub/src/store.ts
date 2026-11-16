import type {ProjectNode,ProjectRecord,ProjectRelation} from "../../../packages/projecthub-model/src/index.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

export interface ProjectHubStore {
  getProject(id:string):Promise<ProjectRecord|null>;
  appendProject(project:ProjectRecord):Promise<void>;
  getNode(id:string):Promise<ProjectNode|null>;
  appendNode(node:ProjectNode):Promise<void>;
  appendRelation(relation:ProjectRelation):Promise<void>;
  listNodes(projectId:string):Promise<ProjectNode[]>;
  listRelations(projectId:string):Promise<ProjectRelation[]>;
}

export class MemoryProjectHubStore implements ProjectHubStore {
  private projects=new Map<string,ProjectRecord[]>();
  private nodes=new Map<string,ProjectNode[]>();
  private relations=new Map<string,ProjectRelation[]>();

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
}
