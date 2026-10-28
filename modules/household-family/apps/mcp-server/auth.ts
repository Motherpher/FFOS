import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { Gate } from "../../packages/contracts/index.js";
import type { Principal } from "../orchestrator-api/service.js";

export interface Authority {
  authenticate(token: string): Promise<Principal>;
}
export interface PrincipalBinding {
  subject: string;
  projects: string[];
}
export class OAuthAuthority implements Authority {
  private jwks: JWTVerifyGetKey;
  constructor(
    private issuer: string,
    private audience: string,
    jwksUrl: string,
    private introspectionUrl: string,
    private bindings: PrincipalBinding[],
    private introspectionAuth?: string,
  ) {
    for (const s of [issuer, jwksUrl, introspectionUrl]) {
      const u = new URL(s);
      if (
        u.protocol !== "https:" &&
        !(
          u.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(u.hostname)
        )
      )
        throw new Gate("OAUTH_HTTPS_REQUIRED");
    }
    this.jwks = createRemoteJWKSet(new URL(jwksUrl), { timeoutDuration: 5000 });
  }
  async authenticate(token: string): Promise<Principal> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ["RS256", "ES256", "EdDSA"],
        requiredClaims: ["exp", "iat", "sub"],
      });
      const response = await fetch(this.introspectionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(this.introspectionAuth
            ? { Authorization: this.introspectionAuth }
            : {}),
        },
        body: new URLSearchParams({ token }),
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error("Introspection unavailable");
      const live = (await response.json()) as {
        active?: boolean;
        sub?: string;
        scope?: string;
      };
      if (live.active !== true || (live.sub && live.sub !== payload.sub))
        throw new Error("Revoked token");
      const binding = this.bindings.find((x) => x.subject === payload.sub);
      if (!binding) throw new Error("Unknown subject");
      const scopes =
        typeof payload.scope === "string" ? payload.scope.split(" ") : [];
      const activeScopes =
        typeof live.scope === "string" ? live.scope.split(" ") : scopes;
      return {
        subject: binding.subject,
        projects: [...binding.projects],
        scopes: scopes.filter((x) => activeScopes.includes(x)),
      };
    } catch {
      throw new Gate("UNAUTHENTICATED_OR_REVOKED");
    }
  }
}
