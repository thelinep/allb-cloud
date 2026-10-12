import Link from 'next/link';
export const metadata={title:'Authentication callback | ALLB'};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;
 const messages:Record<string,string>={access_denied:'The identity provider denied this request.',expired:'The callback has expired. Start sign-in again.',invalid_state:'The callback state could not be verified.'};
 const error=typeof params.error==='string'?params.error:'';
 return <main style={{maxWidth:760,margin:'auto',padding:'clamp(24px,6vw,72px)'}}><h1>Authentication callback</h1><p role="status">{messages[error]??'No external identity provider callback is configured.'}</p><p>This page does not exchange tokens, establish a session or follow a redirect supplied in the URL. Use the server-validated password sign-in in the workflow.</p><Link href="/integration/workflow">Open sign-in and workflow</Link></main>;
}
