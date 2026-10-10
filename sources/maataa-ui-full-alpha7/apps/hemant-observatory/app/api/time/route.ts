import { validatedTimeResponse } from "@/lib/time-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return validatedTimeResponse(["--json"]);
}
