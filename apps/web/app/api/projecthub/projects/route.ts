import {NextResponse} from "next/server";
import {createProjectFromApi,listProjectsForUi,projectHubRuntimeStatus} from "../../../../lib/projecthub/server";

export async function GET(){
  const status=projectHubRuntimeStatus();
  if(status.state!=="BOUND_CANDIDATE")return NextResponse.json({status:"NOT_BOUND",runtime:status,projects:[]},{status:503});
  try{return NextResponse.json({status:"OK",runtime:status,projects:await listProjectsForUi()});}
  catch{return NextResponse.json({status:"BLOCKED",reason:"PROJECTHUB_READ_FAILED",runtime:status},{status:503});}
}
export async function POST(request:Request){
  const key=request.headers.get("Idempotency-Key");
  if(!key)return NextResponse.json({status:"BLOCKED",reason:"IDEMPOTENCY_KEY_REQUIRED"},{status:400});
  try{
    const body=await request.json();
    const result=await createProjectFromApi(body,key);
    return NextResponse.json({status:"OK",result},{status:201});
  }catch(error){
    const reason=error instanceof Error?error.message:"PROJECTHUB_WRITE_FAILED";
    const code=reason==="PROJECTHUB_WRITE_RUNTIME_NOT_ENABLED"?403:reason.includes("NOT_CONFIGURED")?503:400;
    return NextResponse.json({status:"BLOCKED",reason},{status:code});
  }
}
