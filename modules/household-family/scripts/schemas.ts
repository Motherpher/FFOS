import { z } from "zod";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  Project,
  WorkPackage,
  DirectorSnapshot,
  Decision,
  Evidence,
  Fault,
  RunSchema,
  AuditEventSchema,
} from "../packages/contracts/index.js";
mkdirSync("config/schemas", { recursive: true });
for (const [name, schema] of Object.entries({
  project: Project,
  work_package: WorkPackage,
  director_snapshot: DirectorSnapshot,
  decision: Decision,
  evidence: Evidence,
  fault: Fault,
  run: RunSchema,
  audit_event: AuditEventSchema,
}))
  writeFileSync(
    `config/schemas/${name}.schema.json`,
    JSON.stringify(z.toJSONSchema(schema), null, 2) + "\n",
  );
writeFileSync(
  "config/project.schema.json",
  JSON.stringify(z.toJSONSchema(Project), null, 2) + "\n",
);
