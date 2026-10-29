import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {RepositoryCDXAnchorGuard} from "../src/cdx-anchor.ts";
const pin="sha256:"+"a".repeat(64);
const base={schema:"cdx.anchor/v1",system_short_name:"CDX",
  governed_surface:{repository:"Motherpher/FFOS",system_id:"FFOS"},
  cdx_authority:{repository:"Hybrismannen/Conductellence-"},
  binding_mode:"PINNED_COMMIT",policy_pin:{ref:pin,ref_type:"COMMIT",digest:pin},
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
test("only synthetically release-bound anchor passes local continuity (not independent attestation)",()=>check({
  binding_mode:"PINNED_RELEASE",policy_pin:{ref:pin,ref_type:"POLICY_DIGEST",digest:pin},
  binding_state:"CDX_RUNTIME_VERIFIED",
  conformance:{runtime_state:"VERIFIED_RUNTIME_BOUND"},
  local_enforcement:{owner:"FFOS",points:["AGENT_STABLE_EFFECT_GATE"],
    fail_closed_for_consequential_effects:true}},async g=>g.assertPinned(pin)));
test("wrong CDX policy pin denied",()=>check({
  binding_mode:"PINNED_RELEASE",policy_pin:{ref:pin,ref_type:"POLICY_DIGEST",digest:pin},
  binding_state:"CDX_RUNTIME_VERIFIED",
  conformance:{runtime_state:"VERIFIED_RUNTIME_BOUND"},
  local_enforcement:{owner:"FFOS",points:["AGENT_STABLE_EFFECT_GATE"],
    fail_closed_for_consequential_effects:true}},async g=>
  assert.rejects(()=>g.assertPinned("0000000000000000000000000000000000000000"),/stale/)));

test("pre-release commit cannot be promoted through runtime-state flags",()=>check({
  conformance:{runtime_state:"VERIFIED_RUNTIME_BOUND"},
  local_enforcement:{owner:"FFOS",points:["AGENT_STABLE_EFFECT_GATE"],
    fail_closed_for_consequential_effects:true}},async g=>
  assert.rejects(()=>g.assertPinned(pin),/unverified/)));
