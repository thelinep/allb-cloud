#!/usr/bin/env bash
set -euo pipefail

rustc_path="$(rustup which rustc 2>/dev/null || command -v rustc)"
RUSTC="$rustc_path" cargo rustc --offline --release \
  --target wasm32-unknown-unknown \
  -p hemant-wasm -- -C panic=abort
