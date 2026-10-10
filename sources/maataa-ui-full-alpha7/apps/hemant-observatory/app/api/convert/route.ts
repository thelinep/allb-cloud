import { validateUnixNanosInput } from "@/lib/contract";
import { noStore } from "@/lib/shell";
import { validatedTimeResponse } from "@/lib/time-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/convert?unix_nanos=<signed integer> — the only caller input accepted. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if ([...url.searchParams.keys()].some((key) => key !== "unix_nanos")) {
    return Response.json({ error: "only the unix_nanos parameter is accepted" }, { status: 400, headers: noStore });
  }
  const input = validateUnixNanosInput(url.searchParams.get("unix_nanos"));
  if (!input.ok) return Response.json({ error: input.error }, { status: 400, headers: noStore });
  return validatedTimeResponse(["--unix-nanos", input.value, "--json"]);
}
