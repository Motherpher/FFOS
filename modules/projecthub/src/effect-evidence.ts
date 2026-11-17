import type {ProjectHubStore} from "./store.ts";
import type {EffectEvidencePort} from "./effect-gate.ts";
import type {CommandContext} from "../../../packages/projecthub-model/src/index.ts";
import {randomUUID} from "node:crypto";

export class StoreEffectEvidenceWriter implements EffectEvidencePort {
  constructor(private readonly store:ProjectHubStore,private readonly context:CommandContext){}
  async append(e:any){
    await this.store.transaction(async tx=>{
      await tx.appendAuditEvent({
        eventId:randomUUID(),projectId:e.projectId,objectId:e.resourceRef,eventType:"PROJECTHUB_EFFECT_"+e.stage,
        principalRef:this.context.principalRef,authorityRef:this.context.authorityRef,mandateRef:this.context.mandateRef,
        commandId:this.context.idempotencyKey,correlationId:e.correlationId,causationId:e.causationId,dataClass:"PH-D1",
        occurredAt:new Date().toISOString(),payload:{actionClass:e.actionClass,operation:e.operation,decision:e.decision,
          decisionRef:e.decisionRef,spetlReceiptRef:e.spetlReceiptRef,detail:e.detail},provenance:[]
      });
    });
  }
}
