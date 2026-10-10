import wasmModule from "../target/wasm32-unknown-unknown/release/hemant_wasm.wasm";
import { validateUnixNanosInput } from "../lib/contract";
import { fetchHorizonsLongitude, fetchHorizonsLongitudeSeries, parseUtcInstant } from "../lib/jpl";
// @ts-expect-error OpenNext generates the server entry during its build.
import openNextWorker from "../.open-next/worker.js";

const OUTPUT_CAPACITY = 64 * 1024;
const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };

const instantiated = await WebAssembly.instantiate(wasmModule);
const wasm = instantiated.exports;
const memoryExport = wasm.memory;
if (!(memoryExport instanceof WebAssembly.Memory)) throw new Error("Hemant Wasm module did not export memory");
const memory = memoryExport;

function callWasm(name: string, args: unknown[]): unknown {
  const exported = wasm[name];
  if (typeof exported !== "function") throw new Error(`Hemant Wasm export missing: ${name}`);
  return exported.call(undefined, ...args);
}

function callWasmNumber(name: string, args: unknown[]): number {
  const result = callWasm(name, args);
  if (typeof result !== "number" || !Number.isInteger(result)) throw new Error(`Hemant Wasm export returned invalid result: ${name}`);
  return result;
}

function splitI128(value: bigint): [bigint, bigint] {
  const bits = BigInt.asUintN(128, value);
  return [BigInt.asIntN(64, bits >> 64n), BigInt.asIntN(64, bits)];
}

function wasmJson(exportName: string, args: unknown[] = []): unknown {
  const pointer = callWasmNumber("hemant_alloc", [OUTPUT_CAPACITY]);
  if (pointer <= 0) throw new Error("Hemant Wasm output allocation failed");
  try {
    const length = callWasmNumber(exportName, [...args, pointer, OUTPUT_CAPACITY]);
    if (length < 0 || length > OUTPUT_CAPACITY) throw new Error(`Hemant Wasm operation failed with code ${length}`);
    const bytes = new Uint8Array(memory.buffer, pointer, length);
    return JSON.parse(new TextDecoder().decode(bytes));
  } finally {
    callWasm("hemant_free", [pointer, OUTPUT_CAPACITY]);
  }
}

function timeJson(unixNanos: bigint, source: 0 | 1): unknown {
  const [high, low] = splitI128(unixNanos);
  return wasmJson("hemant_time_result_json", [source, high, low]);
}

function findIngressBracket(samples: { timeUtc: string; longitudeDegrees: number }[], ayanamshaMicrodegrees: number) {
  for (let index = 1; index < samples.length; index += 1) {
    const left = samples[index - 1];
    const right = samples[index];
    const lon0 = Math.round(left.longitudeDegrees * 1_000_000);
    const lon1 = Math.round(right.longitudeDegrees * 1_000_000);
    const a = ((lon0 - ayanamshaMicrodegrees) % 360_000_000 + 360_000_000) % 360_000_000;
    const b = ((lon1 - ayanamshaMicrodegrees) % 360_000_000 + 360_000_000) % 360_000_000;
    const delta = (b - a + 360_000_000) % 360_000_000;
    const boundary = ((Math.floor(a / 30_000_000) + 1) * 30_000_000) % 360_000_000;
    const distance = (boundary - a + 360_000_000) % 360_000_000;
    if (delta > 0 && delta < 2_000_000 && distance <= delta) return { left, right };
  }
  return null;
}

const signNames = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: noStore });
}

function onlyGet(request: Request): Response | null {
  return request.method === "GET" ? null : new Response(JSON.stringify({ error: "method not allowed" }), {
    status: 405,
    headers: { ...noStore, Allow: "GET" },
  });
}

