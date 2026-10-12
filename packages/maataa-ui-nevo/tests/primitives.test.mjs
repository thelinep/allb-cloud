import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as ui from "../dist/index.js";

test("exports the scoped, accessible primitive foundation", () => {
  for (const name of ["UiProvider", "Button", "IconButton", "Card", "Section", "EmptyState", "LoadingState", "StatusBadge", "VisuallyHidden"]) {
    assert.equal(typeof ui[name], "function", `${name} must be exported`);
  }
});

test("keeps package CSS opt-in and does not style host landmarks", () => {
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /\.maataa-ui/);
  for (const forbidden of [":root", "body {", "main{", "aside {"]) assert.equal(styles.includes(forbidden), false, `unexpected global selector: ${forbidden}`);
});
