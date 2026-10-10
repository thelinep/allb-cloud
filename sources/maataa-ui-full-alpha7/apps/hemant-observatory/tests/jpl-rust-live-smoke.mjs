import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/jpl.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { fetchHorizonsLongitude, parseUtcInstant } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const atUtc = parseUtcInstant(process.argv[2] ?? "2026-10-10T00:00:00Z");
assert.ok(atUtc);
const [sun, moon] = await Promise.all([
  fetchHorizonsLongitude("10", atUtc, AbortSignal.timeout(20_000)),
  fetchHorizonsLongitude("301", atUtc, AbortSignal.timeout(20_000)),
]);
assert.equal(sun.ephemerisIdentity.toLowerCase(), "de441");
assert.equal(moon.ephemerisIdentity.toLowerCase(), "de441");
assert.match(sun.earthOrientation, /EOP file/);
assert.match(moon.earthOrientation, /EOP file/);

const { instance } = await WebAssembly.instantiate(readFileSync("target/wasm32-unknown-unknown/release/hemant_wasm.wasm"));
const { memory, hemant_alloc, hemant_free, hemant_panchanga_angles_json } = instance.exports;
const capacity = 65_536;
const pointer = hemant_alloc(capacity);
try {
  const written = hemant_panchanga_angles_json(
    BigInt(Math.round(sun.longitudeDegrees * 1_000_000)),
    BigInt(Math.round(moon.longitudeDegrees * 1_000_000)), pointer, capacity,
  );
  assert.ok(written > 0);
  const result = JSON.parse(new TextDecoder().decode(new Uint8Array(memory.buffer, pointer, written)));
  const elongation = (moon.longitudeDegrees - sun.longitudeDegrees + 360) % 360;
  assert.ok(Math.abs(result.elongation_degrees - elongation) < 0.000002);
  assert.equal(result.tithi_ordinal, Math.floor(elongation / 12) + 1);
  assert.equal(result.karana_index, Math.floor(elongation / 6));
  assert.equal(result.nakshatra, null);
  assert.equal(result.yoga, null);
  console.log(`Live JPL ${atUtc}: Sun ${sun.longitudeDegrees.toFixed(7)}°, Moon ${moon.longitudeDegrees.toFixed(7)}°; Rust/Wasm instant tithi ${result.tithi_ordinal}, karana ${result.karana_name}.`);
} finally { hemant_free(pointer, capacity); }
