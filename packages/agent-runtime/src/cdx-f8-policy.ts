/** CDX F8.2-F8.6 — FFOS consumer adapter, NOT a CDX constitutional core change.
 *
 * This code deliberately does not implement an alternative Conductellence policy
 * engine. It orchestrates mandatory surfaces and requires independently trusted
 * facts, released policy, signed policy decisions, control coverage and SPETL
 * custody. Missing adapters fail closed. The current CDX PRE_RELEASE state
 * prevents consequential production dispatch.
 */
import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import type {CDXDecisionRequest,CDXPolicyDecision,CDXPolicyPort,CDXOutcome} from "./effect-gate.ts";

export const CDX_DECISIONS=[
 "ALLOW","ALLOW_WITH_CONTROLS","REQUIRE_HUMAN","QUARANTINE","DENY",
 "SECURITY_STOP","CONSTITUTIONAL_STOP"
] as const satisfies readonly CDXOutcome[];
const rank=new Map<string,number>(CDX_DECISIONS.map((n,i)=>[n,i]));
const required=(x:unknown):x is string=>typeof x==="string"&&x.trim().length>0;
const digest=(x:unknown)=>"sha256:"+createHash("sha256").update(JSON.stringify(x)).digest("hex");
export class F8BindingBlocked extends Error {
 readonly code:string;
 constructor(code:string){super("CDX F8 blocked: "+code);this.code=code;this.name="F8BindingBlocked";}
}
function must(ok:unknown,code:string):asserts ok{
 if(!ok)throw new F8BindingBlocked(code);
}
export type CDXSurface=
 "AUTHORITY"|"IDENTITY_AUTHORITY"|"CAPABILITY_DELEGATION"|"BOUNDARY"|
 "MODEL_AGENT"|"TOOL_CONNECTOR"|"RUNTIME_AUTH"|"EXTERNAL_EFFECT"|"EVIDENCE"|"DATA"|"CONTENT_MEMORY";
