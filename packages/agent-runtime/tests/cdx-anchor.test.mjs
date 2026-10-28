import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {RepositoryCDXAnchorGuard} from "../src/cdx-anchor.ts";
const pin="7edbc47899af23b415114628469aca2970779ea1";
const base={schema:"cdx.anchor/v1",system_short_name:"CDX",
  governed_surface:{repository:"Motherpher/FFOS",system_id:"FFOS"},
  cdx_authority:{repository:"Hybrismannen/Conductellence-"},
  binding_mode:"PINNED_COMMIT",policy_pin:{ref:pin},
  conformance:{runtime_state:"BOUND_PENDING_RUNTIME_INTEGRATION"},
  local_enforcement:{owner:"FFOS",points:[],fail_closed_for_consequential_effects:true}};
async function check(change,action){
  const dir=await mkdtemp(join(tmpdir(),"ama-anchor-"));const file=join(dir,"anchor.json");
  try{await writeFile(file,JSON.stringify({...base,...change}));
    await action(new RepositoryCDXAnchorGuard(file));}
  finally{await rm(dir,{recursive:true,force:true});}
}
test("pending CDX runtime anchor is denied",()=>check({},async g=>
  assert.rejects(()=>g.assertPinned(pin),/unverified/)));
test("verified state without agent enforcement point denied",()=>check({
  conformance:{runtime_state:"VERIFIED_RUNTIME_BOUND"}},async g=>
  assert.rejects(()=>g.assertPinned(pin),/not bound/)));
test("matching declared runtime anchor continuity passes (not policy attestation)",()=>check({
  conformance:{runtime_state:"VERIFIED_RUNTIME_BOUND"},
  local_enforcement:{owner:"FFOS",points:["AGENT_STABLE_EFFECT_GATE"],
    fail_closed_for_consequential_effects:true}},async g=>g.assertPinned(pin)));
test("wrong CDX policy pin denied",()=>check({
  conformance:{runtime_state:"VERIFIED_RUNTIME_BOUND"},
  local_enforcement:{owner:"FFOS",points:["AGENT_STABLE_EFFECT_GATE"],
    fail_closed_for_consequential_effects:true}},async g=>
  assert.rejects(()=>g.assertPinned("0000000000000000000000000000000000000000"),/stale/)));
