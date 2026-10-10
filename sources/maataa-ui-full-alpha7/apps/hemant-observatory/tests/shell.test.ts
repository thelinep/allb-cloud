// Failure paths of the server-side shell bridge, plus a real-binary check
// that runs only when target/debug|release/hemant-shell executes here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runShell, shellBinary } from "../lib/shell.ts";
import { parseMethodRegistry, parseTimeResult } from "../lib/contract.ts";

test("missing binary is 503, a failing binary is 422, garbage output is 502", () => {
  assert.deepEqual(runShell(["--json"], null), { ok: false, status: 503, error: "Rust time shell is not built (run cargo build)" });
  const failing = runShell(["--json"], "/usr/bin/false");
  assert.equal(failing.ok, false);
  if (!failing.ok) assert.equal(failing.status, 422);
  const garbage = runShell(["--json"], "/bin/echo");
  assert.equal(garbage.ok, false);
  if (!garbage.ok) assert.equal(garbage.status, 502);
});

const binary = shellBinary(new URL("..", import.meta.url).pathname);
const runnable = binary !== null && runShell(["--methods-json"], binary).ok;

test("real hemant-shell output matches the contract and the committed fixtures", { skip: runnable ? false : "hemant-shell binary not built for this platform" }, () => {
  const registryRun = runShell(["--methods-json"], binary);
  assert.ok(registryRun.ok);
  const registry = parseMethodRegistry(registryRun.json);
  assert.ok(registry.ok);
  const fixture = JSON.parse(readFileSync(new URL("../fixtures/method-registry.json", import.meta.url), "utf8"));
  assert.deepEqual(registryRun.json, fixture, "fixtures/method-registry.json is stale; regenerate it");
  const live = runShell(["--json"], binary);
  assert.ok(live.ok);
  const parsed = parseTimeResult(live.json, registry.value);
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.error);
  assert.equal(parsed.value.reading.source, "host-system-wall-clock");
  const supplied = runShell(["--unix-nanos", "285148740000000000", "--json"], binary);
  assert.ok(supplied.ok);
  assert.deepEqual(supplied.json, JSON.parse(readFileSync(new URL("../fixtures/time-result.epoch.json", import.meta.url), "utf8")));
  const rejected = runShell(["--unix-nanos", "999999999999999999999", "--json"], binary);
  assert.equal(rejected.ok, false);
});
