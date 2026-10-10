#!/usr/bin/env bash
set -euo pipefail

cargo build --offline --release --workspace
bash scripts/build-wasm.sh
node tests/wasm-smoke.mjs
