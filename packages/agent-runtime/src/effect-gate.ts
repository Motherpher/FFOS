/** AMA-08: local, fail-closed authorization envelope. No CDX service is simulated in production. */
import { randomUUID } from "node:crypto";
import {assertExecutionContext,effectWithinCeiling,requiresExplicitAuthority}
  from "../../agent-model/src/index.ts";
import type {AMAExecutionContext,EffectClass,AMAWorkflowDefinition,
  AMACapabilityDefinition} from "../../agent-model/src/index.ts";
import type {RegisteredRuntimeAgent} from "./stable-registry.ts";

export interface RuntimeAgentReader {
  getCurrent(agentId:string):Promise<RegisteredRuntimeAgent|null>;
}
export interface CDXDecisionRequest {
  context:AMAExecutionContext; capabilityId:string; target:string; expectedPolicyPin:string;
  readRecipientRef?:string; readPurposeRef?:string; readGrantRef?:string;
  readClassification?:"PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"RESTRICTED";
}
export type CDXOutcome="ALLOW"|"ALLOW_WITH_CONTROLS"|"REQUIRE_HUMAN"|"QUARANTINE"|"DENY"|"SECURITY_STOP"|"CONSTITUTIONAL_STOP";
export interface CDXPolicyDecision {
  outcome:CDXOutcome; decisionRef:string; policyPin:string;
  /** Only an independently authenticated adapter may assert these; never the model. */
  decisionAuthenticated?:boolean; spetlReceiptVerified?:boolean;
  obligationsVerified?:boolean; trustedFactsDigest?:string;
  spetlReceiptRef:string; evaluatedTarget:string; evaluatedEffect:EffectClass;
}
export interface CDXPolicyPort {
  evaluate(request:CDXDecisionRequest):Promise<CDXPolicyDecision>;
  assertStillCurrent?(request:CDXDecisionRequest,decision:CDXPolicyDecision):Promise<void>;
}
export interface CDXAnchorPort {
  assertPinned(expectedPolicyPin:string):Promise<void>;
}
export interface RevocationPort {
  assertNotRevoked(context:AMAExecutionContext):Promise<void>;
}
export interface EffectEvidence {
  eventId:string;runId:string;agentId:string;agentVersion:string;workflowId:string;
  workflowVersion:string;principalRef:string;authorityRef:string;mandateRef:string;
  capabilityId:string;target:string;effect:EffectClass;policyPin:string;
  policyDecisionRef:string;spetlReceiptRef:string;
  outcome:CDXOutcome;stage:"PRE_EFFECT"|"POST_EFFECT"|"BLOCKED";detail:string;
}
export interface EvidenceWriter { append(event:EffectEvidence):Promise<void> }
export class EffectDenied extends Error {
  readonly code:string;
  constructor(code:string){super("AMA effect denied: "+code);this.code=code;this.name="EffectDenied";}
}
const nonempty=(s:unknown):s is string=>typeof s==="string"&&!!s.trim();

