export const METHODOLOGY_PROFILES = ["FULL_FF","CONFIGURED","PROJECT_NATIVE"] as const;
export type MethodologyProfile = typeof METHODOLOGY_PROFILES[number];

export const PROJECT_FIELD_DIMENSIONS = [
  "Need","Purpose","Actors","Evidence","Mechanism","Resources","Funding","Outcomes"
] as const;
export type ProjectFieldDimensionName = typeof PROJECT_FIELD_DIMENSIONS[number];

export const FIELD_MATURITY = ["UNKNOWN","SEED","DRAFT","DESIGNED","NORTH_STAR"] as const;
export type FieldMaturity = typeof FIELD_MATURITY[number];

export const DATA_CLASSES = ["PH-D0","PH-D1","PH-D2","PH-D3","PH-D4","PH-D5"] as const;
export type ProjectDataClass = typeof DATA_CLASSES[number];

export type RelationScope = "OWNED" | "SHARED_REFERENCE" | "EXTERNAL_REFERENCE";

export type ProvenanceRef = {
  kind: "SOURCE" | "DOCUMENT" | "COMMIT" | "DISPATCH" | "DECISION" | "EXTERNAL_RECEIPT" | "SYSTEM";
  ref: string;
  sourceSystem: string;
  version?: string;
  note?: string;
};

export type ProjectFieldDimension = {
  name: ProjectFieldDimensionName;
  maturity: FieldMaturity;
  note: string | null;
  evidenceRefs: string[];
  premiseRefs: string[];
  version: number;
  provenance: ProvenanceRef[];
};

export type ProjectProfile = {
  projectId: string;
  ownerRef: string;
  mandateRef: string;
  methodologyProfile: MethodologyProfile;
  selectedMethodRefs: string[];
  purpose: string;
  scope: string[];
  nonScope: string[];
  dataClassCeiling: ProjectDataClass;
  optionalAssignmentDossierRef?: string;
  optionalFfcRefs: string[];
  optionalPiusRefs: string[];
  externalMethodRefs: string[];
  version: number;
  provenance: ProvenanceRef[];
};

export type ProjectCore = {
  projectId: string;
  need: string | null;
  purpose: string;
  targetGroups: string[];
  mechanism: string | null;
  intervention: string | null;
  constraints: string[];
  premiseRefs: string[];
  unknownRefs: string[];
  version: number;
  provenance: ProvenanceRef[];
};

export type ProjectRecord = {
  id: string;
  title: string;
  status: "DRAFT" | "READY" | "ACTIVE" | "HOLD" | "BLOCKED" | "COMPLETE" | "CANCELLED" | "ARCHIVED";
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  profile: ProjectProfile;
  core: ProjectCore;
  field: Record<ProjectFieldDimensionName, ProjectFieldDimension>;
  provenance: ProvenanceRef[];
};

export type ProjectNode = {
  id: string;
  projectId: string;
  kind: string;
  title: string;
  version: number;
  provenance: ProvenanceRef[];
};

export type ProjectRelation = {
  id: string;
  projectId: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  scope: RelationScope;
  version: number;
  provenance: ProvenanceRef[];
};

export type CreateProjectInput = {
  id: string;
  title: string;
  ownerRef: string;
  mandateRef: string;
  methodologyProfile: MethodologyProfile;
  selectedMethodRefs?: string[];
  purpose: string;
  scope?: string[];
  nonScope?: string[];
  dataClassCeiling?: ProjectDataClass;
  optionalAssignmentDossierRef?: string;
  optionalFfcRefs?: string[];
  optionalPiusRefs?: string[];
  externalMethodRefs?: string[];
  createdBy: string;
  provenance?: ProvenanceRef[];
};

export class ProjectHubInvariantError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.name = "ProjectHubInvariantError";
    this.code = code;
  }
}

export function assertMethodologyProfile(profile: string): asserts profile is MethodologyProfile {
  if (!(METHODOLOGY_PROFILES as readonly string[]).includes(profile)) {
    throw new ProjectHubInvariantError("INVALID_METHODOLOGY_PROFILE");
  }
}

export function assertFieldMaturity(maturity: string): asserts maturity is FieldMaturity {
  if (!(FIELD_MATURITY as readonly string[]).includes(maturity)) {
    throw new ProjectHubInvariantError("INVALID_FIELD_MATURITY");
  }
}

export function makeEmptyField(): Record<ProjectFieldDimensionName, ProjectFieldDimension> {
  return Object.fromEntries(PROJECT_FIELD_DIMENSIONS.map((name) => [name, {
    name, maturity: "UNKNOWN", note: null, evidenceRefs: [], premiseRefs: [], version: 1, provenance: [],
  }])) as Record<ProjectFieldDimensionName, ProjectFieldDimension>;
}

export const PROJECT_ROLES = [
  "PROJECT_OWNER","PROJECT_OPERATOR","REVIEWER","SERVICE","PARTICIPANT_DATA_STEWARD"
] as const;
export type ProjectRole = typeof PROJECT_ROLES[number];

export const PROJECT_OPERATIONS = [
  "PROJECT_READ","PROJECT_MUTATE","PROJECT_ROLE_ADMIN","PROJECT_STEWARD_REVIEW","PROJECT_EXPORT"
] as const;
export type ProjectOperation = typeof PROJECT_OPERATIONS[number];

export type ProjectRoleGrant = {
  grantId: string;
  projectId: string;
  principalRef: string;
  role: ProjectRole;
  allowedOperations: ProjectOperation[];
  dataClassCeiling: ProjectDataClass;
  validFrom: string;
  validUntil?: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  grantAuthorityRef: string;
  version: number;
  provenance: ProvenanceRef[];
};

export type ProjectHubAuditEvent = {
  eventId: string;
  projectId: string;
  objectId: string;
  eventType: string;
  fromState?: string;
  toState?: string;
  principalRef: string;
  authorityRef: string;
  mandateRef: string;
  commandId: string;
  correlationId: string;
  causationId: string;
  dataClass: ProjectDataClass;
  occurredAt: string;
  payload: Record<string, unknown>;
  provenance: ProvenanceRef[];
};

export type IdempotencyReceipt = {
  idempotencyKey: string;
  projectId: string;
  operation: string;
  commandDigest: string;
  result: unknown;
  recordedAt: string;
};

export type CommandContext = {
  principalRef: string;
  principalClass: "DIRECTOR" | "PROJECT_ROLE" | "SERVICE";
  authorityRef: string;
  mandateRef: string;
  idempotencyKey: string;
  correlationId: string;
  causationId: string;
};

export const DATA_CLASS_ORDER: Record<ProjectDataClass,number> = {
  "PH-D0":0,"PH-D1":1,"PH-D2":2,"PH-D3":3,"PH-D4":4,"PH-D5":5
};

export function dataClassWithin(requested:ProjectDataClass,ceiling:ProjectDataClass):boolean {
  return DATA_CLASS_ORDER[requested] <= DATA_CLASS_ORDER[ceiling];
}
