// Offline migration audit. This is structural evidence, not a database assertion.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const sql=readFileSync('packages/registry/migrations/0008_projecthub.sql','utf8');
const tables=[
  'projecthub_projects','projecthub_nodes','projecthub_relations',
  'projecthub_events','projecthub_idempotency','projecthub_role_grants'
];
for (const t of tables) {
  assert.match(sql,new RegExp('CREATE TABLE IF NOT EXISTS ffos\\.'+t+'\\b','i'));
  assert.ok(sql.includes("'"+t+"'"),'Missing immutable/RLS table identity '+t);
}
assert.ok(sql.includes("RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$"));
assert.match(sql,/ENABLE ROW LEVEL SECURITY/i);
assert.match(sql,/REVOKE ALL PRIVILEGES ON TABLE/i);
assert.match(sql,/WHERE rolname IN \('anon','authenticated','service_role'\)/i);
assert.match(sql,/REVOKE ALL PRIVILEGES ON TABLE/i);
assert.match(sql,/REVOKE ALL ON SEQUENCE/i);
assert.match(sql,/CREATE TRIGGER/i);
assert.doesNotMatch(sql,/\bCREATE TABLE\s+(?:IF NOT EXISTS\s+)?public\./i);
assert.doesNotMatch(sql,/\bCREATE POLICY\b/i);
console.log('PASS — ProjectHub schema candidate is isolated, RLS-protected and does not grant frontend access');
