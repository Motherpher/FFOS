import {
  dataClassWithin,ProjectHubInvariantError,
  type CommandContext,type ProjectDataClass,type ProjectOperation,type ProjectRoleGrant
} from "../../../packages/projecthub-model/src/index.ts";
import type {ProjectHubStore} from "./store.ts";

export interface ProjectHubAuthorizer {
  assertCreate(context:CommandContext):Promise<void>;
  assertProjectOperation(context:CommandContext,projectId:string,operation:ProjectOperation,dataClass:ProjectDataClass):Promise<void>;
}

function required(value:string,code:string){
  if(!value?.trim())throw new ProjectHubInvariantError(code);
}

export class StoreBackedProjectHubAuthorizer implements ProjectHubAuthorizer {
  constructor(private readonly store:ProjectHubStore){}
  private assertContext(c:CommandContext){
    required(c.principalRef,"PRINCIPAL_REQUIRED");required(c.authorityRef,"AUTHORITY_REF_REQUIRED");
    required(c.mandateRef,"MANDATE_REF_REQUIRED");required(c.idempotencyKey,"IDEMPOTENCY_KEY_REQUIRED");
    required(c.correlationId,"CORRELATION_ID_REQUIRED");required(c.causationId,"CAUSATION_ID_REQUIRED");
  }
  async assertCreate(c:CommandContext){
    this.assertContext(c);
    if(c.principalClass!=="DIRECTOR")throw new ProjectHubInvariantError("PROJECT_CREATE_REQUIRES_DIRECTOR");
  }
  async assertProjectOperation(c:CommandContext,projectId:string,op:ProjectOperation,dataClass:ProjectDataClass){
    this.assertContext(c);
    if(dataClass==="PH-D5")throw new ProjectHubInvariantError("SECRETS_NOT_PROJECT_CONTENT");
    if(dataClass==="PH-D4")throw new ProjectHubInvariantError("SENSITIVE_DATA_NOT_ADMITTED_V1");
    if(c.principalClass==="DIRECTOR")return;
    const now=Date.now();
    const grants=(await this.store.listRoleGrants(projectId,c.principalRef)).filter(g=>
      g.status==="ACTIVE"&&Date.parse(g.validFrom)<=now&&(!g.validUntil||Date.parse(g.validUntil)>=now));
    const allowed=grants.some(g=>g.allowedOperations.includes(op)&&dataClassWithin(dataClass,g.dataClassCeiling));
    if(!allowed)throw new ProjectHubInvariantError("PROJECT_OPERATION_NOT_AUTHORIZED");
  }
}

export function makeRoleGrant(input:Omit<ProjectRoleGrant,"version">):ProjectRoleGrant {
  if(input.dataClassCeiling==="PH-D4"||input.dataClassCeiling==="PH-D5")
    throw new ProjectHubInvariantError("ROLE_GRANT_DATA_CLASS_NOT_ADMITTED_V1");
  return {...input,version:1};
}
