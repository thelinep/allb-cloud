import type {NextConfig} from "next";
import path from "node:path";
const config:NextConfig={
  turbopack:{root:path.resolve(process.cwd(),"../.."),...(process.env.ALLB_BUILD_TARGET==='worker'?{resolveAlias:{'@allb/local-image-processor':'@allb/worker-image-processor'}}:{})},
  outputFileTracingRoot:path.resolve(process.cwd(),"../.."),
  async headers(){return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"X-Frame-Options",value:"SAMEORIGIN"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"Permissions-Policy",value:"camera=(self), microphone=(self), geolocation=(self), browsing-topics=()"}]}];},
  // Node tracing selects the empty default export. OpenNext's workerd build
  // selects the real conditional socket export, which must also be packaged.
  outputFileTracingIncludes:{
    '/api/integration/*':[
      '../../node_modules/pg-cloudflare/dist/*.js',
      '../../node_modules/pg-cloudflare/esm/*.mjs',
      './node_modules/pg-cloudflare/dist/*.js',
      './node_modules/pg-cloudflare/esm/*.mjs',
    ],
  },
};
export default config;
