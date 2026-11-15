/**
 * Bound, parameterized PostgreSQL operations for the data-asset migration.
 * These are explicit application ports, not a daemon or an authorized runner.
 * Callers must supply their verified mandate and control the transaction.
 */
export interface SqlClient {
  query(sql: string, params: readonly unknown[]): Promise<unknown>;
}
export interface WorkOrderInsert {
  workOrderId: string;
  requestId: string;
  ownerRepo: string;
  purpose: string;
  authorityRef: string;
  requirements: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
}
export interface AssetVersionInsert {
  assetVersionId: string;
  assetId: string;
  ownerRepo: string;
  assetKind: "RAW"|"TABULAR_BASE"|"SPATIAL_BASE"|"DERIVED_ANALYSIS"|"PRESENTATION";
  schemaRef: string;
  locationRef: string;
  sha256: string;
  sourceAsOf: string;
  validity: Record<string, unknown>;
  compatibility: Record<string, unknown>;
  licenseRef: string;
  qaReceiptRef: string;
  sourceRefs: readonly string[];
  supersedesVersionId?: string;
  registeredBy: string;
}
export interface ReuseDecisionInsert {
  decisionId: string;
  workOrderId: string;
  decision: "REUSE_EXACT"|"REUSE_WITH_TRANSFORMATION"|"REFRESH_REQUIRED"|"NEW_SOURCE_REQUIRED"|"BLOCKED";
  candidateVersionIds: readonly string[];
  selectedVersionIds: readonly string[];
  rationale: string;
  evidenceRefs: readonly string[];
  decidedBy: string;
  decidedAt: string;
}
function requireNonEmpty(...values: string[]): void {
  if (values.some(s => !s || !s.trim())) throw new Error("Missing required authority or identity");
}
export async function persistWorkOrder(db: SqlClient, order: WorkOrderInsert): Promise<void> {
  requireNonEmpty(order.workOrderId, order.requestId, order.ownerRepo, order.authorityRef, order.createdBy, order.purpose);
  if (!Number.isFinite(Date.parse(order.createdAt))) throw new Error("Invalid createdAt");
  await db.query(
    `insert into ffos_data_work_orders
    (work_order_id,request_id,owner_repo,purpose,authority_ref,requirements,created_at,created_by)
    values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)`,
    [order.workOrderId,order.requestId,order.ownerRepo,order.purpose,order.authorityRef,
     JSON.stringify(order.requirements),order.createdAt,order.createdBy],
  );
}
export async function persistAssetVersion(db: SqlClient, asset: AssetVersionInsert): Promise<void> {
  requireNonEmpty(asset.assetVersionId, asset.assetId, asset.ownerRepo, asset.schemaRef,
    asset.locationRef, asset.qaReceiptRef, asset.licenseRef, asset.registeredBy);
  if (!/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error("Invalid SHA256");
  if (!Number.isFinite(Date.parse(asset.sourceAsOf))) throw new Error("Invalid sourceAsOf");
  await db.query(
    `insert into ffos_data_asset_versions
    (asset_version_id,asset_id,owner_repo,asset_kind,schema_ref,location_ref,
     content_sha256,source_as_of,validity,compatibility,license_ref,qa_receipt_ref,
     source_refs,supersedes_version_id,registered_by)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13::jsonb,$14,$15)`,
    [asset.assetVersionId,asset.assetId,asset.ownerRepo,asset.assetKind,asset.schemaRef,
     asset.locationRef,asset.sha256,asset.sourceAsOf,JSON.stringify(asset.validity),
     JSON.stringify(asset.compatibility),asset.licenseRef,asset.qaReceiptRef,
     JSON.stringify(asset.sourceRefs),asset.supersedesVersionId ?? null,asset.registeredBy],
  );
}
export async function persistReuseDecision(db: SqlClient, d: ReuseDecisionInsert): Promise<void> {
  requireNonEmpty(d.decisionId,d.workOrderId,d.rationale,d.decidedBy);
  if (!Number.isFinite(Date.parse(d.decidedAt))) throw new Error("Invalid decidedAt");
  if (d.decision === "REUSE_EXACT" && d.selectedVersionIds.length !== 1) {
    throw new Error("Exact reuse requires one selected version");
  }
  await db.query(
    `insert into ffos_data_reuse_decisions
    (decision_id,work_order_id,decision,candidates,selected_asset_version_ids,
     rationale,evidence_refs,decided_by,decided_at)
    values ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7::jsonb,$8,$9)`,
    [d.decisionId,d.workOrderId,d.decision,JSON.stringify(d.candidateVersionIds),
     JSON.stringify(d.selectedVersionIds),d.rationale,JSON.stringify(d.evidenceRefs),
     d.decidedBy,d.decidedAt],
  );
}
