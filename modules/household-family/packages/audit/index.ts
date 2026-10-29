import { hash, type AuditEvent, type Evidence } from "../contracts/index.js";
export function verifyAudit(events: AuditEvent[]) {
  let previous = "0".repeat(64);
  for (const event of events) {
    const { event_hash, ...data } = event;
    if (data.previous_hash !== previous || hash(data) !== event_hash)
      return false;
    previous = event_hash;
  }
  return true;
}
export function evidenceBundle(rows: Evidence[]): string {
  return hash(
    [...rows]
      .sort((a, b) => a.criterion_id.localeCompare(b.criterion_id))
      .map(({ evidence_id, observed_at, ...e }) => ({
        evidence_id,
        observed_at,
        ...e,
      })),
  );
}
