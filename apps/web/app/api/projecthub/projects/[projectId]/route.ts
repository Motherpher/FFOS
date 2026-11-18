import {NextResponse} from "next/server";
import {projectForUi,projectHubRuntimeStatus} from "../../../../../lib/projecthub/server";
export async function GET(_:Request,{params}:{params:Promise<{projectId:string}>}){
  const runtime=projectHubRuntimeStatus();
  if(runtime.state!=="READ_CANDIDATE")return NextResponse.json({status:"NOT_BOUND",runtime},{status:503});
  try{
    const {projectId}=await params;const data=await projectForUi(projectId);
    if(!data)return NextResponse.json({status:"NOT_FOUND"},{status:404});
    return NextResponse.json({status:"OK",...data});
  }catch{return NextResponse.json({status:"BLOCKED",reason:"PROJECTHUB_READ_FAILED"},{status:503});}
}
