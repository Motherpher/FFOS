export type FundingProfile={
 applicantType?:string;geographies:string[];targetGroups:string[];domains:string[];requestedMinorUnits?:bigint;currency?:string;
};
export type FundingOpportunity={
 id:string;eligibleApplicantTypes?:string[];geographies?:string[];targetGroups?:string[];domains?:string[];
 minMinorUnits?:bigint;maxMinorUnits?:bigint;currency?:string;deadline?:string;
 requiresMissionChange?:boolean;requiresTargetGroupChange?:boolean;requiresMethodChange?:boolean;adminBurden?:"LOW"|"MEDIUM"|"HIGH"|"VERY_HIGH";
};
const norm=(x?:string[])=>new Set((x??[]).map(v=>v.toLowerCase()));
const overlap=(a?:string[],b?:string[])=>{
 const aa=norm(a),bb=norm(b);if(!aa.size||!bb.size)return "UNKNOWN";
 return [...aa].some(x=>bb.has(x))?"FIT":"MISFIT";
};
export function assessFunding(profile:FundingProfile,o:FundingOpportunity,today:string){
 const failures:string[]=[];const unknowns:string[]=[];
 if(o.eligibleApplicantTypes?.length){
   if(!profile.applicantType)unknowns.push("APPLICANT_TYPE");
   else if(!norm(o.eligibleApplicantTypes).has(profile.applicantType.toLowerCase()))failures.push("APPLICANT_TYPE");
 }
 if(o.geographies?.length){if(!profile.geographies.length)unknowns.push("GEOGRAPHY");else if(overlap(profile.geographies,o.geographies)==="MISFIT")failures.push("GEOGRAPHY");}
 if(o.targetGroups?.length){if(!profile.targetGroups.length)unknowns.push("TARGET_GROUP");else if(overlap(profile.targetGroups,o.targetGroups)==="MISFIT")failures.push("TARGET_GROUP");}
 if((o.minMinorUnits!==undefined||o.maxMinorUnits!==undefined)&&profile.requestedMinorUnits===undefined)unknowns.push("REQUESTED_AMOUNT");
 if(profile.requestedMinorUnits!==undefined&&o.minMinorUnits!==undefined&&profile.requestedMinorUnits<o.minMinorUnits)failures.push("AMOUNT_BELOW_MIN");
 if(profile.requestedMinorUnits!==undefined&&o.maxMinorUnits!==undefined&&profile.requestedMinorUnits>o.maxMinorUnits)failures.push("AMOUNT_ABOVE_MAX");
 if(profile.currency&&o.currency&&profile.currency!==o.currency)failures.push("CURRENCY_MISMATCH");
 if(o.deadline&&new Date(o.deadline+"T23:59:59Z")<new Date(today+"T00:00:00Z"))failures.push("DEADLINE_EXPIRED");
 const distortion:string[]=[];
 if(o.requiresMissionChange)distortion.push("MISSION_DRIFT");
 if(o.requiresTargetGroupChange)distortion.push("TARGET_GROUP_DRIFT");
 if(o.requiresMethodChange)distortion.push("METHOD_DISTORTION");
 if(o.adminBurden==="HIGH"||o.adminBurden==="VERY_HIGH")distortion.push("ADMIN_BURDEN_"+o.adminBurden);
 return {eligibility:failures.length?"FAIL":unknowns.length?"UNKNOWN":"PASS",hardFailures:failures,unknowns,
   fit:{purpose:overlap(profile.domains,o.domains),targetGroup:overlap(profile.targetGroups,o.targetGroups),geography:overlap(profile.geographies,o.geographies)},
   distortionRisks:distortion,universalScore:null};
}
