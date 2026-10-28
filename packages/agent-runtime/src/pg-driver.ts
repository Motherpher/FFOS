/** Server-only connection adapter. No credentials committed. */
import {Pool} from "pg";
import type {SqlPool} from "./stable-registry.ts";
export function createAgentStablePool(databaseUrl:string):SqlPool&{end():Promise<void>} {
  if(!databaseUrl?.trim())throw Error("Agent Stable database is not configured");
  return new Pool({connectionString:databaseUrl,max:5,
    connectionTimeoutMillis:3000,idleTimeoutMillis:10000});
}
