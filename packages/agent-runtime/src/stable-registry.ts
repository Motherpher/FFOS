import { createHash } from "node:crypto";
import type { AMAAgentManifest, AMABindingRegistry, AgentLifecycleState } from "../../agent-model/src/index.ts";

/** Injectable pool interface compatible with node-postgres; no embedded credentials. */
export interface SqlClient {
  query<T = any>(sql: string, values?: unknown[]): Promise<{rows: T[]}>;
  release(): void;
}
export interface SqlPool { connect(): Promise<SqlClient> }
export interface DirectorDecision {
  eventId: string; agentId: string; agentVersion: string;
  fromState: AgentLifecycleState; toState: AgentLifecycleState;
  actorRef: string; authorityRef: string; mandateRef: string;
  decisionRef: string; reason: string; policyRef?: string;
  evidenceRefs: string[]; occurredAt: string;
}
export interface DirectorDecisionVerifier {
  assertAuthorized(decision: DirectorDecision): Promise<void>;
}
export interface RuntimeReadinessVerifier {
  assertReady(decision: DirectorDecision): Promise<void>;
}
export interface StaticReportRegistration {
  eventId: string; suiteVersion: string; evidenceRef: string; checkedAt: string;
  report: {contract: "ffos.ama.conformance-report/v1"; status: "STATIC_PASS"|"FAIL";
    agent_id: string|null; agent_version: string|null; findings: unknown[]};
}
export interface ConformanceProvenanceVerifier {
  assertVerified(event: StaticReportRegistration, manifest: AMAAgentManifest,
    bindings: AMABindingRegistry): Promise<void>;
}
export interface RegisteredRuntimeAgent {
  manifest: AMAAgentManifest; bindings: AMABindingRegistry; lifecycleState: AgentLifecycleState;
}
export class StableRegistryError extends Error {
  constructor(message: string) {super(message); this.name="StableRegistryError";}
}
const valid=(x: unknown): x is string=>typeof x==="string" && !!x.trim();
const canonical=(v: any): any => Array.isArray(v)?v.map(canonical):
  v && typeof v==="object"?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0)
    .filter(([,x])=>x!==undefined).map(([k,x])=>[k,canonical(x)])):v;
