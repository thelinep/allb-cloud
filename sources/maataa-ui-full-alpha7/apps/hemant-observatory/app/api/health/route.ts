import { noStore, runShell } from "@/lib/shell";
import { parseMethodRegistry } from "@/lib/contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Liveness confirms that the packaged Node app can still invoke the Rust
// runtime. Scientific readiness remains explicitly separate: the ephemeris
// and Panchanga methods are still pending and this route does not certify them.
export async function GET() {
  const run = runShell(["--methods-json"]);
  if (!run.ok) {
    return Response.json(
      { status: "unavailable", component: "hemant-observatory", runtime: "rust-shell", error: run.error },
      { status: run.status, headers: noStore },
    );
  }

  const parsedRegistry = parseMethodRegistry(run.json);
  if (!parsedRegistry.ok) {
    return Response.json(
      { status: "unavailable", component: "hemant-observatory", runtime: "rust-shell", error: "method registry contract failed" },
      { status: 502, headers: noStore },
    );
  }
  const pendingMethods = parsedRegistry.value.methods
    .filter((method) => method.status === "pending")
    .map((method) => method.id);

  return Response.json(
    {
      status: "alive",
      component: "hemant-observatory",
      runtime: "rust-shell",
      scientificReadiness: pendingMethods.length === 0 ? "complete" : "incomplete",
      pendingMethods,
      domain: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      domainVerification: "not-verified-by-application",
    },
    { headers: noStore },
  );
}
