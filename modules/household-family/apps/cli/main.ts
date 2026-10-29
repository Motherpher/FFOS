import { readFileSync } from "node:fs";
import { Database, Store } from "../../packages/state/index.js";
import { Project } from "../../packages/contracts/index.js";
import { inspectCanonicalManifest } from "../../packages/director-adapter/canonical.js";
const [cmd, path] = process.argv.slice(2);
if (cmd === "register-project" && path) {
  const db = new Database(
    process.env.HF_DATABASE_URL ?? ".state/household.sqlite",
  );
  await db.migrate();
  const store = new Store(db);
  await store.register(Project.parse(JSON.parse(readFileSync(path, "utf8"))));
  await db.close();
  console.log(
    "Project configuration persisted. Execution still requires signed Director authority.",
  );
} else if (cmd === "migrate") {
  const db = new Database(
    process.env.HF_DATABASE_URL ?? ".state/household.sqlite",
  );
  await db.migrate();
  await db.close();
  console.log("Database migrations applied.");
} else if (cmd === "inspect-manifest" && path) {
  console.log(
    JSON.stringify(
      inspectCanonicalManifest(JSON.parse(readFileSync(path, "utf8"))),
      null,
      2,
    ),
  );
} else {
  console.error(
    "Usage: npm run cli -- register-project config/project.json | migrate | inspect-manifest manifest.json",
  );
  process.exitCode = 2;
}
