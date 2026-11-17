export type EvaluationParticipant={id:string;segments:Record<string,string>};
export type ExposureObservation={participantId:string;doseRatio?:number};
export type OutcomeMeasurement={participantId:string;level:"T1"|"T2"|"T3";positive:boolean;contributionState?:string;observedAt?:string};
export type EvaluationSlice={level:"T1"|"T2"|"T3";segmentKey?:string;segmentValue?:string};

export function evaluateUdlSlice(participants:EvaluationParticipant[],exposures:ExposureObservation[],measurements:OutcomeMeasurement[],slice:EvaluationSlice){
 let cohort=participants;
 if(slice.segmentKey)cohort=cohort.filter(p=>p.segments[slice.segmentKey!]===slice.segmentValue);
 const ids=new Set(cohort.map(x=>x.id));
 const ms=measurements.filter(m=>m.level===slice.level&&ids.has(m.participantId));
 const positive=ms.filter(x=>x.positive).length;const respondents=ms.length;const n=cohort.length;
 const disclosure=n<5?"SUPPRESSED":n<10?"EXPLORATORY_WARNING":"NORMAL";
 const exp=exposures.filter(e=>ids.has(e.participantId)&&e.doseRatio!==undefined);
 const bands={LOW:0,MID:0,HIGH:0,UNKNOWN:n-exp.length};
 for(const x of exp){const d=x.doseRatio!;if(d<.34)bands.LOW++;else if(d<.67)bands.MID++;else bands.HIGH++;}
 const contribution:Record<string,number>={};for(const m of ms){if(m.contributionState)contribution[m.contributionState]=(contribution[m.contributionState]??0)+1;}
 return {sourceProtocol:"UDL_ADAPTER",level:slice.level,cohortN:n,respondents,missing:n-respondents,positive,
   respondentRate:respondents?positive/respondents:null,originalCohortRate:n?positive/n:null,
   exposureBands:bands,contributionStates:contribution,disclosure,
   causalClaim:false,denominators:{respondent:respondents,originalCohort:n},
   rule:"T1/T2/T3, exposure, cohort, attrition and contribution are analytical projections; ProjectHub does not manufacture causal proof or universal exposure definitions."};
}
