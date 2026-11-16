/**
 * FFOS Data Asset Registry runtime persistence port.
 * No agent activation, API serving, database provisioning or credential access.
 * Callers supply a pre-authorized execution scope and an injected SQL pool.
 */
import type { SqlPool } from "./stable-registry.ts";
import {
  persistWorkOrder, persistAssetVersion, persistReuseDecision,
  type WorkOrderInsert, type AssetVersionInsert, type ReuseDecisionInsert,
} from "../../registry/src/data-assets-store.ts";

export interface DataRegistryAuthority {
  assertMayWrite(p: {authorityRef:string; actorRef:string; scope:string}): Promise<void>;
}
export interface WorkOrderReceipt {
  workOrderId: string;
  stored: boolean;
  databaseReadback: true;
  schema: "ffos";
  recordType: "WORK_ORDER";
}
export interface ReuseReceipt {
  decisionId: string;
  workOrderId: string;
  databaseReadback: true;
  schema: "ffos";
  recordType: "REUSE_DECISION";
}
export class DataAssetPgRuntime {
  constructor(
    private readonly pool: SqlPool,
    private readonly gate: DataRegistryAuthority,
  ) {}
  private async tx<T>(task: (db: Awaited<ReturnType<SqlPool["connect"]>>) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    let begun = false;
    try {
      await client.query("BEGIN");
      begun = true;
      const result = await task(client);
      await client.query("COMMIT");
      begun = false;
      return result;
    } catch (error) {
      if (begun) {
        try { await client.query("ROLLBACK"); } catch { /* preserve original error */ }
      }
      throw error;
    } finally {
      client.release();
    }
  }
  async createWorkOrder(order: WorkOrderInsert, actorRef: string): Promise<WorkOrderReceipt> {
    if (!actorRef?.trim() || !order.authorityRef?.trim()) throw new Error("Authority and actor are required");
    await this.gate.assertMayWrite({authorityRef:order.authorityRef,actorRef,scope:"DATA_WORK_ORDER_APPEND"});
    return this.tx(async db => {
      await persistWorkOrder(db,order);
      const r = await db.query<{work_order_id:string}>(
        "SELECT work_order_id FROM ffos.data_work_orders WHERE work_order_id=$1",
        [order.workOrderId],
      );
      if (r.rows.length !== 1 || r.rows[0].work_order_id !== order.workOrderId) {
        throw new Error("Work order read-back mismatch");
      }
      return {workOrderId:order.workOrderId,stored:true,databaseReadback:true,schema:"ffos",recordType:"WORK_ORDER"};
    });
  }
  async addAssetVersion(
    asset: AssetVersionInsert,
    approval: {authorityRef:string;actorRef:string},
  ): Promise<{assetVersionId:string;databaseReadback:true;schema:"ffos"}> {
    if (!approval.authorityRef?.trim() || !approval.actorRef?.trim()) throw new Error("Authority and actor are required");
    await this.gate.assertMayWrite({...approval,scope:"DATA_ASSET_APPEND"});
    return this.tx(async db => {
      await persistAssetVersion(db,asset);
      const r=await db.query<{asset_version_id:string,content_sha256:string}>(
        "SELECT asset_version_id,content_sha256 FROM ffos.data_asset_versions WHERE asset_version_id=$1",
        [asset.assetVersionId],
      );
      if (r.rows.length!==1 || r.rows[0].content_sha256!==asset.sha256) {
        throw new Error("Asset version read-back mismatch");
      }
      return {assetVersionId:asset.assetVersionId,databaseReadback:true,schema:"ffos"};
    });
  }
  async logReuseDecision(
    decision: ReuseDecisionInsert,
    approval: {authorityRef:string;actorRef:string},
  ): Promise<ReuseReceipt> {
    if (!approval.authorityRef?.trim() || !approval.actorRef?.trim()) throw new Error("Authority and actor are required");
    await this.gate.assertMayWrite({...approval,scope:"DATA_REUSE_DECISION_APPEND"});
    return this.tx(async db => {
      await persistReuseDecision(db,decision);
      const r=await db.query<{decision_id:string,work_order_id:string}>(
        "SELECT decision_id,work_order_id FROM ffos.data_reuse_decisions WHERE decision_id=$1",
        [decision.decisionId],
      );
      if (r.rows.length!==1 || r.rows[0].work_order_id!==decision.workOrderId) {
        throw new Error("Reuse decision read-back mismatch");
      }
      return {decisionId:decision.decisionId,workOrderId:decision.workOrderId,
              databaseReadback:true,schema:"ffos",recordType:"REUSE_DECISION"};
    });
  }
}
