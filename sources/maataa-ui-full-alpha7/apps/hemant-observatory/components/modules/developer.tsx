"use client";

import { useMethodRegistry } from "@/components/use-observatory-data";
import { ErrorNote, Panel, Pending } from "./shared";

const endpoints = [
  ["GET /api/time", "One host wall-clock snapshot through hemant-shell --json.", "hemant.time-result/2", "503 if the shell is not built; 502 if its output fails the contract"],
  ["GET /api/convert?unix_nanos=<integer>", "Converts a supplied signed integer in 0001–9999 UTC. No other parameter is accepted.", "hemant.time-result/2", "400 for malformed or out-of-range input; 422 if the shell rejects it"],
  ["GET /api/methods", "The method registry from hemant-shell --methods-json.", "hemant.method-registry/1", "503/502 as above"],
] as const;

export default function DeveloperModule() {
  const registry = useMethodRegistry();
  return (
    <div className="m-grid">
      <Panel eyebrow="LOCAL ENDPOINTS" title="What exists today">
        <div className="m-table-wrap">
          <table className="m-table">
            <caption className="sr-only">Local API endpoints</caption>
            <thead><tr><th scope="col">Endpoint</th><th scope="col">Returns</th><th scope="col">Schema</th><th scope="col">Failure</th></tr></thead>
            <tbody>{endpoints.map(([e, what, schema, fail]) => <tr key={e}><th scope="row"><code>{e}</code></th><td>{what}</td><td><code>{schema}</code></td><td>{fail}</td></tr>)}</tbody>
          </table>
        </div>
        <pre className="m-code">{`curl -s http://127.0.0.1:4210/api/convert?unix_nanos=285148740000000000

# CLI (from apps/hemant-observatory)
cargo run --offline -p hemant-shell -- --unix-nanos 0 --json
cargo run --offline -p hemant-shell -- --methods-json`}</pre>
        <p className="m-note">The server runs a fixed binary with fixed argument shapes, a 2-second timeout and a 64 KB output limit. Browser input never becomes a command.</p>
        <Pending>No hosted API, SDK or package is published. The requested API domain is not deployed.</Pending>
      </Panel>
      <Panel eyebrow="SCHEMA" title="Registry fields">
        {registry.state === "error" && <ErrorNote error={registry.error} />}
        {registry.state === "loading" && <p role="status">Loading…</p>}
        {registry.state === "ready" && <pre className="m-code" aria-label="First registry record">{JSON.stringify(registry.value.methods[0], null, 2)}</pre>}
      </Panel>
    </div>
  );
}