export interface CDXExpectedControl {
 control_id:string;section_id:string;enforcement_surface:string;decision_on_fail:string;
 evidence_requirements:readonly string[];
}
export interface CDXControlIndex {
 readonly sourceBlobSha:string;
 readonly bySurface:ReadonlyMap<string,readonly CDXExpectedControl[]>;
}
export async function readF8ControlIndex(path:string,sourceBlobSha:string):
 Promise<CDXControlIndex>{
 must(/^[0-9a-f]{40}$/.test(sourceBlobSha),"CONTROL_SOURCE_PIN_INVALID");
 const parsed=JSON.parse(await readFile(path,"utf8"));
 must(parsed.schema==="ffos.f8.cdx-control-coverage/v1"&&
  parsed.generated_from?.control_registry_blob_sha===sourceBlobSha&&
  parsed.summary?.law_sections===131&&parsed.summary?.reference_controls===69&&
  parsed.summary?.review_governed_sections===62&&
  Array.isArray(parsed.sections)&&parsed.sections.length===131,
  "CONTROL_COVERAGE_SOURCE_INVALID");
 const all=new Set<string>(),group=new Map<string,CDXExpectedControl[]>();
 for(const sec of parsed.sections){
   must(required(sec.section_id)&&Array.isArray(sec.controls),
     "CONTROL_COVERAGE_ROW_INVALID");
   for(const c of sec.controls as CDXExpectedControl[]){
     must(required(c.control_id)&&c.section_id===sec.section_id&&
       required(c.enforcement_surface)&&Array.isArray(c.evidence_requirements)&&
       c.evidence_requirements.length>0&&!all.has(c.control_id),
       "CONTROL_COVERAGE_ROW_INVALID");
     all.add(c.control_id);
     group.set(c.enforcement_surface,[...(group.get(c.enforcement_surface)??[]),c]);
   }
 }
 must(all.size===69,"CONTROL_COVERAGE_INCOMPLETE");
 return {sourceBlobSha,bySurface:group};
}
export interface F8TrustedFacts {
 runId:string;principalRef:string;authorityRef:string;mandateRef:string;
 agentId:string;effectClass:string;target:string;policyPin:string;
 dataClassification:"PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"RESTRICTED";
 sourceIdentityRef:string;sourceAttestationRef:string;
 recipientRef?:string;purposeRef?:string;dataGrantRef?:string;
 pathHistoryDigest:string;authorityGraphDigest:string;trustDomain:string;
 observationRef:string;
}
export interface F8FactSource {
 /** MUST query separately authenticated identity, mandate, resource and path sources. */
 collect(request:CDXDecisionRequest):Promise<F8TrustedFacts>;
}
export interface F8TrustVerifier {
 assertFacts(facts:F8TrustedFacts):Promise<void>;
 assertSignedDecision(decision:F8SurfaceResponse,contextDigest:string):Promise<void>;
}
export interface F8ReleasedPolicy {
 /** MUST attest CDX actual release, immutable digest, compatible contract,
  * non-revocation and consumer binding. A local anchor alone is insufficient. */
 assertReleasedAndBound(policyDigest:string):Promise<void>;
}
export interface F8SurfaceRequest {
 surface:CDXSurface;contextDigest:string;policyDigest:string;
 controlIds:readonly string[];facts:F8TrustedFacts;
}
export interface F8ControlResult {
 control_id:string;section_id:string;pass:boolean;decision:CDXOutcome;
}
export interface F8SurfaceResponse {
 surface:CDXSurface;contextDigest:string;policyDigest:string;
 policyVersion:string;decision:CDXOutcome;decisionRef:string;signatureRef:string;
 controlResults:readonly F8ControlResult[];obligationRefs:readonly string[];
}
export interface F8PolicyService {
 /** Policy service must independently apply the full mandatory surface, never
  * user-supplied optional control_ids subset. */
 evaluateSurface(request:F8SurfaceRequest):Promise<F8SurfaceResponse>;
}
export interface F8ObligationVerifier {
 assertFulfilled(obligationRefs:readonly string[],facts:F8TrustedFacts):
  Promise<void>;
}
export interface F8CustodyVerifier {
 /** Verify canonical SPETL v1.1 event chain, policy/context/decision correlation,
  * external custody, redaction and independent signer before returning receipt. */
 assertPreserved(
   facts:F8TrustedFacts,decisions:readonly F8SurfaceResponse[]
 ):Promise<{receiptRef:string;runId:string;policyDigest:string;custodyRef:string}>;
}
const surfaces=(effect:string):readonly CDXSurface[]=>{
 if(effect==="E0_OBSERVE")return [
  "AUTHORITY","IDENTITY_AUTHORITY","CAPABILITY_DELEGATION","BOUNDARY",
  "DATA","CONTENT_MEMORY","RUNTIME_AUTH","EVIDENCE"];
 const base:CDXSurface[]=[
  "AUTHORITY","IDENTITY_AUTHORITY","CAPABILITY_DELEGATION","BOUNDARY",
  "MODEL_AGENT","TOOL_CONNECTOR","RUNTIME_AUTH","EVIDENCE"
 ];
 if(effect==="E3_EXTERNAL_EFFECT")base.push("EXTERNAL_EFFECT");
 return base;
};
export class CDXF8VerifiedAdapter implements CDXPolicyPort {
 readonly catalogue:CDXControlIndex|null;
 readonly facts:F8FactSource|null;
 readonly trust:F8TrustVerifier|null;
 readonly release:F8ReleasedPolicy|null;
 readonly service:F8PolicyService|null;
 readonly obligations:F8ObligationVerifier|null;
 readonly custody:F8CustodyVerifier|null;
 readonly readOnly:boolean;
 constructor(
  catalogue:CDXControlIndex|null,
  facts:F8FactSource|null,
  trust:F8TrustVerifier|null,
  release:F8ReleasedPolicy|null,
  service:F8PolicyService|null,
  obligations:F8ObligationVerifier|null,
  custody:F8CustodyVerifier|null,
  readOnly=false,
 ){
  this.catalogue=catalogue;
  this.facts=facts;
  this.trust=trust;
  this.release=release;
  this.service=service;
  this.obligations=obligations;
  this.custody=custody;
  this.readOnly=readOnly;
 }
 async evaluate(req:CDXDecisionRequest):Promise<CDXPolicyDecision>{
  must(!!this.catalogue&&!!this.facts&&!!this.trust&&!!this.release&&
       !!this.service&&!!this.obligations&&!!this.custody,
       "TRUSTED_PORTS_NOT_BOUND");
  must(/^sha256:[0-9a-f]{64}$/.test(req.expectedPolicyPin),
       "PRODUCTION_POLICY_DIGEST_REQUIRED");
  must(required(req.context.runId)&&required(req.context.agentId)&&
    required(req.context.principalRef)&&required(req.context.authorityRef)&&
    required(req.context.mandateRef)&&required(req.capabilityId)&&required(req.target),
    "IDENTITY_OR_MANDATE_MISSING");
  must((req.context.requestedEffect!=="E0_OBSERVE"||this.readOnly)&&
       req.context.requestedEffect!=="E4_AUTHORITY_CHANGE",
       "SEPARATE_READ_OR_AUTHORITY_GATE_REQUIRED");
  await this.release!.assertReleasedAndBound(req.expectedPolicyPin);
  const facts=await this.facts!.collect(req);
  must(facts.runId===req.context.runId&&
      facts.principalRef===req.context.principalRef&&
      facts.authorityRef===req.context.authorityRef&&
      facts.mandateRef===req.context.mandateRef&&
      facts.agentId===req.context.agentId&&
      facts.target===req.target&&
      facts.effectClass===req.context.requestedEffect&&
      facts.policyPin===req.expectedPolicyPin&&
      required(facts.pathHistoryDigest)&&required(facts.authorityGraphDigest)&&
      required(facts.sourceIdentityRef)&&required(facts.sourceAttestationRef)&&
      required(facts.trustDomain)&&required(facts.observationRef)&&
      ["PUBLIC","INTERNAL","CONFIDENTIAL","RESTRICTED"].includes(facts.dataClassification),
      "TRUSTED_FACT_BINDING_MISMATCH");
  if(req.context.requestedEffect==="E0_OBSERVE")
    must(required(facts.recipientRef)&&required(facts.purposeRef)&&
         required(facts.dataGrantRef)&&
         facts.recipientRef===req.readRecipientRef&&
         facts.purposeRef===req.readPurposeRef&&
         facts.dataGrantRef===req.readGrantRef&&
         facts.dataClassification===req.readClassification,
         "CLASSIFIED_READ_GRANT_MISSING");
  await this.trust!.assertFacts(facts);
  // No agent-supplied surface, controls or external-effect classifier is accepted.
  const requiredSurfaces=surfaces(req.context.requestedEffect);
  const responses:F8SurfaceResponse[]=[];
  for(const surface of requiredSurfaces){
    const expected=this.catalogue!.bySurface.get(surface);
    must(!!expected&&expected.length>0,"MANDATORY_CONTROLS_UNAVAILABLE");
    const contextDigest=digest({surface,facts,policyDigest:req.expectedPolicyPin,
                               controls:expected.map(x=>x.control_id)});
    const r=await this.service!.evaluateSurface({
      surface,contextDigest,policyDigest:req.expectedPolicyPin,
      controlIds:expected.map(x=>x.control_id),facts
    });
    must(!!r&&r.surface===surface&&r.contextDigest===contextDigest&&
         r.policyDigest===req.expectedPolicyPin&&
         r.policyVersion==="1.0.0"&&required(r.decisionRef)&&required(r.signatureRef)&&
         rank.has(r.decision)&&Array.isArray(r.controlResults)&&
         Array.isArray(r.obligationRefs),
         "POLICY_RESULT_UNBOUND");
    const expectedById=new Map(expected.map(x=>[x.control_id,x]));
    const encountered=new Set<string>();
    let calculated:CDXOutcome="ALLOW";
    for(const item of r.controlResults){
      const control=expectedById.get(item.control_id);
      must(!!control&&!encountered.has(item.control_id)&&
           control.section_id===item.section_id&&
           typeof item.pass==="boolean"&&rank.has(item.decision),
           "CONTROL_RESULTS_SUBSTITUTED");
      must(item.pass?item.decision==="ALLOW":
           item.decision===control.decision_on_fail,
           "CONTROL_DECISION_CONTRADICTION");
      encountered.add(item.control_id);
      if(rank.get(item.decision)!>rank.get(calculated)!)calculated=item.decision;
    }
    must(encountered.size===expected.length&&r.decision===calculated,
         "INCOMPLETE_OR_DOWNGRADED_CONTROL_EVALUATION");
    await this.trust!.assertSignedDecision(r,contextDigest);
    responses.push(r);
  }
  let final:CDXOutcome="ALLOW";
  const obligations=[...new Set(responses.flatMap(x=>x.obligationRefs))];
  for(const response of responses)
    if(rank.get(response.decision)!>rank.get(final)!)final=response.decision;
  if(final==="ALLOW_WITH_CONTROLS"){
    must(obligations.length>0,"OBLIGATIONS_NOT_DECLARED");
    await this.obligations!.assertFulfilled(obligations,facts);
  }
  // Every CDX decision, including restrictive ones, requires custody evidence.
  const receipt=await this.custody!.assertPreserved(facts,responses);
  must(!!receipt&&required(receipt.receiptRef)&&required(receipt.custodyRef)&&
    receipt.runId===facts.runId&&receipt.policyDigest===req.expectedPolicyPin,
    "SPETL_CUSTODY_UNVERIFIED");
  return {
   outcome:final,decisionRef:responses.map(x=>x.decisionRef).join(";"),
   policyPin:req.expectedPolicyPin,spetlReceiptRef:receipt.receiptRef,
   evaluatedTarget:req.target,evaluatedEffect:req.context.requestedEffect,
   decisionAuthenticated:true,spetlReceiptVerified:true,
   obligationsVerified:final==="ALLOW_WITH_CONTROLS"||final==="ALLOW",
  };
 }
}

