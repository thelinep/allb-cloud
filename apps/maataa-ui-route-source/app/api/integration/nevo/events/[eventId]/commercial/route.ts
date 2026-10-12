import {commandSchema} from '../../../../../../../../../packages/api-contracts/nevo-schemas.mjs';
import {authorizedCommercial,commercialBody,commercialError,commercialResponse,commercialMutation,commercialRevision} from '../../../../../../../server/nevo-commercial-http';
import {commercialPermission,mutateCommercial} from '../../../../../../../../../packages/nevo-commercial-adapter/service.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:Request,{params}:{params:Promise<{eventId:string}>}){try{const body=commandSchema(await commercialBody(request)),{eventId}=await params;body.expectedRevision=commercialRevision(request,body);return commercialResponse(await authorizedCommercial(request,body,commercialPermission(body.command?.type),(tx,c)=>commercialMutation(request,body,tx,c,()=>mutateCommercial(tx,c,eventId,body))),200,request);}catch(e){return commercialError(e,request);}}
