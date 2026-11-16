import { test } from "node:test";
import assert from "node:assert/strict";
import { assessAssetReuse } from "../src/data-assets.ts";

const base = {
  assetId: "GEO-DESO", assetVersionId: "GEO-DESO:2018:1",
  kind: "SPATIAL_BASE", schemaRef: "spatial-product-v1",
  populationDefinition: "geographical boundaries",
  geographyType: "DeSO", geographyId: "0380", geographyVintage: "2018",
  observationPeriod: "2018", sourceAsOf: "2026-10-01T00:00:00Z",
  contentSha256: "a".repeat(64), qaStatus: "PASS",
  accessGranted: true, licenseAllowsReuse: true,
} as const;
const req = {
  kind: "SPATIAL_BASE", schemaRef: "spatial-product-v1",
  populationDefinition: "geographical boundaries",
  geographyType: "DeSO", geographyId: "0380", geographyVintage: "2018",
  observationPeriod: "2018", sourceAsOfAtLeast: "2026-01-01T00:00:00Z",
} as const;

test("reuses a compatible verified version", () => {
  assert.equal(assessAssetReuse(req, base).disposition, "REUSE_EXACT");
});
test("requires new source when candidate absent", () => {
  assert.equal(assessAssetReuse(req, null).disposition, "NEW_SOURCE_REQUIRED");
});
for (const [field, changed] of [
  ["geographyVintage", "2025"], ["geographyId", "0180"],
  ["observationPeriod", "2025"], ["populationDefinition", "sports clubs"],
  ["schemaRef", "other"], ["geographyType", "RegSO"],
] as const) {
  test("rejects incompatible " + field, () => {
    const result = assessAssetReuse(req, { ...base, [field]: changed });
    assert.equal(result.disposition, "NEW_SOURCE_REQUIRED");
  });
}
test("fails closed on rights and quality", () => {
  assert.equal(assessAssetReuse(req, {...base, accessGranted: false}).disposition, "BLOCKED");
  assert.equal(assessAssetReuse(req, {...base, licenseAllowsReuse: false}).disposition, "BLOCKED");
  assert.equal(assessAssetReuse(req, {...base, qaStatus: "NOT_TESTED"}).disposition, "BLOCKED");
  assert.equal(assessAssetReuse(req, {...base, contentSha256: "bad"}).disposition, "BLOCKED");
});
test("stale source requires refresh", () => {
  assert.equal(assessAssetReuse({...req, sourceAsOfAtLeast:"2026-11-01T00:00:00Z"},base).disposition,"REFRESH_REQUIRED");
});
test("invalid dates fail closed", () => {
  assert.equal(assessAssetReuse({...req,sourceAsOfAtLeast:"not-a-date"},base).disposition,"BLOCKED");
});
