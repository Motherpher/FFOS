import type {CommandContext,ProjectOperation} from "../../../packages/projecthub-model/src/index.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

export type ProjectHubActionClass="A0"|"A1"|"A2"|"A3"|"A4"|"A5";
export type ReversibilityClass="REVERSIBLE"|"PARTIALLY_REVERSIBLE"|"IRREVERSIBLE"|"UNKNOWN";

export type CdxEffectReceipt={
  decision:"ALLOW"|"ALLOW_WITH_CONTROLS"|"REQUIRE_HUMAN"|"QUARANTINE"|"DENY"|"SECURITY_STOP"|"CONSTITUTIONAL_STOP";
  decisionRef:string;
  spetlReceiptRef:string;
  policyVersion:string;
  policyDigest:string;
  controlResults:unknown[];
};

export interface ProjectHubCdxPort {
  evaluateA3(input:{
    context:CommandContext;projectId:string;operation:ProjectOperation;resourceRef:string;
    localAuthorizationDecisionId:string;dataMinimization:{personalDataPresent:boolean;redactedFields:string[];rationale:string};
  }):Promise<CdxEffectReceipt>;
  evaluateA4(input:{
    context:CommandContext;projectId:string;operation:string;targetRef:string;releaseDecisionId:string;
    reversibilityClass:ReversibilityClass;revocationCheckPassed:boolean;
    dataMinimization:{personalDataPresent:boolean;redactedFields:string[];rationale:string};
  }):Promise<CdxEffectReceipt>;
}

export interface EffectEvidencePort {
  append(event:{stage:"PRE_EFFECT"|"POST_EFFECT"|"BLOCKED";actionClass:ProjectHubActionClass;
    projectId:string;operation:string;resourceRef:string;decision:CdxEffectReceipt["decision"];
    decisionRef:string;spetlReceiptRef:string;detail:string;correlationId:string;causationId:string;}):Promise<void>;
}

export interface CanonicalMutationGate {
  executeA3<T>(context:CommandContext,input:{
    projectId:string;operation:ProjectOperation;resourceRef:string;localAuthorizationDecisionId:string;
    dataMinimization?:{personalDataPresent:boolean;redactedFields:string[];rationale:string};
  },perform:()=>Promise<T>):Promise<T>;
}

const PERMISSIVE=new Set(["ALLOW","ALLOW_WITH_CONTROLS"]);

export class ProjectHubEffectGate implements CanonicalMutationGate {
  constructor(private readonly cdx:ProjectHubCdxPort|null,private readonly evidence:EffectEvidencePort|null){}
  async executeA3<T>(context:CommandContext,input:{
    projectId:string;operation:ProjectOperation;resourceRef:string;localAuthorizationDecisionId:string;
    dataMinimization?:{personalDataPresent:boolean;redactedFields:string[];rationale:string};
  },perform:()=>Promise<T>):Promise<T>{
    if(!this.cdx||!this.evidence)throw new ProjectHubInvariantError("PROJECTHUB_CDX_EFFECT_GATE_NOT_BOUND");
    let receipt:CdxEffectReceipt;
    try{
      receipt=await this.cdx.evaluateA3({...input,context,dataMinimization:input.dataMinimization??{
        personalDataPresent:false,redactedFields:[],rationale:"No personal data required for this canonical project-state mutation."
      }});
    }catch{throw new ProjectHubInvariantError("PROJECTHUB_CDX_UNAVAILABLE");}
    if(!PERMISSIVE.has(receipt.decision)){
      await this.evidence.append({stage:"BLOCKED",actionClass:"A3",projectId:input.projectId,operation:input.operation,
        resourceRef:input.resourceRef,decision:receipt.decision,decisionRef:receipt.decisionRef,spetlReceiptRef:receipt.spetlReceiptRef,
        detail:"CDX restrictive decision",correlationId:context.correlationId,causationId:context.causationId});
      throw new ProjectHubInvariantError("PROJECTHUB_CDX_"+receipt.decision);
    }
    await this.evidence.append({stage:"PRE_EFFECT",actionClass:"A3",projectId:input.projectId,operation:input.operation,
      resourceRef:input.resourceRef,decision:receipt.decision,decisionRef:receipt.decisionRef,spetlReceiptRef:receipt.spetlReceiptRef,
      detail:"Authorized canonical mutation intent; not completion",correlationId:context.correlationId,causationId:context.causationId});
    let result:T;
    try{result=await perform();}
    catch(error){
      await this.evidence.append({stage:"POST_EFFECT",actionClass:"A3",projectId:input.projectId,operation:input.operation,
        resourceRef:input.resourceRef,decision:receipt.decision,decisionRef:receipt.decisionRef,spetlReceiptRef:receipt.spetlReceiptRef,
        detail:"Mutation failed or rolled back; reconcile from canonical store",correlationId:context.correlationId,causationId:context.causationId});
      throw error;
    }
    await this.evidence.append({stage:"POST_EFFECT",actionClass:"A3",projectId:input.projectId,operation:input.operation,
      resourceRef:input.resourceRef,decision:receipt.decision,decisionRef:receipt.decisionRef,spetlReceiptRef:receipt.spetlReceiptRef,
      detail:"Canonical mutation callback returned; acceptance remains separate",correlationId:context.correlationId,causationId:context.causationId});
    return result;
  }

  async executeA4<T>(context:CommandContext,input:{
    projectId:string;operation:string;targetRef:string;releaseDecisionId?:string;reversibilityClass:ReversibilityClass;
    revocationCheckPassed:boolean;dataMinimization?:{personalDataPresent:boolean;redactedFields:string[];rationale:string};
  },perform:()=>Promise<T>):Promise<T>{
    if(!input.releaseDecisionId)throw new ProjectHubInvariantError("A4_REQUIRES_RELEASE_DECISION");
    if(!this.cdx||!this.evidence)throw new ProjectHubInvariantError("PROJECTHUB_CDX_EFFECT_GATE_NOT_BOUND");
    const receipt=await this.cdx.evaluateA4({context,projectId:input.projectId,operation:input.operation,targetRef:input.targetRef,
      releaseDecisionId:input.releaseDecisionId,reversibilityClass:input.reversibilityClass,revocationCheckPassed:input.revocationCheckPassed,
      dataMinimization:input.dataMinimization??{personalDataPresent:false,redactedFields:[],rationale:"No personal data required for external effect."}});
    if(!PERMISSIVE.has(receipt.decision))throw new ProjectHubInvariantError("PROJECTHUB_CDX_"+receipt.decision);
    await this.evidence.append({stage:"PRE_EFFECT",actionClass:"A4",projectId:input.projectId,operation:input.operation,
      resourceRef:input.targetRef,decision:receipt.decision,decisionRef:receipt.decisionRef,spetlReceiptRef:receipt.spetlReceiptRef,
      detail:"Authorized external-effect intent",correlationId:context.correlationId,causationId:context.causationId});
    const result=await perform();
    await this.evidence.append({stage:"POST_EFFECT",actionClass:"A4",projectId:input.projectId,operation:input.operation,
      resourceRef:input.targetRef,decision:receipt.decision,decisionRef:receipt.decisionRef,spetlReceiptRef:receipt.spetlReceiptRef,
      detail:"External callback returned; target receipt/reconciliation still required",correlationId:context.correlationId,causationId:context.causationId});
    return result;
  }

  executeA5():never{
    throw new ProjectHubInvariantError("A5_HUMAN_GOVERNANCE_REQUIRED");
  }
}

export class MemoryEffectEvidence implements EffectEvidencePort {
  events:any[]=[];
  async append(event:any){this.events.push(structuredClone(event));}
}
