# Rust core status

std-only workspace (`hemant-core`, `hemant-shell`); no crates.io dependencies. See README for the module map.

- **Time:** injectable `WallClock` (`HostWallClock`, `FixedWallClock` for tests); `WallClockSnapshot` is a point reading, always `unverified`, uncertainty `unknown`. `MonotonicInterval` rejects reversed readings. Supported civil range 0001-01-01T00:00:00 to 9999-12-31T23:59:59.999999999 UTC; outside values fail with `OutOfRange`. Leap seconds are not representable.
- **Units:** `hemant-traditional-units-v1` from the user-selected 1979-01-14 07:59 UTC epoch; whole nimesha floored, residual reported; Unix-time difference.
- **Registry:** `hemant.method-registry/1` — 10 methods (8 active, 2 pending), each with evidence class, inputs, source, time scale, frame/location, units, uncertainty and limitations. The two new active records cover JPL apparent Sun/Moon angles and instant tithi/paksha/karana angle bins; full planetary positions and a complete Panchanga ruleset stay pending.
- **Result:** `hemant.time-result/2`. v1 (flat, unversioned) is replaced; the only consumer is this app.
- **Ephemeris:** interface only (`NoEphemeris` → `Pending`).
- **Checks (Rust 1.97 sandbox, same sources):** 28 tests pass, clippy `-D warnings` clean, release build OK. Re-run on macOS with `bash scripts/check.sh`.
