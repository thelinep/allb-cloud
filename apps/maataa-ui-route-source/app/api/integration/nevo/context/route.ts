import {authorizedCommercial,commercialResponse,commercialError} from '../../../../../server/nevo-commercial-http';
import {validatedQuery,assertVersion} from '../../../../../../../packages/api-contracts/contracts.mjs';
import {scopeQuery} from '../../../../../../../packages/api-contracts/nevo-schemas.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){try{assertVersion(request);const scope=validatedQuery(request.url,scopeQuery);return commercialResponse(await authorizedCommercial(request,scope as Record<string,unknown>,'design.read',async(_tx,identity)=>identity),200,request);}catch(error){return commercialError(error,request);}}
