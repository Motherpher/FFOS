import {NextResponse} from "next/server";
import {createProjectFromApi,projectHubRuntimeStatus} from "../../../../lib/projecthub/server";

// Portfolio enumeration is not admitted for the single-project RLS identity.
// Return fail-closed until an authorized portfolio read model exists.
export async function GET(){
  const runtime=projectHubRuntimeStatus();
  return NextResponse.json({status:"NOT_BOUND",reason:"PROJECTHUB_PORTFOLIO_QUERY_NOT_ADMITTED",runtime},{status:503});
}
export async function POST(request:Request){
  // Mutations remain blocked until scoped transactions and CDX A3 evidence
  // have independent acceptance. Session auth is checked inside service.
  const key=request.headers.get("Idempotency-Key");
  if(!key)return NextResponse.json({status:"BLOCKED",reason:"IDEMPOTENCY_KEY_REQUIRED"},{status:400});
  try{
    const body=await request.json();
    const result=await createProjectFromApi(body,key);
    return NextResponse.json({status:"OK",result},{status:201});
  }catch{
    return NextResponse.json({status:"BLOCKED",reason:"PROJECTHUB_WRITE_RUNTIME_NOT_ADMITTED"},{status:503});
  }
}
