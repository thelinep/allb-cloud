import { parseMethodRegistry } from "@/lib/contract";
import { noStore, runShell } from "@/lib/shell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const run = runShell(["--methods-json"]);
  if (!run.ok) return Response.json({ error: run.error }, { status: run.status, headers: noStore });
  const registry = parseMethodRegistry(run.json);
  if (!registry.ok) return Response.json({ error: `method registry invalid: ${registry.error}` }, { status: 502, headers: noStore });
  return Response.json(registry.value, { headers: noStore });
}