export class AgentEffectGate {
  private readonly registry:RuntimeAgentReader;
  private readonly policy:CDXPolicyPort|null;
  private readonly anchor:CDXAnchorPort|null;
  private readonly revocation:RevocationPort|null;
  private readonly evidence:EvidenceWriter|null;
  private readonly pin:string;
  constructor(registry:RuntimeAgentReader,policy:CDXPolicyPort|null,
    revocation:RevocationPort|null,evidence:EvidenceWriter|null,
    expectedPolicyPin:string,anchor:CDXAnchorPort|null) {
    this.registry=registry;this.policy=policy;this.revocation=revocation;
    this.evidence=evidence;this.pin=expectedPolicyPin;this.anchor=anchor;
  }
  private async assertBound(context:AMAExecutionContext,capabilityId:string,target:string) {
    const r=await this.registry.getCurrent(context.agentId);
    if(!r||r.lifecycleState!=="ACTIVE")throw new EffectDenied("INACTIVE_AGENT");
    const m={...r.manifest,lifecycleState:r.lifecycleState};
    try{assertExecutionContext(m,context);}catch{throw new EffectDenied("INVALID_CONTEXT");}
    if(!nonempty(context.authorityRef)||!nonempty(context.mandateRef)||
       !nonempty(context.principalRef)||!nonempty(context.runId))
      throw new EffectDenied("MISSING_AUTHORITY");
    if(!nonempty(target)||!m.mandate.scope.includes(target)||
       !context.targetScope?.includes(target))throw new EffectDenied("OUTSIDE_MANDATE");
    const w=r.bindings.workflows.find((x:AMAWorkflowDefinition)=>
      x.workflowId===context.workflowId&&x.version===context.workflowVersion&&x.status==="ACTIVE");
    if(!w||w.agentId!==context.agentId||!m.workflows.includes(w.workflowId))
      throw new EffectDenied("WORKFLOW_NOT_ADMITTED");
    const c=r.bindings.capabilities.find((x:AMACapabilityDefinition)=>
      x.capabilityId===capabilityId&&x.status==="ACTIVE");
    if(!c||c.agentId!==context.agentId||!m.capabilities.includes(capabilityId)||
       !w.requiredCapabilities.includes(capabilityId))throw new EffectDenied("CAPABILITY_NOT_ADMITTED");
    if(c.moduleId&&!m.modules?.[c.moduleId]?.enabled)throw new EffectDenied("DISABLED_MODULE");
    if(!effectWithinCeiling(context.requestedEffect,w.effectCeiling)||
       !effectWithinCeiling(context.requestedEffect,c.effectClass))
      throw new EffectDenied("EFFECT_CEILING");
    if(!requiresExplicitAuthority(context.requestedEffect))
      throw new EffectDenied("OBSERVATION_REQUIRES_SEPARATE_GATE");
    if(context.requestedEffect==="E4_AUTHORITY_CHANGE")
      throw new EffectDenied("AUTHORITY_CHANGE_REQUIRES_SEPARATE_GATE");
  }
  /** No retries: a failed callback may already have had a real effect. */
  async execute<T>(context:AMAExecutionContext,capabilityId:string,target:string,
    perform:()=>Promise<T>):Promise<T> {
    if(!this.policy||!this.anchor||!this.revocation||!this.evidence||!nonempty(this.pin))
      throw new EffectDenied("ENFORCEMENT_NOT_BOUND");
    if(!nonempty(context.policyVersion)||context.policyVersion!==this.pin)
      throw new EffectDenied("POLICY_PIN_MISMATCH");
    try{await this.anchor.assertPinned(this.pin);}
    catch{throw new EffectDenied("CDX_ANCHOR_NOT_VERIFIED");}
    await this.assertBound(context,capabilityId,target);
    try{await this.revocation.assertNotRevoked(context);}
    catch{throw new EffectDenied("REVOKED_OR_UNAVAILABLE");}
    let d:CDXPolicyDecision;
    try{d=await this.policy.evaluate({context,capabilityId,target,expectedPolicyPin:this.pin});}
    catch{throw new EffectDenied("CDX_UNAVAILABLE");}
    if(!d||!nonempty(d.decisionRef)||!nonempty(d.spetlReceiptRef)||
       d.policyPin!==this.pin||d.evaluatedTarget!==target||
       d.evaluatedEffect!==context.requestedEffect||
       !["ALLOW","ALLOW_WITH_CONTROLS","REQUIRE_HUMAN","QUARANTINE","DENY","SECURITY_STOP","CONSTITUTIONAL_STOP"].includes(d.outcome))
      throw new EffectDenied("INVALID_CDX_DECISION");
    const event=(outcome:CDXOutcome,stage:EffectEvidence["stage"],
      detail:string):EffectEvidence=>({
      eventId:randomUUID(),runId:context.runId,agentId:context.agentId,
      agentVersion:context.agentVersion,workflowId:context.workflowId,
      workflowVersion:context.workflowVersion,principalRef:context.principalRef,
      authorityRef:context.authorityRef!,mandateRef:context.mandateRef!,
      capabilityId,target,effect:context.requestedEffect,policyPin:this.pin,
      policyDecisionRef:d.decisionRef,spetlReceiptRef:d.spetlReceiptRef,outcome,stage,detail});
    if(d.outcome!=="ALLOW"&&d.outcome!=="ALLOW_WITH_CONTROLS"){
      try{await this.evidence.append(event(d.outcome,"BLOCKED","CDX restrictive decision"));}
      catch{throw new EffectDenied("EVIDENCE_UNAVAILABLE");}
      throw new EffectDenied("CDX_"+d.outcome);
    }
    if(d.decisionAuthenticated!==true||d.spetlReceiptVerified!==true||
       (d.outcome==="ALLOW_WITH_CONTROLS"&&d.obligationsVerified!==true))
      throw new EffectDenied("CDX_DECISION_OR_OBLIGATIONS_NOT_VERIFIED");
    try{await this.evidence.append(event(d.outcome,"PRE_EFFECT","Authenticated intent; not completion"));}
    catch{throw new EffectDenied("EVIDENCE_UNAVAILABLE");}
    // Best-effort TOCTOU mitigation. Full lease/transactional effect coordination pending.
    await this.assertBound(context,capabilityId,target);
    try{await this.anchor.assertPinned(this.pin);}
    catch{throw new EffectDenied("CDX_ANCHOR_CHANGED_BEFORE_EFFECT");}
    try{await this.revocation.assertNotRevoked(context);}
    catch{throw new EffectDenied("REVOKED_BEFORE_EFFECT");}
    if(this.policy.assertStillCurrent){
      try{
        await this.policy.assertStillCurrent(
          {context,capabilityId,target,expectedPolicyPin:this.pin},d);
      }catch{throw new EffectDenied("CDX_FACT_OR_POLICY_DRIFT_BEFORE_EFFECT");}
    }
    let result:T;
    try{result=await perform();}
    catch(error){
      try{await this.evidence.append(event(d.outcome,"POST_EFFECT","Effect uncertain; reconcile"));}
      catch{/* original failure retained; operator must reconcile */}
      throw error;
    }
    try{await this.evidence.append(event(d.outcome,"POST_EFFECT","Callback returned; not independent acceptance"));}
    catch{throw new EffectDenied("POST_EFFECT_EVIDENCE_UNAVAILABLE_RECONCILE");}
    return result;
  }
}
