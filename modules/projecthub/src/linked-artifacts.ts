import type {ProvenanceRef} from "../../../packages/projecthub-model/src/index.ts";

export type LinkedArtifactCanonicality="REFERENCE"|"DERIVED"|"WORKING"|"BIDIRECTIONAL_REVIEW"|"CANONICAL_EXTERNAL";
export type LinkedArtifactSyncPolicy="NONE"|"PULL"|"PUSH_DERIVED"|"BIDIRECTIONAL_REVIEW"|"EXTERNAL_AUTHORITY";

export type LinkedArtifact={
  artifactId:string;projectId:string;system:"MIRO"|"FIGMA"|"GITHUB"|"DRIVE_DOCS"|"FUNDING_PROVIDER"|"OTHER";
  artifactType:string;externalRef:string;canonicality:LinkedArtifactCanonicality;syncPolicy:LinkedArtifactSyncPolicy;
  sourceObjectRefs:string[];externalVersion?:string;internalVersion:string;provenance:ProvenanceRef[];
};

export type InboundArtifactProposal={
  proposalId:string;artifactId:string;projectId:string;system:LinkedArtifact["system"];externalVersion?:string;
  externalDigest:string;externalPayload:unknown;state:"REVIEW_REQUIRED"|"MAPPING_REQUIRED";
};

async function sha256(value:unknown){
  const raw=new TextEncoder().encode(JSON.stringify(value));
  const hash=await crypto.subtle.digest("SHA-256",raw);
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");
}

export async function stageOutbound(artifact:LinkedArtifact,canonicalPayload:unknown){
  if(artifact.syncPolicy==="NONE")throw new Error("SYNC_POLICY_NONE");
  return {status:"STAGED_OUTBOUND" as const,providerCallExecuted:false,externalWrite:false,
    artifactId:artifact.artifactId,system:artifact.system,externalRef:artifact.externalRef,
    canonicality:artifact.canonicality,syncPolicy:artifact.syncPolicy,source:canonicalPayload,
    semanticAuthority:"FFOS_PROJECTHUB",digest:await sha256(canonicalPayload)};
}

export async function reviewInbound(artifact:LinkedArtifact,externalPayload:unknown):Promise<
 {status:"REJECTED_INBOUND";reason:string;externalWrite:false}|
 {status:"REVIEW_REQUIRED"|"MAPPING_REQUIRED";proposal:InboundArtifactProposal;externalWrite:false}>{
  if(["NONE","PUSH_DERIVED"].includes(artifact.syncPolicy))
    return {status:"REJECTED_INBOUND",reason:"SYNC_POLICY_NOT_INBOUND",externalWrite:false};
  const status=(artifact.syncPolicy==="BIDIRECTIONAL_REVIEW"||artifact.canonicality==="WORKING")?"REVIEW_REQUIRED":"MAPPING_REQUIRED";
  return {status,proposal:{proposalId:crypto.randomUUID(),artifactId:artifact.artifactId,projectId:artifact.projectId,
    system:artifact.system,externalVersion:artifact.externalVersion,externalDigest:await sha256(externalPayload),
    externalPayload,state:status},externalWrite:false};
}

export function approveInbound(proposal:InboundArtifactProposal,approvalRef:string){
  if(!approvalRef?.trim())throw new Error("APPROVAL_REF_REQUIRED");
  return {status:"APPROVED_FOR_GOVERNED_PROJECTHUB_COMMAND" as const,approvalRef,proposal,
    providerCallExecuted:false,externalWrite:false,
    rule:"Approval authorizes preparation of a typed ProjectHub command; it does not itself mutate canonical state."};
}
