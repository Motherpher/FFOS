/** F8: independently mediated E0 classified read, never an E0 blanket permit.
 * The consumer runtime owns local enforcement. The authenticated read admission,
 * CDX policy, revocation and evidence providers must be externally configured.
 */
import {randomUUID} from "node:crypto";
import type {AMAExecutionContext} from "../../agent-model/src/index.ts";
import type {CDXPolicyDecision,CDXDecisionRequest,CDXPolicyPort} from "./effect-gate.ts";
import {F8BindingBlocked} from "./cdx-f8-policy.ts";

export interface F8ReadAdmission {
 recipientRef:string;purposeRef:string;grantRef:string;resource:string;
 classification:"PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"RESTRICTED";
}
export interface F8ReadAuthority {
 /** Actual independent resource ACL/mandate/data-classification decision. */
 assertReadAdmitted(context:AMAExecutionContext,request:F8ReadAdmission):Promise<void>;
 /** Must re-read current revocation and grant state, not replay a model flag. */
 assertStillAdmitted(context:AMAExecutionContext,request:F8ReadAdmission):Promise<void>;
}
export interface F8ReadEvidence {
 append(record:{
   eventId:string;stage:"PRE_READ"|"POST_READ"|"READ_UNCERTAIN";
   runId:string;resource:string;classification:F8ReadAdmission["classification"];
   recipientRef:string;purposeRef:string;decisionRef:string;spetlReceiptRef:string;
 }):Promise<void>;
}
const ok=(s:unknown):s is string=>typeof s==="string"&&s.trim().length>0;
export class CDXF8ReadGuard {
 readonly policy:CDXPolicyPort|null;
 readonly authority:F8ReadAuthority|null;
 readonly evidence:F8ReadEvidence|null;
 constructor(policy:CDXPolicyPort|null,authority:F8ReadAuthority|null,
   evidence:F8ReadEvidence|null){
  this.policy=policy;this.authority=authority;this.evidence=evidence;
 }
 async read<T>(context:AMAExecutionContext,capabilityId:string,
  admission:F8ReadAdmission,load:()=>Promise<T>):Promise<T>{
  if(!this.policy||!this.authority||!this.evidence)
    throw new F8BindingBlocked("CLASSIFIED_READ_NOT_BOUND");
  if(context.requestedEffect!=="E0_OBSERVE"||
     !ok(context.runId)||!ok(context.authorityRef)||!ok(context.mandateRef)||
     !ok(context.principalRef)||!ok(capabilityId)||!ok(context.policyVersion)||
     !ok(admission.resource)||!ok(admission.recipientRef)||
     !ok(admission.purposeRef)||!ok(admission.grantRef)||
     !["PUBLIC","INTERNAL","CONFIDENTIAL","RESTRICTED"].includes(admission.classification))
    throw new F8BindingBlocked("INVALID_CLASSIFIED_READ_CONTEXT");
  if(!context.targetScope?.includes(admission.resource))
    throw new F8BindingBlocked("READ_OUTSIDE_RESOURCE_SCOPE");
  await this.authority.assertReadAdmitted(context,admission);
  const req:CDXDecisionRequest={
    context,capabilityId,target:admission.resource,
    expectedPolicyPin:context.policyVersion!,
    readRecipientRef:admission.recipientRef,
    readPurposeRef:admission.purposeRef,
    readGrantRef:admission.grantRef,
    readClassification:admission.classification
  };
  const decision:CDXPolicyDecision=await this.policy.evaluate(req);
  if(!decision||!["ALLOW","ALLOW_WITH_CONTROLS"].includes(decision.outcome)||
     decision.decisionAuthenticated!==true||
     decision.spetlReceiptVerified!==true||
     (decision.outcome==="ALLOW_WITH_CONTROLS"&&decision.obligationsVerified!==true)||
     decision.policyPin!==context.policyVersion||
     decision.evaluatedTarget!==admission.resource||
     decision.evaluatedEffect!=="E0_OBSERVE"||
     !ok(decision.decisionRef)||!ok(decision.spetlReceiptRef))
    throw new F8BindingBlocked("CLASSIFIED_READ_POLICY_DENIED");
  const event=(stage:"PRE_READ"|"POST_READ"|"READ_UNCERTAIN")=>({
    eventId:randomUUID(),stage,runId:context.runId,resource:admission.resource,
    classification:admission.classification,recipientRef:admission.recipientRef,
    purposeRef:admission.purposeRef,decisionRef:decision.decisionRef,
    spetlReceiptRef:decision.spetlReceiptRef
  });
  await this.evidence.append(event("PRE_READ"));
  await this.authority.assertStillAdmitted(context,admission);
  if(!this.policy.assertStillCurrent)
    throw new F8BindingBlocked("READ_POLICY_FRESHNESS_NOT_BOUND");
  await this.policy.assertStillCurrent(req,decision);
  let value:T;
  try{value=await load();}
  catch(error){
    try{await this.evidence.append(event("READ_UNCERTAIN"));}catch{}
    throw error;
  }
  await this.evidence.append(event("POST_READ"));
  return value;
 }
}
