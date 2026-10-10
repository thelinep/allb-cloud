import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/jpl.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { parseHorizonsObserverCsv, parseHorizonsLongitudeSeries, parseUtcInstant } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const fixture = JSON.parse(readFileSync(new URL("../fixtures/jpl-observation-2026-10-10T0000Z.json", import.meta.url), "utf8"));

assert.equal(fixture.schema, "hemant.jpl-observation-fixture/1");
for (const [name, target] of [["sun", "Sun"], ["moon", "Moon"]]) {
  const response = fixture.records[name];
  assert.equal(response.signature.source, "NASA/JPL Horizons API");
  const parsed = parseHorizonsObserverCsv(response.result, target);
  assert.ok(parsed, `${name} observer row parses`);
  assert.equal(parsed.ephemerisIdentity, "DE441");
  assert.match(parsed.earthOrientation, /EOP file\s*:\s*eop\.261009\.p270105/);
  assert.equal(parsed.timeUtc, "2026-Oct-10 00:00");
}
const sun = parseHorizonsObserverCsv(fixture.records.sun.result, "Sun");
const moon = parseHorizonsObserverCsv(fixture.records.moon.result, "Moon");
assert.ok(Math.abs(sun.longitudeDegrees - 196.7084879) < 1e-9);
assert.ok(Math.abs(moon.longitudeDegrees - 188.7250176) < 1e-9);
const series = parseHorizonsLongitudeSeries(fixture.records.sun.result);
assert.equal(series.length, 2);
assert.equal(series[1].timeUtc, "2026-10-10T00:01:00Z");
assert.equal(parseUtcInstant("2026-10-10T00:00:00Z"), "2026-10-10T00:00:00Z");
assert.equal(parseUtcInstant("2026-10-10T00:00:00"), null);
console.log("JPL fixture parser preserves DE441/EOP provenance and the published observer angle rows.");
