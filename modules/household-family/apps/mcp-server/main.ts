import { runtime, required } from "../runtime.js";
import { OAuthAuthority } from "./auth.js";
import { httpServer } from "./server.js";
const { db, household } = await runtime();
const publicUrl = required("HF_PUBLIC_URL");
const authority = new OAuthAuthority(
  required("HF_OAUTH_ISSUER"),
  publicUrl,
  required("HF_OAUTH_JWKS_URL"),
  required("HF_OAUTH_INTROSPECTION_URL"),
  JSON.parse(required("HF_PRINCIPALS_JSON")),
  process.env.HF_OAUTH_INTROSPECTION_AUTH,
);
const server = httpServer(household, authority, {
  publicUrl,
  issuer: required("HF_OAUTH_ISSUER"),
  webhookSecret: required("HF_GITHUB_WEBHOOK_SECRET"),
  production: process.env.NODE_ENV === "production",
});
server.listen(
  Number(process.env.PORT ?? 3000),
  process.env.HF_BIND_HOST ?? "127.0.0.1",
  () =>
    process.stdout.write(
      "Household MCP listening; no deployment or ChatGPT registration is implied.\n",
    ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(() => {
      void db.close();
    });
  });