export const contentDigest=(value: unknown): string =>
  createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const NEXT: Record<AgentLifecycleState, AgentLifecycleState[]> = {
  DRAFT:["REGISTERED"],REGISTERED:["VALIDATED","RETIRED"],
  VALIDATED:["DEPLOYABLE","SUSPENDED","RETIRED"],
  DEPLOYABLE:["ACTIVE","SUSPENDED","DEPRECATED","RETIRED"],
  ACTIVE:["SUSPENDED","DEPRECATED","RETIRED"],
  SUSPENDED:["VALIDATED","DEPLOYABLE","RETIRED"],
  DEPRECATED:["SUSPENDED","RETIRED"], RETIRED:[],
};
export class AgentStablePgRegistry {
  private readonly pool: SqlPool;
  private readonly director?: DirectorDecisionVerifier;
  private readonly readiness?: RuntimeReadinessVerifier;
  private readonly conformance?: ConformanceProvenanceVerifier;
  constructor(pool: SqlPool, director?: DirectorDecisionVerifier, readiness?: RuntimeReadinessVerifier,
    conformance?: ConformanceProvenanceVerifier) {
    this.pool=pool; this.director=director; this.readiness=readiness; this.conformance=conformance;
  }
  private async tx<T>(task:(db:SqlClient)=>Promise<T>):Promise<T> {
    const db=await this.pool.connect();let started=false;
    try {
      await db.query("BEGIN");started=true;
      const result=await task(db);await db.query("COMMIT");started=false;return result;
    } catch(e) {
      if(started)try {await db.query("ROLLBACK");}catch{/* preserve original failure */}
      throw e;
    } finally {db.release();}
  }
  /** Immutable candidate registration; never activates a manifest. */
  async registerCandidate(m:AMAAgentManifest,b:AMABindingRegistry,
    p:{sourceCommit:string;registeredBy:string;eventId:string;occurredAt:string}):Promise<void> {
    if(![p.sourceCommit,p.registeredBy,p.eventId].every(valid)||
       !Number.isFinite(Date.parse(p.occurredAt))||
       !valid(m.agentId)||!valid(m.agentVersion)||
       m.schema!=="ffos.ama.agent-manifest/v1"||b.schema!=="ffos.ama.bindings/v1"||
       m.lifecycleState==="ACTIVE")throw new StableRegistryError("Invalid candidate or provenance.");
    await this.tx(async db=>{
      await db.query("INSERT INTO ama_agent_versions (agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
        [m.agentId,m.agentVersion,m.amaVersion,JSON.stringify(m),contentDigest(m),p.sourceCommit,p.registeredBy]);
      await db.query("INSERT INTO ama_agent_binding_versions (agent_id,agent_version,bindings,bindings_sha256,source_commit) VALUES ($1,$2,$3::jsonb,$4,$5)",
        [m.agentId,m.agentVersion,JSON.stringify(b),contentDigest(b),p.sourceCommit]);
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))",[m.agentId]);
      await db.query("INSERT INTO ama_agent_lifecycle_events (event_id,agent_id,agent_version,from_state,to_state,actor_ref,authority_ref,mandate_ref,decision_ref,reason,evidence_refs,occurred_at) VALUES ($1,$2,$3,NULL,'REGISTERED',$4,$5,$6,$7,$8,'[]'::jsonb,$9)",
        [p.eventId,m.agentId,m.agentVersion,p.registeredBy,"REGISTRATION_ONLY","REGISTRATION_ONLY",
          p.sourceCommit,"Candidate registered; neither approved nor active",p.occurredAt]);
    });
  }
  /** Report cannot be trusted solely on claimed STATIC_PASS: external CI verification mandatory. */
  async recordConformance(agentId:string,version:string,e:StaticReportRegistration):Promise<void> {
    if(!this.conformance)throw new StableRegistryError("Trusted conformance verifier not connected.");
    if(![agentId,version,e.eventId,e.suiteVersion,e.evidenceRef].every(valid)||
       !Number.isFinite(Date.parse(e.checkedAt))||
       e.report?.contract!=="ffos.ama.conformance-report/v1"||
       e.report.agent_id!==agentId||e.report.agent_version!==version||
       !["STATIC_PASS","FAIL"].includes(e.report.status)||
       !Array.isArray(e.report.findings)||
       (e.report.status==="STATIC_PASS"&&e.report.findings.length>0))
      throw new StableRegistryError("Invalid conformance report.");
    await this.tx(async db=>{
      const q=await db.query<{definition:AMAAgentManifest;bindings:AMABindingRegistry;
        definition_sha256:string;bindings_sha256:string}>(
        "SELECT v.definition,b.bindings,v.definition_sha256,b.bindings_sha256 FROM ama_agent_versions v JOIN ama_agent_binding_versions b ON v.agent_id=b.agent_id AND v.agent_version=b.agent_version WHERE v.agent_id=$1 AND v.agent_version=$2",
        [agentId,version]);
      const r=q.rows[0];
      if(q.rows.length!==1||contentDigest(r.definition)!==r.definition_sha256||
         contentDigest(r.bindings)!==r.bindings_sha256)
        throw new StableRegistryError("Missing version or invalid content digest.");
      await this.conformance!.assertVerified(e,r.definition,r.bindings);
      await db.query("INSERT INTO ama_agent_conformance_events (event_id,agent_id,agent_version,report_contract,report_status,report,suite_version,evidence_ref,checked_at,definition_sha256,bindings_sha256) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11)",
        [e.eventId,agentId,version,e.report.contract,e.report.status,JSON.stringify(e.report),
          e.suiteVersion,e.evidenceRef,e.checkedAt,r.definition_sha256,r.bindings_sha256]);
    });
  }
  /** Resolve ACTIVE version from append-only event state, not manifest state. */
  async getCurrent(agentId:string):Promise<RegisteredRuntimeAgent|null> {
    if(!valid(agentId))return null;
    const db=await this.pool.connect();
    try {
      const q=await db.query<{definition:AMAAgentManifest;bindings:AMABindingRegistry;
        lifecycle_state:AgentLifecycleState;definition_sha256:string;bindings_sha256:string}>(
        "SELECT v.definition,b.bindings,l.lifecycle_state,v.definition_sha256,b.bindings_sha256 FROM ama_agent_current_lifecycle l JOIN ama_agent_versions v ON v.agent_id=l.agent_id AND v.agent_version=l.agent_version JOIN ama_agent_binding_versions b ON b.agent_id=v.agent_id AND b.agent_version=v.agent_version WHERE l.agent_id=$1 AND l.lifecycle_state='ACTIVE'",
        [agentId]);
      if(q.rows.length>1)throw new StableRegistryError("Multiple ACTIVE agent versions.");
      if(!q.rows.length)return null;
      const r=q.rows[0];
      if(contentDigest(r.definition)!==r.definition_sha256||
         contentDigest(r.bindings)!==r.bindings_sha256)
        throw new StableRegistryError("Agent content digest mismatch.");
      return {manifest:r.definition,bindings:r.bindings,lifecycleState:r.lifecycle_state};
    }finally{db.release();}
  }
  /** Director-authenticated progression; runtime activation requires separate readiness verification. */
  async transition(d:DirectorDecision):Promise<void> {
    if(!this.director)throw new StableRegistryError("Director verifier not connected.");
    if(![d.eventId,d.agentId,d.agentVersion,d.actorRef,d.authorityRef,
         d.mandateRef,d.decisionRef,d.reason].every(valid)||
       !Array.isArray(d.evidenceRefs)||!Number.isFinite(Date.parse(d.occurredAt))||
       !NEXT[d.fromState]?.includes(d.toState))
      throw new StableRegistryError("Invalid/prohibited Director decision.");
    if(d.actorRef===d.agentId)throw new StableRegistryError("Agent may not self-approve.");
    if(["DEPLOYABLE","ACTIVE"].includes(d.toState)&&!this.readiness)
      throw new StableRegistryError("Runtime readiness not connected.");
    await this.tx(async db=>{
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))",[d.agentId]);
      const q=await db.query<{to_state:AgentLifecycleState}>(
        "SELECT to_state FROM ama_agent_lifecycle_events WHERE agent_id=$1 AND agent_version=$2 ORDER BY event_sequence DESC LIMIT 1",
        [d.agentId,d.agentVersion]);
      if(q.rows.length!==1||q.rows[0].to_state!==d.fromState)
        throw new StableRegistryError("Stale or missing lifecycle state.");
      const v=await db.query("SELECT agent_version FROM ama_agent_versions WHERE agent_id=$1 AND agent_version=$2",
        [d.agentId,d.agentVersion]);
      if(v.rows.length!==1)throw new StableRegistryError("Unregistered agent version.");
      if(d.toState==="VALIDATED") {
        const c=await db.query<{report_status:string;definition_sha256:string;bindings_sha256:string}>(
          "SELECT report_status,definition_sha256,bindings_sha256 FROM ama_agent_conformance_events WHERE agent_id=$1 AND agent_version=$2 ORDER BY recorded_at DESC,event_id DESC LIMIT 1",
          [d.agentId,d.agentVersion]);
        const hashes=await db.query<{definition_sha256:string;bindings_sha256:string}>(
          "SELECT v.definition_sha256,b.bindings_sha256 FROM ama_agent_versions v JOIN ama_agent_binding_versions b ON v.agent_id=b.agent_id AND v.agent_version=b.agent_version WHERE v.agent_id=$1 AND v.agent_version=$2",
          [d.agentId,d.agentVersion]);
        if(!c.rows.length||!hashes.rows.length||c.rows[0].report_status!=="STATIC_PASS"||
           c.rows[0].definition_sha256!==hashes.rows[0].definition_sha256||
           c.rows[0].bindings_sha256!==hashes.rows[0].bindings_sha256)
          throw new StableRegistryError("Version-specific conformance proof missing or stale.");
      }
      if(d.toState==="ACTIVE") {
        const existing=await db.query(
          "SELECT agent_version FROM ama_agent_current_lifecycle WHERE agent_id=$1 AND lifecycle_state='ACTIVE' AND agent_version<>$2",
          [d.agentId,d.agentVersion]);
        if(existing.rows.length)throw new StableRegistryError("Another agent version is ACTIVE.");
      }
      await this.director!.assertAuthorized(d);
      if(["DEPLOYABLE","ACTIVE"].includes(d.toState))await this.readiness!.assertReady(d);
      await db.query("INSERT INTO ama_agent_lifecycle_events (event_id,agent_id,agent_version,from_state,to_state,actor_ref,authority_ref,mandate_ref,decision_ref,policy_ref,reason,evidence_refs,occurred_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13)",
        [d.eventId,d.agentId,d.agentVersion,d.fromState,d.toState,d.actorRef,d.authorityRef,
          d.mandateRef,d.decisionRef,d.policyRef??null,d.reason,JSON.stringify(d.evidenceRefs),d.occurredAt]);
    });
  }
}
