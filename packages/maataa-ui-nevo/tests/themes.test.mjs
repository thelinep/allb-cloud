import assert from "node:assert/strict";
import test from "node:test";
import { themeFamilies, themes } from "../dist/themes.js";

test("preserves 68 themes across 11 families", () => {
  assert.equal(themeFamilies.length, 11);
  assert.equal(themes.length, 68);
  assert.equal(new Set(themes.map(theme => theme.id)).size, 68);
});
