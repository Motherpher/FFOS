import { readFileSync } from "node:fs";
import { Database, Store } from "../packages/state/index.js";
import { SignedDirector } from "../packages/director-adapter/index.js";
import { AppGitHub } from "../packages/github-adapter/index.js";
import { Household } from "./orchestrator-api/service.js";
import { Gate } from "../packages/contracts/index.js";
import { SignedGovernance } from "../packages/governance-adapter/index.js";
export function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Gate(`CONFIG_REQUIRED_${name}`, "HOLD_HUMAN");
  return v;
}
export async function runtime() {
  const db = new Database(required("HF_DATABASE_URL"));
  if (process.env.HF_MIGRATE_ON_START !== "false") await db.migrate();
  const store = new Store(db);
  const director = new SignedDirector(
    required("HF_DIRECTOR_URL"),
    readFileSync(required("HF_DIRECTOR_PUBLIC_KEY_FILE"), "utf8"),
    required("HF_DIRECTOR_ISSUER"),
    required("HF_DIRECTOR_AUDIENCE"),
    process.env.HF_DIRECTOR_SERVICE_TOKEN,
  );
  const github = new AppGitHub(
    required("HF_GITHUB_APP_ID"),
    readFileSync(required("HF_GITHUB_PRIVATE_KEY_FILE"), "utf8"),
  );
  const anchor = JSON.parse(
    readFileSync(required("HF_CDX_ANCHOR_FILE"), "utf8"),
  );
  if (
    anchor.governed_surface?.identity !== "Motherpher/FFOS" ||
    anchor.binding_mode !== "PINNED_COMMIT" ||
    anchor.authority_context?.mandate_ref_required !== true
  )
    throw new Gate("CDX_ANCHOR_UNRECONCILED", "HOLD_HUMAN");
  const governance = new SignedGovernance(
    required("HF_CDX_EVALUATE_URL"),
    readFileSync(required("HF_CDX_PUBLIC_KEY_FILE"), "utf8"),
    required("HF_CDX_ISSUER"),
    required("HF_CDX_AUDIENCE"),
    anchor.policy_pin.ref,
    process.env.HF_CDX_SERVICE_TOKEN,
  );
  return {
    db,
    store,
    household: new Household(store, director, github, governance),
  };
}
