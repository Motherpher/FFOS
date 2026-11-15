/**
 * FFOS asset-first compatibility assessment. Side-effect free; registration
 * and authority approval remain outside this module.
 * Version identity is immutable. Absence of metadata fails closed.
 */
export type ReuseDisposition =
  | "REUSE_EXACT" | "REUSE_WITH_TRANSFORMATION"
  | "REFRESH_REQUIRED" | "NEW_SOURCE_REQUIRED" | "BLOCKED";

export interface DataAssetCandidate {
  assetId: string;
  assetVersionId: string;
  kind: "RAW"|"TABULAR_BASE"|"SPATIAL_BASE"|"DERIVED_ANALYSIS"|"PRESENTATION";
  schemaRef: string;
  populationDefinition: string;
  geographyType: string;
  geographyId: string;
  geographyVintage: string;
  observationPeriod: string;
  sourceAsOf: string;
  contentSha256: string;
  qaStatus: "PASS"|"FAIL"|"NOT_TESTED";
  accessGranted: boolean;
  licenseAllowsReuse: boolean;
}
export interface DataAssetRequirement {
  kind: DataAssetCandidate["kind"];
  schemaRef: string;
  populationDefinition: string;
  geographyType: string;
  geographyId: string;
  geographyVintage: string;
  observationPeriod: string;
  sourceAsOfAtLeast: string;
}
export interface ReuseAssessment {
  disposition: ReuseDisposition;
  candidateAssetVersionId?: string;
  reasons: string[];
}
export function assessAssetReuse(
  request: DataAssetRequirement,
  candidate: DataAssetCandidate | null,
): ReuseAssessment {
  if (!candidate) return { disposition: "NEW_SOURCE_REQUIRED", reasons: ["NO_CANDIDATE"] };
  if (!candidate.accessGranted || !candidate.licenseAllowsReuse) {
    return { disposition: "BLOCKED", candidateAssetVersionId: candidate.assetVersionId, reasons: ["ACCESS_OR_LICENSE_DENIED"] };
  }
  if (!/^[a-f0-9]{64}$/.test(candidate.contentSha256) || candidate.qaStatus !== "PASS") {
    return { disposition: "BLOCKED", candidateAssetVersionId: candidate.assetVersionId, reasons: ["UNVERIFIED_ASSET"] };
  }
  const required: (keyof DataAssetRequirement)[] = [
    "kind","schemaRef","populationDefinition","geographyType",
    "geographyId","geographyVintage","observationPeriod",
  ];
  const mismatches = required.filter(k => candidate[k] !== request[k]).map(k => `MISMATCH_${k}`);
  if (mismatches.length) {
    return { disposition: "NEW_SOURCE_REQUIRED", candidateAssetVersionId: candidate.assetVersionId, reasons: mismatches };
  }
  if (!Number.isFinite(Date.parse(candidate.sourceAsOf)) || !Number.isFinite(Date.parse(request.sourceAsOfAtLeast))) {
    return { disposition: "BLOCKED", candidateAssetVersionId: candidate.assetVersionId, reasons: ["INVALID_SOURCE_TIME"] };
  }
  if (Date.parse(candidate.sourceAsOf) < Date.parse(request.sourceAsOfAtLeast)) {
    return { disposition: "REFRESH_REQUIRED", candidateAssetVersionId: candidate.assetVersionId, reasons: ["SOURCE_STALE"] };
  }
  return { disposition: "REUSE_EXACT", candidateAssetVersionId: candidate.assetVersionId, reasons: ["COMPATIBLE_AND_VERIFIED"] };
}
