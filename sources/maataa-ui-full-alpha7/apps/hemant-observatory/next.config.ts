import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack:{root:path.resolve(process.cwd(),"../../../..")},
  outputFileTracingRoot:path.resolve(process.cwd(),"../../../.."),
  ...(process.env.HEMANT_WORKERS_BUILD === "1"
    ? {
        outputFileTracingExcludes: {
          "/api/time": ["./target/**"],
          "/api/convert": ["./target/**"],
          "/api/methods": ["./target/**"],
          "/api/health": ["./target/**"],
        },
      }
    : {
        // Native local Node deployments use the same Rust core through the CLI.
        outputFileTracingIncludes: {
          "/api/time": ["./target/release/hemant-shell"],
          "/api/convert": ["./target/release/hemant-shell"],
          "/api/methods": ["./target/release/hemant-shell"],
          "/api/health": ["./target/release/hemant-shell"],
        },
      }),
};

export default nextConfig;
