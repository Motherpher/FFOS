export type AuthorityClass = "DIRECTOR" | "SYSTEM" | "CONNECTOR" | "FUTURE_ROLE";

export type WorkStatus =
  | "DRAFT"
  | "READY"
  | "ACTIVE"
  | "HOLD"
  | "BLOCKED"
  | "COMPLETE"
  | "CANCELLED"
  | "ARCHIVED";

export type RunStatus =
  | "QUEUED"
  | "RUNNING"
  | "PASS"
  | "PASS_WITH_WARNING"
  | "FAIL"
  | "HOLD"
  | "SKIPPED"
  | "WAIVED"
  | "CANCELLED";

export type DispatchStatus =
  | "DRAFT"
  | "READY"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "SENT"
  | "ACKNOWLEDGED"
  | "FAILED"
  | "HOLD"
  | "REJECTED"
  | "CLOSED";

export type DecisionStatus = "PROPOSED" | "REQUIRED" | "MADE" | "SUPERSEDED" | "REVOKED";

export type ObjectType =
  | "PROGRAMME"
  | "PROJECT"
  | "MISSION"
  | "WORK_PACKAGE"
  | "RUN"
  | "DISPATCH"
  | "OUTPUT"
  | "DECISION";

export interface ProvenanceRef {
  kind: "OBJECT" | "RUN" | "DISPATCH" | "DECISION" | "DOCUMENT" | "COMMIT" | "EXTERNAL_RECEIPT" | "SYSTEM";
  ref: string;
  sourceSystem: string;
  version?: string | number;
  note?: string;
}

export interface FFOSBaseObject {
  id: string;
  type: ObjectType;
  title: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sourceSystem: string;
  sourceRef?: string;
  parentId?: string;
  tags: string[];
  provenance: ProvenanceRef[];
}

export interface Programme extends FFOSBaseObject {
  type: "PROGRAMME";
  status: WorkStatus;
  purpose: string;
}

export interface Project extends FFOSBaseObject {
  type: "PROJECT";
  status: WorkStatus;
  objective: string;
  programmeId?: string;
}

export interface Mission extends FFOSBaseObject {
  type: "MISSION";
  status: WorkStatus;
  objective: string;
  projectId: string;
  successCondition?: string;
}

export interface WorkPackage extends FFOSBaseObject {
  type: "WORK_PACKAGE";
  status: WorkStatus;
  missionId: string;
  objective: string;
  owner?: string;
  inputs: string[];
  constraints: string[];
  acceptanceCriteria: string[];
}

export interface Run extends FFOSBaseObject {
  type: "RUN";
  status: RunStatus;
  workPackageId?: string;
  procedure: string;
  procedureVersion?: string;
  inputRefs: string[];
  outputRefs: string[];
  terminationReason?: string;
  startedAt?: string;
  endedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface DispatchRecipient {
  id: string;
  label: string;
  recipientType: "PERSON" | "ROLE" | "SYSTEM" | "REPOSITORY" | "SITE" | "CONNECTOR" | "AGENCY" | "OTHER";
}

export interface Dispatch extends FFOSBaseObject {
  type: "DISPATCH";
  status: DispatchStatus;
  origin: string;
  recipients: DispatchRecipient[];
  destinationType: string;
  payloadRefs: string[];
  instruction: string;
  requiredInputs: string[];
  forbiddenMove?: string;
  approvalRequired: boolean;
  approvalAuthority?: AuthorityClass;
  sentAt?: string;
  acknowledgedAt?: string;
  closedAt?: string;
  externalReceipt?: string;
  routeCode?: string;
}

export interface Output extends FFOSBaseObject {
  type: "OUTPUT";
  status: WorkStatus;
  artifactType: string;
  producedByRunId?: string;
  producedByDispatchId?: string;
  uri?: string;
  checksum?: string;
}

export interface Decision extends FFOSBaseObject {
  type: "DECISION";
  status: DecisionStatus;
  authority: AuthorityClass;
  actorId: string;
  decisionType: "APPROVE" | "REJECT" | "HOLD" | "CLOSE" | "WAIVE" | "OVERRIDE" | "REDIRECT" | "OTHER";
  targetObjectId: string;
  rationale?: string;
  decidedAt?: string;
}

export type FFOSObject = Programme | Project | Mission | WorkPackage | Run | Dispatch | Output | Decision;

export interface StateTransitionEvent {
  eventId: string;
  objectId: string;
  objectType: ObjectType;
  fromState?: string;
  toState: string;
  actorClass: AuthorityClass;
  actorId: string;
  timestamp: string;
  causeRef?: string;
  provenance: ProvenanceRef[];
  metadata?: Record<string, unknown>;
}

export function canDispatch(runStatus: RunStatus, directorWaiver = false): boolean {
  return runStatus === "PASS" || runStatus === "PASS_WITH_WARNING" || directorWaiver;
}
