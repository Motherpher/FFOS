import {test} from "node:test";
import assert from "node:assert/strict";
import {persistWorkOrder,persistAssetVersion,persistReuseDecision} from "../src/data-assets-store.ts";

function fakeDB() {
  const calls: {sql:string,params:readonly unknown[]}[] = [];
  const db = {query: async (sql:string,params:readonly unknown[]) => {calls.push({sql,params});}};
  return {db,calls};
}
test("parameterized work order requires an authority reference", async () => {
  const {db,calls}=fakeDB();
  const w = {workOrderId:"wo-1",requestId:"r-1",ownerRepo:"FFOS",purpose:"test",
             authorityRef:"mandate-1",requirements:{geography:"0380"},
             createdAt:"2026-11-16T00:00:00Z",createdBy:"human"};
  await persistWorkOrder(db,w);
  assert.equal(calls.length,1);
  assert.ok(calls[0].sql.includes("$6::jsonb"));
  assert.equal(calls[0].params[4],"mandate-1");
  await assert.rejects(()=>persistWorkOrder(db,{...w,authorityRef:""}));
  assert.equal(calls.length,1);
});
test("asset record is immutable insert with sha + verification reference", async () => {
  const {db,calls}=fakeDB();
  const a = {
    assetVersionId:"asset-v1",assetId:"asset",ownerRepo:"FF-Spatial",
    assetKind:"SPATIAL_BASE" as const,schemaRef:"SpatialProduct/v1",
    locationRef:"asset://verified/v1",sha256:"a".repeat(64),
    sourceAsOf:"2026-11-16T00:00:00Z",validity:{vintage:"2018"},
    compatibility:{geographyId:"0380"},licenseRef:"lic-1",
    qaReceiptRef:"qa-1",sourceRefs:["src-1"],registeredBy:"human"
  };
  await persistAssetVersion(db,a);
  assert.equal(calls.length,1);
  assert.ok(calls[0].sql.includes("insert into ffos.data_asset_versions"));
  await assert.rejects(()=>persistAssetVersion(db,{...a,sha256:"BAD"}));
});
test("reuse decision records candidates and requires explicit rationale", async () => {
  const {db,calls}=fakeDB();
  const d = {decisionId:"d1",workOrderId:"wo-1",decision:"REUSE_EXACT" as const,
             candidateVersionIds:["v1","v2"],selectedVersionIds:["v1"],
             rationale:"same geographic vintage",evidenceRefs:["qa-v1"],
             decidedBy:"operator",decidedAt:"2026-11-16T00:00:00Z"};
  await persistReuseDecision(db,d);
  assert.equal(calls.length,1);
  assert.ok(calls[0].sql.includes("$4::jsonb"));
  await assert.rejects(()=>persistReuseDecision(db,{...d,selectedVersionIds:[]}));
});
