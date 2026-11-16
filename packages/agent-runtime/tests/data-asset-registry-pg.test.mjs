import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { DataAssetPgRuntime } from "../src/data-asset-registry.ts";

const url=process.env.FFOS_DATA_ASSET_TEST_DATABASE_URL;
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../../..");
const gate={
  async assertMayWrite({authorityRef,actorRef,scope}) {
    if (authorityRef!=="CI_DIRECTOR_TEST"||actorRef!=="TEST_RUNNER"||!scope.startsWith("DATA_")) {
      throw Error("Denied by CI authority gate");
    }
  }
};
const fixtureOrder={
  workOrderId:"ci-work-order",requestId:"ci-request",ownerRepo:"Motherpher/FFOS",
  purpose:"test storage and readback",authorityRef:"CI_DIRECTOR_TEST",
  requirements:{geography:"DeSO",vintage:"2018"},
  createdAt:"2026-11-16T00:00:00Z",createdBy:"TEST_RUNNER",
};
const fixtureAsset={
  assetVersionId:"ci-asset-v1",assetId:"ci-asset",ownerRepo:"Motherpher/FF-Spatial",
  assetKind:"SPATIAL_BASE",schemaRef:"spatial-product/v1",
  locationRef:"fixture://not-real-gpkg",sha256:"a".repeat(64),
  sourceAsOf:"2026-11-16T00:00:00Z",
  validity:{vintage:"2018"},compatibility:{type:"DeSO",geo:"0380"},
  licenseRef:"TEST_ONLY",qaReceiptRef:"CI_SYNTHETIC_ONLY",sourceRefs:["mock-source"],
  registeredBy:"TEST_RUNNER",
};
const fixtureDecision={
  decisionId:"ci-reuse-v1",workOrderId:fixtureOrder.workOrderId,
  decision:"REUSE_EXACT",candidateVersionIds:[fixtureAsset.assetVersionId],
  selectedVersionIds:[fixtureAsset.assetVersionId],
  rationale:"synthetic matching fixture",evidenceRefs:["CI_SYNTHETIC_ONLY"],
  decidedBy:"TEST_RUNNER",decidedAt:"2026-11-16T00:00:01Z",
};

test("PostgreSQL readback, bounded authority, rollback and immutability", {skip:!url}, async () => {
  const {Pool}=await import("pg");
  const pool=new Pool({connectionString:url,max:3});
  try {
    await pool.query(await readFile(resolve(root,"packages/registry/migrations/0007_ffos_isolated_data_assets.sql"),"utf-8"));
    const service=new DataAssetPgRuntime(pool,gate);
    await assert.rejects(
      ()=>service.createWorkOrder({...fixtureOrder,authorityRef:"NOT_AUTHORIZED"},"TEST_RUNNER"),
      /Denied/,
    );
    const absent=await pool.query("SELECT count(*)::integer as n FROM ffos.data_work_orders");
    assert.equal(absent.rows[0].n,0);
    const order=await service.createWorkOrder(fixtureOrder,"TEST_RUNNER");
    assert.equal(order.databaseReadback,true);
    assert.equal(order.schema,"ffos");
    await assert.rejects(()=>service.createWorkOrder(fixtureOrder,"TEST_RUNNER"));
    const asset=await service.addAssetVersion(fixtureAsset,
      {authorityRef:"CI_DIRECTOR_TEST",actorRef:"TEST_RUNNER"});
    assert.equal(asset.assetVersionId,fixtureAsset.assetVersionId);
    const receipt=await service.logReuseDecision(fixtureDecision,
      {authorityRef:"CI_DIRECTOR_TEST",actorRef:"TEST_RUNNER"});
    assert.equal(receipt.databaseReadback,true);
    const reader=await pool.connect();
    try {
      const a=await reader.query("SELECT work_order_id FROM ffos.data_work_orders WHERE work_order_id=$1",
        [fixtureOrder.workOrderId]);
      const b=await reader.query("SELECT asset_version_id FROM ffos.data_asset_versions WHERE asset_version_id=$1",
        [fixtureAsset.assetVersionId]);
      const c=await reader.query("SELECT decision_id FROM ffos.data_reuse_decisions WHERE decision_id=$1",
        [fixtureDecision.decisionId]);
      assert.deepEqual([a.rowCount,b.rowCount,c.rowCount],[1,1,1]);
      await assert.rejects(
        ()=>reader.query("UPDATE ffos.data_work_orders SET purpose='tamper' WHERE work_order_id=$1",
          [fixtureOrder.workOrderId]),
        /append-only/,
      );
    } finally {reader.release()}
    const count=await pool.query("SELECT count(*)::integer as n FROM ffos.data_work_orders");
    assert.equal(count.rows[0].n,1);
  } finally {
    await pool.end();
  }
});
