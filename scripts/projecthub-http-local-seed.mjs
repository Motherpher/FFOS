// CI-only synthetic PostgreSQL fixture. Never use on production Supabase.
// Requires explicit localhost DB URL; creates no real-world project data.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createRequire} from "node:module";
const require=createRequire(new URL("../apps/web/package.json",import.meta.url));
const {Pool}=require("pg");
const raw=process.env.PROJECTHUB_TEST_DATABASE_URL;
if(!raw)throw new Error("TEST_DATABASE_URL_REQUIRED");
const u=new URL(raw);
assert.equal(u.hostname,"localhost");
assert.equal(u.pathname,"/projecthub_http_test");
const pool=new Pool({connectionString:raw});
const names=["Need","Purpose","Actors","Evidence","Mechanism","Resources","Funding","Outcomes"];
try {
 for(const path of [
 "packages/registry/migrations/0008_projecthub.sql",
 "packages/registry/migrations/0009_projecthub_runtime_role.sql",
 "packages/registry/migrations/0010_projecthub_readonly_role.sql"
 ]) await pool.query(await readFile(path,"utf8"));
 const fields=Object.fromEntries(names.map(name=>[name,{name,maturity:"UNKNOWN",note:null,evidenceRefs:[],
  premiseRefs:[],version:1,provenance:[]}]));
 for(const id of ["WP02-FIXTURE-ALPHA","WP02-FIXTURE-BETA"]){
  const timestamp=new Date().toISOString();
  const record={id,title:"Synthetic "+id,status:"DRAFT",version:1,createdAt:timestamp,updatedAt:timestamp,
  createdBy:"FFOS:WP02_TEST_DIRECTOR",profile:{projectId:id,ownerRef:"SYNTHETIC",
    mandateRef:"FFOS-DEVOPS-PH-RECON-001",methodologyProfile:"PROJECT_NATIVE",
    selectedMethodRefs:[],purpose:"Synthetic CI-only acceptance",scope:[],nonScope:[],
    dataClassCeiling:"PH-D2",optionalFfcRefs:[],optionalPiusRefs:[],externalMethodRefs:[],
    version:1,provenance:[]},
  core:{projectId:id,need:null,purpose:"Synthetic CI-only acceptance",targetGroups:[],
    mechanism:null,intervention:null,constraints:[],premiseRefs:[],unknownRefs:[],version:1,provenance:[]},
  field:fields,provenance:[]};
  await pool.query(`INSERT INTO ffos.projecthub_projects
    (project_id,version,title,status,data_class,methodology_profile,payload,provenance,created_at,updated_at)
    VALUES ($1,1,$2,'DRAFT','PH-D2','PROJECT_NATIVE',$3::jsonb,'[]'::jsonb,$4,$4)`,
    [id,record.title,JSON.stringify(record),timestamp]);
 }
 await pool.query(`CREATE ROLE ffos_wp02_test_login
    LOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD 'ci-local-only'`);
 await pool.query("GRANT ffos_projecthub_reader TO ffos_wp02_test_login");
 // Independently assert isolation with a *nonempty* other project in this local database.
 const client=await pool.connect();
 try{
  await client.query("BEGIN READ ONLY");
  await client.query("SET LOCAL ROLE ffos_projecthub_reader");
  await client.query("SELECT set_config('ffos.project_scope',$1,true)",["WP02-FIXTURE-ALPHA"]);
  const result=await client.query("SELECT project_id FROM ffos.projecthub_projects");
  assert.deepEqual(result.rows.map(x=>x.project_id),["WP02-FIXTURE-ALPHA"]);
  await client.query("ROLLBACK");
 }finally{client.release();}
 console.log("PASS: local synthetic projects seeded and reader RLS isolates nonempty data");
}finally{await pool.end()}
