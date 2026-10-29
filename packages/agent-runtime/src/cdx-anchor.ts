import {readFile} from "node:fs/promises";
import type {CDXAnchorPort} from "./effect-gate.ts";
/** Checks local CDX anchor continuity, not policy-service authenticity. */
export class RepositoryCDXAnchorGuard implements CDXAnchorPort {
  private readonly filename:string;
  constructor(filename:string){this.filename=filename;}
  async assertPinned(pin:string):Promise<void>{
    if(!/^[0-9a-f]{40}$/.test(pin))throw Error("Invalid CDX pin");
    const a=JSON.parse(await readFile(this.filename,"utf8"));
    if(a.schema!=="cdx.anchor/v1"||a.system_short_name!=="CDX"||
       a.governed_surface?.repository!=="Motherpher/FFOS"||
       a.governed_surface?.system_id!=="FFOS"||
       a.binding_mode!=="PINNED_RELEASE"||
       !["RELEASE","POLICY_DIGEST"].includes(a.policy_pin?.ref_type)||
       a.binding_state!=="CDX_RUNTIME_VERIFIED"||
       a.policy_pin?.ref!==pin||
       a.policy_pin?.digest!==a.policy_pin?.ref||
       a.cdx_authority?.repository!=="Hybrismannen/Conductellence-"||
       a.conformance?.runtime_state!=="VERIFIED_RUNTIME_BOUND"||
       a.local_enforcement?.owner!=="FFOS"||
       !Array.isArray(a.local_enforcement?.points)||
       !a.local_enforcement.points.includes("AGENT_STABLE_EFFECT_GATE")||
       a.local_enforcement.fail_closed_for_consequential_effects!==true)
      throw Error("CDX anchor stale, unverified, or not bound to Agent Stable");
  }
}
