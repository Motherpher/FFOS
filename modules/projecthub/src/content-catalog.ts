/**
 * ProjectHub read-only catalog of proposed external FFC content formats.
 *
 * No FFC source text is duplicated here. Canonical content belongs to FFC;
 * ProjectHub's project/data authority remains governed by Contract v0.4.
 *
 * DEVELOPMENTAL: entries below are NOT public releases, grant approvals,
 * accepted ProjectIngress records, or permission to write ProjectCore/DNA.
 */
export const PROJECT_CONTENT_IDS = [
  "MICRO_A_QUESTION",
  "MICRO_B_SYNOPSIS",
  "MICRO_C_IDEA_FRAME",
  "MICRO_D_MICROPROJECT",
  "PROJECT_SMALL",
  "PROJECT_MEDIUM",
  "PROJECT_LARGE",
] as const;
export type ProjectContentId = typeof PROJECT_CONTENT_IDS[number];
export type ProjectContentKind = "MICRO_BOX" | "PROJECT_TEMPLATE";
export type ProjectContentState = "DRAFT_TEXT" | "PREPUBLICATION_REVIEW" | "PUBLISHED";
export type ProjectContentFormat = Readonly<{
  id: ProjectContentId;
  title: string;
  kind: ProjectContentKind;
  sourceRepository: "Motherpher/form-flode";
  sourcePath: string;
  language: "sv";
  state: ProjectContentState;
  publicDownloadAllowed: boolean;
  candidateForProjectIngressReview: boolean;
  projectSize?: "MIKRO" | "LITEN" | "MELLAN" | "STOR";
}>;

const sourceDir = "15-innovation/project-content-kit/" as const;

// Versions are governed in FFC. These stable repository/path references do
// not imply the unmerged FFC development PR has been made canonical.
const catalog: readonly ProjectContentFormat[] = [
  {
    id:"MICRO_A_QUESTION",title:"Frågeställning",kind:"MICRO_BOX",
    sourceRepository:"Motherpher/form-flode",sourcePath:sourceDir+"micro-box-core-v0.1.md",
    language:"sv",state:"DRAFT_TEXT",publicDownloadAllowed:false,candidateForProjectIngressReview:false
  },
  {
    id:"MICRO_B_SYNOPSIS",title:"Synopsis",kind:"MICRO_BOX",
    sourceRepository:"Motherpher/form-flode",sourcePath:sourceDir+"micro-box-core-v0.1.md",
    language:"sv",state:"DRAFT_TEXT",publicDownloadAllowed:false,candidateForProjectIngressReview:false
  },
  {
    id:"MICRO_C_IDEA_FRAME",title:"Idéram",kind:"MICRO_BOX",
    sourceRepository:"Motherpher/form-flode",sourcePath:sourceDir+"micro-box-core-v0.1.md",
    language:"sv",state:"DRAFT_TEXT",publicDownloadAllowed:false,candidateForProjectIngressReview:false
  },
  {
    id:"MICRO_D_MICROPROJECT",title:"Mikroprojekt",kind:"MICRO_BOX",
    sourceRepository:"Motherpher/form-flode",sourcePath:sourceDir+"micro-box-core-v0.1.md",
    language:"sv",state:"DRAFT_TEXT",publicDownloadAllowed:false,candidateForProjectIngressReview:true,projectSize:"MIKRO"
  },
  {
    id:"PROJECT_SMALL",title:"Projektmall Liten",kind:"PROJECT_TEMPLATE",
    sourceRepository:"Motherpher/form-flode",sourcePath:sourceDir+"projektmall-liten-v0.1.md",
    language:"sv",state:"DRAFT_TEXT",publicDownloadAllowed:false,candidateForProjectIngressReview:true,projectSize:"LITEN"
  },
  {
    id:"PROJECT_MEDIUM",title:"Projektmall Mellan",kind:"PROJECT_TEMPLATE",
    sourceRepository:"Motherpher/form-flode",sourcePath:sourceDir+"projektmall-mellan-v0.1.md",
    language:"sv",state:"DRAFT_TEXT",publicDownloadAllowed:false,candidateForProjectIngressReview:true,projectSize:"MELLAN"
  },
  {
    id:"PROJECT_LARGE",title:"Projektmall Stor",kind:"PROJECT_TEMPLATE",
    sourceRepository:"Motherpher/form-flode",sourcePath:sourceDir+"projektmall-stor-v0.1.md",
    language:"sv",state:"DRAFT_TEXT",publicDownloadAllowed:false,candidateForProjectIngressReview:true,projectSize:"STOR"
  }
] as const;

export function listProjectContentFormats():readonly ProjectContentFormat[]{
  return catalog.map(x=>({...x}));
}

export function getProjectContentFormat(id:string):ProjectContentFormat | null{
  const item=catalog.find(x=>x.id===id);
  return item?{...item}:null;
}

/** No project is created, no DNA is modified, no source is imported. */
export function assessContentRouting(id:string):
  | {state:"UNKNOWN_CONTENT";requiresHumanReview:true;createProject:false;createDna:false}
  | {state:"SOURCE_ONLY"|"CANDIDATE_FOR_PROJECT_INGRESS_REVIEW";
     requiresHumanReview:true;createProject:false;createDna:false;
     methodologyImposed:false;sourceRepository:string;sourcePath:string}{
  const item=getProjectContentFormat(id);
  if(!item)return {state:"UNKNOWN_CONTENT",requiresHumanReview:true,createProject:false,createDna:false};
  return {
    state:item.candidateForProjectIngressReview?"CANDIDATE_FOR_PROJECT_INGRESS_REVIEW":"SOURCE_ONLY",
    requiresHumanReview:true,createProject:false,createDna:false,methodologyImposed:false,
    sourceRepository:item.sourceRepository,sourcePath:item.sourcePath
  };
}
