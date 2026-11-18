import test from "node:test";
import assert from "node:assert/strict";
import {checkTarget,verifyAudit,FF_ESTATE_REF} from "../scripts/live-admission-contract.mjs";

const good=`postgresql://ffos_login.${FF_ESTATE_REF}:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require`;
test("fails closed without secrets or identity",()=>{
  assert.throws(()=>checkTarget("", "ffos_login"),/MISSING/);
  assert.throws(()=>checkTarget(good,"postgres"),/FORBIDDEN/);
  assert.throws(()=>checkTarget(good.replace(FF_ESTATE_REF,"anotherref"),"ffos_login"),/TARGET_PROJECT/);
  assert.throws(()=>checkTarget(good.replace("sslmode=require","sslmode=disable"),"ffos_login"),/TLS_REQUIRED/);
  assert.throws(()=>checkTarget(good,"other"),/LOGIN_ROLE_MISMATCH/);
  assert.equal(checkTarget(good,"ffos_login").projectRef,FF_ESTATE_REF);
});
test("only admits private role with expected RLS and privileges",()=>{
 const a={connection_role:"ffos_login",writer_membership:true,table_count:4,rls_enabled_count:4,
   target_policy_count:8,unexpected_policy_count:0,invalid_privilege_count:0,
   role_select:true,role_insert:true,role_update:false,role_delete:false};
 assert.equal(verifyAudit(a,"ffos_login"),true);
 for(const [key,value] of [["writer_membership",false],["rls_enabled_count",3],
 ["invalid_privilege_count",1],["role_delete",true],["unexpected_policy_count",1]]){
  assert.throws(()=>verifyAudit({...a,[key]:value},"ffos_login"));
 }
});
