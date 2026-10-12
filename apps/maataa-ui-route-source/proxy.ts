import {NextResponse,type NextRequest} from 'next/server';
import manifest from './route-manifest.json';

const routes=new Set(manifest.concreteRoutes);
const fixtureFamily=/^\/(?:allb|workspace|components|examples|playground|invitations|patterns\/(?:identity|production)|studio\/(?:components|scenes|themes|workspaces))\//;
export function proxy(request:NextRequest){
 // Validate before streaming begins so unknown concepts have a real HTTP 404.
 if(fixtureFamily.test(request.nextUrl.pathname)&&!request.nextUrl.pathname.includes('.')&&!routes.has(request.nextUrl.pathname.replace(/\/$/,''))){
  return new NextResponse('<!doctype html><html lang="en"><head><meta name="robots" content="noindex"><title>Concept not found · ALLB</title></head><body><main><h1>Concept not found</h1><p>This concept route does not exist.</p><a href="/allb">Return to ALLB gallery</a></main></body></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
 }
 return NextResponse.next();
}
export const config={matcher:['/allb/:path*','/workspace/:path*','/components/:path*','/examples/:path*','/playground/:path*','/invitations/:path*','/patterns/:path*','/studio/:path*']};
