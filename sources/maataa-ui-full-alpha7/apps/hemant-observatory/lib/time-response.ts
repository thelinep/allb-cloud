import { parseMethodRegistry, parseTimeResult } from "@/lib/contract";
import { noStore, runShell, type ShellArgs } from "@/lib/shell";

/** Runs the shell with fixed arguments and returns only contract-valid output. */
export function validatedTimeResponse(args: ShellArgs): Response {
  const registryRun = runShell(["--methods-json"]);
  if (!registryRun.ok) return Response.json({ error: registryRun.error, verification: "unavailable" }, { status: registryRun.status, headers: noStore });
  const registry = parseMethodRegistry(registryRun.json);
  if (!registry.ok) return Response.json({ error: `method registry invalid: ${registry.error}`, verification: "unavailable" }, { status: 502, headers: noStore });
  const run = runShell(args);
  if (!run.ok) return Response.json({ error: run.error, verification: "unavailable" }, { status: run.status, headers: noStore });
  const result = parseTimeResult(run.json, registry.value);
  if (!result.ok) return Response.json({ error: `time result invalid: ${result.error}`, verification: "unavailable" }, { status: 502, headers: noStore });
  return Response.json(result.value, { headers: noStore });
}
