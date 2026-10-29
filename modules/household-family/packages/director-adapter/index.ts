import { importSPKI, jwtVerify } from "jose";
import { DirectorSnapshot, Decision, Gate } from "../contracts/index.js";
import { validateDAG } from "../policy-engine/index.js";

export interface Director {
  authorization(project_id: string): Promise<DirectorSnapshot>;
  verifyDecision(signed: string): Promise<Decision>;
  pollDecision(run_id: string): Promise<string | null>;
}
export class SignedDirector implements Director {
  private key: ReturnType<typeof importSPKI>;
  constructor(
    private endpoint: string,
    publicKey: string,
    private issuer: string,
    private audience: string,
    private serviceToken?: string,
  ) {
    const u = new URL(endpoint);
    if (
      u.protocol !== "https:" &&
      !(
        u.protocol === "http:" &&
        ["127.0.0.1", "localhost"].includes(u.hostname)
      )
    )
      throw new Gate("DIRECTOR_HTTPS_REQUIRED", "HOLD_HUMAN");
    this.key = importSPKI(publicKey, "EdDSA");
  }
  private async verify<T>(
    token: string,
    kind: string,
    schema: { parse(v: unknown): T },
  ): Promise<T> {
    try {
      const { payload } = await jwtVerify(token, await this.key, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ["EdDSA"],
        requiredClaims: ["exp", "iat", "jti"],
      });
      if (payload.kind !== kind) throw new Error("Wrong signed object type");
      return schema.parse(payload.data);
    } catch {
      throw new Gate("INVALID_DIRECTOR_SIGNATURE_OR_CLAIMS", "HOLD_HUMAN");
    }
  }
  private async get(path: string): Promise<string | null> {
    let r: Response;
    try {
      r = await fetch(`${this.endpoint.replace(/\/$/, "")}${path}`, {
        headers: this.serviceToken
          ? { Authorization: `Bearer ${this.serviceToken}` }
          : {},
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      });
    } catch {
      throw new Gate("DIRECTOR_DISCONNECTED");
    }
    if (r.status === 404) return null;
    if (!r.ok) throw new Gate(`DIRECTOR_HTTP_${r.status}`);
    const body = await r.text();
    if (body.length > 1000000) throw new Gate("DIRECTOR_RESPONSE_TOO_LARGE");
    return body;
  }
  async authorization(project_id: string) {
    const signed = await this.get(
      `/projects/${encodeURIComponent(project_id)}/authorization`,
    );
    if (!signed) throw new Gate("DIRECTOR_POLICY_MISSING", "HOLD_HUMAN");
    const s = await this.verify(signed, "authorization", DirectorSnapshot);
    validateDAG(s);
    return s;
  }
  async verifyDecision(signed: string) {
    return this.verify(signed, "decision", Decision);
  }
  async pollDecision(run_id: string) {
    return this.get(`/runs/${encodeURIComponent(run_id)}/decision`);
  }
}
