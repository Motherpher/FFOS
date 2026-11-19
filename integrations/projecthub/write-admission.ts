/**
 * Canonical source-controlled admission state for ProjectHub production writes.
 *
 * Environment flags cannot override this state. It may only move to ACCEPTED
 * in a reviewed source change after the protected writer identity, live
 * rollback-only canary, CDX A3 evidence and Director release decision exist.
 */
export type ProjectHubWriteAdmissionState="NOT_ACCEPTED"|"ACCEPTED";

export interface ProjectHubWriteAdmission {
  state:ProjectHubWriteAdmissionState;
  processId:string;
  contract:string;
  admittedDataClasses:readonly string[];
  excludedDataClasses:readonly string[];
  writerIdentity:string;
  executionRole:string;
  evidenceRefs:readonly string[];
  reason:string;
}

export const PROJECTHUB_WRITE_ADMISSION:ProjectHubWriteAdmission={
  state:"NOT_ACCEPTED",
  processId:"FFOS-DEVOPS-PH-PROD-001",
  contract:"PROJECTHUB-CONTRACT-v0.4",
  admittedDataClasses:["PH-D0","PH-D1","PH-D2","PH-D3"],
  excludedDataClasses:["PH-D4","PH-D5"],
  writerIdentity:"ffos_projecthub_writer_login",
  executionRole:"ffos_projecthub_runtime",
  evidenceRefs:[
    "Motherpher/FFOS#102",
    "Motherpher/FFOS#110",
    "Motherpher/FFOS#119"
  ],
  reason:"Writer principal and source binding are being built; live credential/canary and production release are not yet accepted."
};
