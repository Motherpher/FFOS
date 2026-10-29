import { z } from "zod";
import { hash } from "../contracts/index.js";
const canonical = z
  .object({
    sequence: z.array(z.string()),
    policy: z.record(z.string(), z.unknown()),
    work_packages: z.record(
      z.string(),
      z
        .object({
          state: z.string().optional(),
          depends_on: z.array(z.string()).optional(),
          human_gate: z.boolean().optional(),
          checks: z.array(z.record(z.string(), z.unknown())).optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();
/** Observation adapter only. Existing manifest states cannot grant a new delegation. */
export function inspectCanonicalManifest(input: unknown) {
  const m = canonical.parse(input);
  return {
    source_digest: hash(input),
    mode: "OBSERVATION_ONLY",
    authority_granted: false,
    sequence_count: m.sequence.length,
    policy: m.policy,
    work_packages: m.sequence.map((wp_id) => {
      const w = m.work_packages[wp_id];
      return {
        wp_id,
        source_state: w?.state ?? "UNDETERMINED",
        dependency_ids: w?.depends_on ?? [],
        human_gate: w?.human_gate ?? null,
        check_methods: (w?.checks ?? []).map((c) => String(c.type)),
        supported_without_semantic_translation: (w?.checks ?? []).every(
          (c) => c.type === "path_contains",
        ),
        execution_gate: "CURRENT_SIGNED_DIRECTOR_DISPATCH_REQUIRED",
      };
    }),
  };
}
