#!/bin/bash
# Hemant Observatory qualification checks (macOS host). Offline; installs nothing.
# Writes build output only inside this app (target/, .next/) and test results
# under ../../test-results/hemant-observatory. Usage: bash scripts/check.sh [--no-e2e]
set -u
APP="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG="$APP/evidence/check-$STAMP.log"
mkdir -p "$APP/evidence"
SUMMARY=()
step() { local name="$1"; shift; printf '\n### %s\n$ %s\n' "$name" "$*" >>"$LOG"; "$@" >>"$LOG" 2>&1; local code=$?
  printf 'exit=%s\n' "$code" >>"$LOG"; SUMMARY+=("$( [ $code -eq 0 ] && echo PASS || echo "FAIL($code)" ) | $name"); echo "$( [ $code -eq 0 ] && echo PASS || echo "FAIL($code)" ) | $name"; }
{ echo "# Hemant Observatory checks $STAMP"; uname -a; cargo --version; rustc --version; node --version; } >"$LOG" 2>&1

step "rustfmt --check" cargo fmt --all --check
step "cargo test" cargo test --workspace --offline
step "clippy -D warnings" cargo clippy --workspace --all-targets --offline -- -D warnings
step "cargo build (debug, used by API/e2e)" cargo build --workspace --offline
step "cargo build --release" cargo build --release --workspace --offline
step "fixture drift: method registry" bash -c 'diff <(target/debug/hemant-shell --methods-json) fixtures/method-registry.json'
step "fixture drift: epoch time result" bash -c 'diff <(target/debug/hemant-shell --unix-nanos 285148740000000000 --json) fixtures/time-result.epoch.json'
step "contract + shell tests (node)" bash -c 'node --experimental-strip-types --no-warnings --test tests/*.test.ts'
step "tsc --noEmit" node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
step "next build" node node_modules/next/dist/bin/next build
if [ "${1:-}" != "--no-e2e" ]; then
  step "playwright (desktop + mobile)" node ../../node_modules/@playwright/test/cli.js test --config playwright.config.ts
fi
step "record repo status outside this app" bash -c 'git -C ../.. --no-optional-locks status --porcelain -- apps/hemant-observatory >/dev/null && git -C ../.. --no-optional-locks status --porcelain | grep -v "apps/hemant-observatory" > "$0" ; true' "$APP/evidence/outside-status-$STAMP.txt"
printf '\n## Summary\n' >>"$LOG"; for s in "${SUMMARY[@]}"; do echo "- $s" >>"$LOG"; done
echo "Log: $LOG"
echo "Repo status outside this app (compare with your previous snapshot): $APP/evidence/outside-status-$STAMP.txt"
