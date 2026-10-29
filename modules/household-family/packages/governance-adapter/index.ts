import { importSPKI, jwtVerify } from "jose";
import { z } from "zod";
import {
  hash,
  Gate,
  now,
  type Project,
  type Run,
  type DirectorSnapshot,
} from "../contracts/index.js";
export interface Intent {
  action: string;
  project_id: string;
  repo: string;
  run_id: string;
  wp_id: string;
  wp_version: number;
  subject: string;
  branch: string;
  baseline_sha: string;
  commit_sha: string;
  recipe_hash: string;
  authority_ref: string;
  mandate_ref: string;
}
export const Receipt = z
  .object({
    decision: z.enum([
      "ALLOW",
      "DENY",
      "REQUIRE_HUMAN",
      "SECURITY_STOP",
      "CONSTITUTIONAL_STOP",
    ]),
    intent_hash: z.string(),
    authority_ref: z.string(),
    mandate_ref: z.string(),
    policy_pin: z.string(),
    policy_version: z.string(),
    revoked: z.boolean(),
    observed_at: z.iso.datetime(),
    expires_at: z.iso.datetime(),
    spetl_ref: z.string().min(1),
    control_results: z
      .array(
        z.object({
          control_id: z.string(),
          pass: z.boolean(),
          decision: z.string(),
        }),
      )
      .min(1),
  })
  .strict();
export interface Governance {
  evaluate(
    intent: Intent,
  ): Promise<{ receipt: z.infer<typeof Receipt>; signed_provenance: string }>;
}
export class DenyGovernance implements Governance {
  async evaluate(intent: Intent): Promise<never> {
    throw new Gate("CDX_RUNTIME_ENFORCEMENT_UNCONFIGURED", "HOLD_HUMAN");
  }
}
export class SignedGovernance implements Governance {
  private key: ReturnType<typeof importSPKI>;
  constructor(
    private endpoint: string,
    publicKey: string,
    private issuer: string,
    private audience: string,
    private policyPin: string,
    private serviceToken?: string,
  ) {
    const u = new URL(endpoint);
    if (
      u.protocol !== "https:" &&
      !(u.protocol === "http:" && u.hostname === "127.0.0.1")
    )
      throw new Gate("CDX_HTTPS_REQUIRED");
    this.key = importSPKI(publicKey, "EdDSA");
  }
  async evaluate(intent: Intent) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.serviceToken
            ? { Authorization: `Bearer ${this.serviceToken}` }
            : {}),
        },
        body: JSON.stringify({
          intent,
          intent_hash: hash(intent),
          policy_pin: this.policyPin,
        }),
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("CDX unavailable");
      const signed = await response.text();
      if (signed.length > 100000) throw new Error("CDX response exceeds limit");
      const { payload } = await jwtVerify(signed, await this.key, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ["EdDSA"],
        requiredClaims: ["iat", "exp", "jti"],
      });
      if (payload.kind !== "cdx-decision")
        throw new Error("Wrong receipt kind");
      const receipt = Receipt.parse(payload.data);
      if (
        receipt.intent_hash !== hash(intent) ||
        receipt.authority_ref !== intent.authority_ref ||
        receipt.mandate_ref !== intent.mandate_ref ||
        receipt.policy_pin !== this.policyPin ||
        receipt.revoked ||
        Date.parse(receipt.expires_at) <= Date.now() ||
        Date.now() - Date.parse(receipt.observed_at) > 60000 ||
        Date.parse(receipt.observed_at) > Date.now() + 30000
      )
        throw new Error("Stale or unbound receipt");
      if (
        receipt.decision !== "ALLOW" ||
        receipt.control_results.some((c) => !c.pass || c.decision !== "ALLOW")
      )
        throw new Gate(`CDX_${receipt.decision}`, "HOLD_HUMAN");
      return { receipt, signed_provenance: signed };
    } catch (error) {
      if (error instanceof Gate) throw error;
      throw new Gate("CDX_POLICY_UNAVAILABLE_OR_INVALID", "HOLD_HUMAN");
    }
  }
}
