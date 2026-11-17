import type {ProjectFieldDimensionName} from "../../../packages/projecthub-model/src/index.ts";
import type {ProjectHubActionClass} from "./effect-gate.ts";

export type StewardProposal={
  proposalId:string;projectId:string;actionClass:ProjectHubActionClass;code:string;title:string;reason:string;
  targetRefs:string[];state:"PROPOSED"|"ADOPTED"|"REJECTED"|"EXPIRED"|"EXECUTED"|"FAILED";
  requiredAuthority:"NONE"|"PROJECT"|"DIRECTOR"|"EXTERNAL_ACTION";
};

export class ProjectSteward {
  propose(input:{projectId:string;unknownDimensions?:ProjectFieldDimensionName[];
    monitoring?:Record<string,{status:string}>;openDecisionRefs?:string[];fundingAttentionRefs?:string[]}):StewardProposal[]{
    const rows:StewardProposal[]=[];let n=0;
    const add=(p:Omit<StewardProposal,"proposalId"|"projectId"|"state">)=>rows.push({
      proposalId:`STW-${input.projectId}-${++n}`,projectId:input.projectId,state:"PROPOSED",...p
    });
    for(const d of input.unknownDimensions??[])add({actionClass:"A1",code:"RESOLVE_FIELD_UNKNOWN",
      title:`Resolve Project Field evidence/state: ${d}`,reason:"UNKNOWN_DIMENSION",targetRefs:[d],requiredAuthority:"NONE"});
    for(const [k,v] of Object.entries(input.monitoring??{})){
      if(v.status==="BLOCKED")add({actionClass:"A2",code:"PREPARE_STRATUM_RECOVERY",title:`Prepare recovery proposal: ${k}`,
        reason:"BLOCKED_STRATUM",targetRefs:[k],requiredAuthority:"PROJECT"});
      else if(v.status==="ATTENTION")add({actionClass:"A1",code:"ANALYSE_STRATUM",title:`Analyse attention: ${k}`,
        reason:"ATTENTION_STRATUM",targetRefs:[k],requiredAuthority:"NONE"});
    }
    for(const ref of input.openDecisionRefs??[])add({actionClass:"A2",code:"PREPARE_DECISION_BRIEF",title:"Prepare decision brief",
      reason:"OPEN_DECISION",targetRefs:[ref],requiredAuthority:"PROJECT"});
    for(const ref of input.fundingAttentionRefs??[])add({actionClass:"A2",code:"PREPARE_FUNDING_REVIEW",title:"Prepare funding review",
      reason:"FUNDING_ATTENTION",targetRefs:[ref],requiredAuthority:"PROJECT"});
    return rows;
  }
  adopt(proposal:StewardProposal){
    if(proposal.actionClass==="A4")return {...proposal,state:"ADOPTED" as const,requiredAuthority:"EXTERNAL_ACTION" as const};
    if(proposal.actionClass==="A5")return {...proposal,state:"ADOPTED" as const,requiredAuthority:"DIRECTOR" as const};
    return {...proposal,state:"ADOPTED" as const};
  }
  assertGenericExecutable(proposal:StewardProposal){
    if(proposal.actionClass==="A4")throw new Error("A4_REQUIRES_SEPARATE_EXTERNAL_ACTION_PATH");
    if(proposal.actionClass==="A5")throw new Error("A5_HUMAN_GOVERNANCE_REQUIRED");
  }
}