export default {
  async fetch(
    request: Request,
    env: { ASSETS: { fetch(request: Request): Promise<Response> } },
    ctx: { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void; props?: unknown },
  ): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return openNextWorker.fetch(request, env, ctx);
    const methodError = onlyGet(request);
    if (methodError) return methodError;

    try {
      if (url.pathname === "/api/time") {
        const millis = Date.now();
        if (!Number.isSafeInteger(millis) || millis < 0) return json({ error: "runtime clock is outside supported range" }, 503);
        return json(timeJson(BigInt(millis) * 1_000_000n, 0));
      }
      if (url.pathname === "/api/convert") {
        if ([...url.searchParams.keys()].some((key) => key !== "unix_nanos")) return json({ error: "only the unix_nanos parameter is accepted" }, 400);
        const input = validateUnixNanosInput(url.searchParams.get("unix_nanos"));
        if (!input.ok) return json({ error: input.error }, 400);
        return json(timeJson(BigInt(input.value), 1));
      }
      if (url.pathname === "/api/astronomy/angles" || url.pathname === "/api/panchanga/instant") {
        if ([...url.searchParams.keys()].some((key) => key !== "utc")) return json({ error: "only the utc parameter is accepted" }, 400);
        const atUtc = parseUtcInstant(url.searchParams.get("utc"));
        if (!atUtc) return json({ error: "utc must be an exact ISO-8601 UTC instant with seconds" }, 400);
        const [sun, moon] = await Promise.all([
          fetchHorizonsLongitude("10", atUtc, AbortSignal.timeout(15_000)),
          fetchHorizonsLongitude("301", atUtc, AbortSignal.timeout(15_000)),
        ]);
        const sunMicrodegrees = Math.round(sun.longitudeDegrees * 1_000_000);
        const moonMicrodegrees = Math.round(moon.longitudeDegrees * 1_000_000);
        const panchanga = wasmJson("hemant_panchanga_angles_json", [BigInt(sunMicrodegrees), BigInt(moonMicrodegrees)]);
        const evidence = {
          source: "NASA/JPL Horizons API",
          sourceUrl: "https://ssd.jpl.nasa.gov/api/horizons.api",
          ephemeris: { sun: sun.ephemerisIdentity, moon: moon.ephemerisIdentity },
          observer: "geocenter (399)",
          frame: "IAU 1976/80 apparent ecliptic and equinox of date",
          timescale: "Horizons UT output; after 1962 this maps to UTC; earlier historical dates use UT1",
          corrections: "Horizons observer ephemeris conventions, including light-time and apparent-place corrections",
          instantUtc: atUtc,
          angularResolutionDegrees: 0.000001,
          uncertainty: "not independently quantified by this service; provider output precision is not uncertainty",
          fetchedAtUtc: new Date().toISOString(),
          earthOrientation: { sun: sun.earthOrientation, moon: moon.earthOrientation },
        };
        if (url.pathname === "/api/astronomy/angles") return json({ schema: "hemant.astronomy-observer-angles/1", sun, moon, evidence });
        return json({ schema: "hemant.panchanga-observed-instant/1", sun, moon, calculation: panchanga, evidence,
          limitations: ["instantaneous angle bins; not assigned to a local sunrise day", "nakshatra and yoga require an explicitly selected ayanamsha", "maasa, vara, ritu and full traditional Panchanga rules remain unimplemented", "single ephemeris provider; no independent model cross-check"] });
      }
      if (url.pathname === "/api/sankranti/next") {
        if ([...url.searchParams.keys()].some((key) => key !== "after_utc" && key !== "ayanamsha_microdegrees")) return json({ error: "only after_utc and ayanamsha_microdegrees are accepted" }, 400);
        const afterUtc = parseUtcInstant(url.searchParams.get("after_utc"));
        const offsetText = url.searchParams.get("ayanamsha_microdegrees");
        if (!afterUtc || !offsetText || !/^\d{1,8}$/.test(offsetText)) return json({ error: "provide an exact after_utc instant and an explicit ayanamsha_microdegrees value" }, 400);
        const ayanamsha = Number(offsetText);
        if (!Number.isSafeInteger(ayanamsha) || ayanamsha < 0 || ayanamsha >= 60_000_000) return json({ error: "ayanamsha_microdegrees must be from 0 up to 60 degrees" }, 400);
        const start = Date.parse(afterUtc);
        const stop = new Date(start + 370 * 86_400_000).toISOString().slice(0, 19).replace("T", " ");
        const daySeries = await fetchHorizonsLongitudeSeries(afterUtc.slice(0, 19).replace("T", " "), stop, "1 d", AbortSignal.timeout(20_000));
        const dailyBracket = findIngressBracket(daySeries.samples, ayanamsha);
        if (!dailyBracket) return json({ error: "no ingress found in the next 370 days; provider coverage may be unavailable" }, 404);
        const fineSeries = await fetchHorizonsLongitudeSeries(dailyBracket.left.timeUtc.replace("T", " ").slice(0, 16), dailyBracket.right.timeUtc.replace("T", " ").slice(0, 16), "1 m", AbortSignal.timeout(20_000));
        const minuteBracket = findIngressBracket(fineSeries.samples, ayanamsha);
        if (!minuteBracket) return json({ error: "daily crossing could not be refined with one-minute samples" }, 502);
        const t0 = Date.parse(minuteBracket.left.timeUtc);
        const t1 = Date.parse(minuteBracket.right.timeUtc);
        const crossing = wasmJson("hemant_sankranti_bracket_json", [
          BigInt(t0), BigInt(Math.round(minuteBracket.left.longitudeDegrees * 1_000_000)),
          BigInt(t1), BigInt(Math.round(minuteBracket.right.longitudeDegrees * 1_000_000)), BigInt(ayanamsha),
        ]) as { unix_millis: number; sign_index: number; method: string };
        const ingressUtc = new Date(crossing.unix_millis).toISOString();
        return json({ schema: "hemant.sankranti-event/1", event: "sidereal solar sign ingress under user-supplied ayanamsha", sign: signNames[crossing.sign_index], signIndex: crossing.sign_index,
          instantUtc: ingressUtc, ayanamshaMicrodegrees: ayanamsha, computation: "JPL Horizons daily search followed by one-minute samples and Rust linear interpolation",
          method: crossing.method, source: "NASA/JPL Horizons", providerMetadata: { daily: daySeries.rawHeader, refinement: fineSeries.rawHeader },
          uncertainty: "not quantified; one-minute input bracket and interpolated time are resolution evidence, not a full error budget", locationNote: "astronomical geocentric event instant; local observance date/time is location and tradition dependent" });
      }
      if (url.pathname === "/api/methods") return json(wasmJson("hemant_method_registry_json"));
      if (url.pathname === "/api/health") {
        const registry = wasmJson("hemant_method_registry_json") as { methods?: { id: string; status: string }[] };
        if (!Array.isArray(registry.methods)) return json({ status: "unavailable", component: "hemant-observatory", runtime: "rust-wasm", error: "method registry contract failed" }, 502);
        const pendingMethods = registry.methods.filter((method) => method.status === "pending").map((method) => method.id);
        return json({
          status: "alive",
          component: "hemant-observatory",
          runtime: "rust-wasm-worker",
          scientificReadiness: pendingMethods.length === 0 ? "complete" : "incomplete",
          pendingMethods,
          domain: null,
          domainVerification: "not-verified-by-application",
        });
      }
      return json({ error: "not found" }, 404);
    } catch (error) {
      console.error("Hemant API request failed", {
        route: url.pathname,
        reason: error instanceof Error ? error.message.slice(0, 160) : "unknown runtime error",
      });
      if (url.pathname === "/api/astronomy/angles" || url.pathname === "/api/panchanga/instant" || url.pathname === "/api/sankranti/next") {
        return json({ error: "JPL Horizons is unavailable or returned an invalid response; no astronomy or calendar value was returned", status: "upstream-unavailable" }, 503);
      }
      return json({ error: "Hemant Worker runtime failed closed" }, 503);
    }
  },
};
