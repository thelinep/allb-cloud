import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://127.0.0.1:8793";
const utc = "2026-10-10T00:00:00Z";
const response = await fetch(`${base}/api/panchanga/instant?utc=${encodeURIComponent(utc)}`);
const result = await response.json();
if (response.status === 503 && result.status === "upstream-unavailable") {
  console.log("SKIP: local Workerd could not reach JPL Horizons; the API failed closed and returned no calculated value.");
  process.exit(0);
}
assert.equal(response.status, 200, JSON.stringify(result));
assert.equal(result.schema, "hemant.panchanga-observed-instant/1");
assert.equal(result.evidence.source, "NASA/JPL Horizons API");
assert.equal(result.evidence.instantUtc, utc);
assert.match(result.sun.ephemerisIdentity, /de441/i);
assert.equal(result.evidence.frame, "IAU 1976/80 apparent ecliptic and equinox of date");
assert.equal(result.evidence.uncertainty.includes("not independently quantified"), true);
assert.ok(Number.isFinite(result.sun.longitudeDegrees));
assert.ok(Number.isFinite(result.moon.longitudeDegrees));
const elongation = (result.moon.longitudeDegrees - result.sun.longitudeDegrees + 360) % 360;
assert.ok(Math.abs(elongation - result.calculation.elongation_degrees) < 0.000002);
assert.equal(result.calculation.tithi_ordinal, Math.floor(elongation / 12) + 1);
assert.equal(result.calculation.karana_index, Math.floor(elongation / 6));
assert.equal(result.calculation.nakshatra, null);
console.log("Live JPL → Rust/Wasm instant Panchanga calculation passes provenance and angle-parity checks.");
