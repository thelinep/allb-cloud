# ASTRONOMY-DECISION-001 — first ephemeris increment

**Status:** local/bundled ephemeris design remains pending. A narrow live JPL Horizons adapter now computes geocentric apparent Sun/Moon angles; wider solar-system positions remain `pending` in the method registry (`astronomy-solar-system-positions`). See `SCIENTIFIC-VALIDATION.md` for the delivered method and evidence.
**Date:** 2026-10-09. Sources were consulted on that date (see the References section).

## Use case and boundary

- **First target:** geometric (no light-time, no aberration) positions and velocities of the Sun, Moon and Earth relative to the solar-system barycenter, plus Moon and Sun relative to Earth, in an ICRF-aligned frame, for one TDB instant. These are the inputs needed later for the Sun–Moon elongation (tithi) and the solar longitude (Sankranti).
- **Out of scope for this increment:** apparent positions, topocentric/horizon coordinates, rise/set, sidereal time, Earth orientation (UT1, polar motion), and any spacecraft state.
- **Computation boundary:** Rust core trait `EphemerisProvider` (`crates/hemant-core/src/astronomy.rs`). The current build ships only `NoEphemeris`, which returns `Pending`. A real provider must return the dataset identity and coverage with every state.

## Dataset

| Item | Decision |
| --- | --- |
| Ephemeris | JPL **DE440** family. JPL states DE440 is its latest planetary/lunar ephemeris. Its planetary positions agree with DE441 to within 1 m over DE440's span. Horizons currently uses DE440/441. |
| File | NAIF generic SPK **`de440s.bsp`**: coverage 1849-12-26 to 2150-01-22 (ET/TDB); Sun, Moon, Earth, planet barycenters and Mercury/Venus. Use `de440.bsp` (1549-12-31 to 2650-01-25) only if that span is needed. |
| Identity to record | File name, SHA-256 of the file, NAIF release date, and coverage interval. A provider must refuse to answer outside the coverage it reports. |
| Format | SPICE binary SPK (Chebyshev records; positions in km; time argument TDB seconds past J2000). |
| Licence / redistribution | NAIF's current rules say kernels distributed from its server may be downloaded and used, and redistribution is permitted while a kernel remains unmodified. Keep the original source, label and checksum; do not commit the large dataset into this source repository. Kernels from other distributors have separate terms. |
| Size | Not stated on the pages consulted. Record the measured size when the file is first fetched. |
| Update cadence | DE440 is fixed; a new DE release becomes a new method version, never a silent replacement. |

## Time scales

- The ephemeris argument is **TDB**. A UTC input must go UTC → TAI using a leap-second table, then TAI → TT (TT = TAI + 32.184 s), then TT → TDB. SPICE's approximation of TDB − TT has amplitude about 1.658 ms and is accurate to about 30 µs (NAIF Time Required Reading).
- Leap seconds: pin a specific NAIF leapseconds kernel (`naif0012.tls` or newer) by file hash. NAIF notes that any leapseconds kernel eventually becomes obsolete. Results for instants after the kernel's last entry must be labelled as depending on an unannounced future-leap-second assumption.
- UTC before 1972 has no leap-second table entry in SPICE; inputs before 1972-01-01 need an explicit policy (reject, or label with a rubber-second note) before they are supported.
- The existing `unix-utc-no-leap-seconds` scale (Unix time) must **not** be passed to an ephemeris as if it were TDB.

## Frames and corrections

- Frame: ICRF-aligned (Horizons says its primary frame is the ICRF and its calculations are done in the ephemeris frame).
- Correction: `Geometric` only in the first increment. Horizons distinguishes geometric, astrometric (light-time) and apparent (light-time, deflection, stellar aberration; refraction only for Earth sites) positions. Each future correction becomes a separate method version.
- Observer: barycentric or geocentric only. Topocentric observers need Earth-orientation data (IERS), which is not included.

## Implementation options (to evaluate before adding any dependency)

1. **NAIF CSPICE via FFI** — the reference implementation. Cost: a C toolkit build, platform packaging, and FFI safety review.
2. **A pure-Rust SPK reader** — fewer platform steps. Needs a current crate review (maintenance, licence, test coverage) and independent comparison against SPICE/Horizons outputs.
3. **Precomputed offline table** generated once with SPICE/Horizons for a fixed span and checked into fixtures with hashes. Simplest to ship. Interpolation error must be bounded and stated.

No option is chosen yet. Each needs: licence review, offline build on macOS arm64, and passing the reference vectors below.

## Independent reference test vectors (to collect)

- From JPL Horizons (DE440/441), "Vector table", geometric, ICRF, TDB: Earth (399) w.r.t. SSB (500@0), Moon (301) w.r.t. Earth (500@399), and Sun (10) w.r.t. SSB at 2000-01-01T12:00:00 TDB, 2024-03-20T00:00:00 TDB, and 1979-01-14T08:00:00 TDB.
- Store them as fixtures with the Horizons request parameters, retrieval date and ephemeris version from the response header. Accept a provider only if it matches within a stated tolerance (target: < 1 km for positions in the DE440 span, to be tightened once the provider is known).
- These vectors are **not** collected yet; that needs network access to Horizons and is listed as an open action.

## Earth orientation (later increment)

Local-horizon results, sidereal time and sunrise need UT1 − UTC and polar motion from IERS products, with the product name, version and epoch recorded. The IERS web pages could not be retrieved in this session (fetch error), so the IERS product selection is an open item.

## References (consulted 2026-10-09)

- NASA/JPL Horizons System manual — https://ssd.jpl.nasa.gov/horizons/manual.html
- NASA NAIF SPICE Time Required Reading — https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/time.html
- NAIF generic SPK summaries — https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/aa_summaries.txt
- JPL planetary ephemeris export page — https://ssd.jpl.nasa.gov/planets/eph_export.html (cites Park et al. 2021, "The JPL Planetary and Lunar Ephemerides DE440 and DE441", doi:10.3847/1538-3881/abd414)
- NAIF SPICE rules — https://naif.jpl.nasa.gov/naif/rules.html (download, use, and unmodified-kernel redistribution terms; checked 2026-10-09)
- Current JPL Horizons manual — https://ssd.jpl.nasa.gov/horizons/manual.html (record the ephemeris indicated by each returned reference vector; do not assume it silently matches a locally pinned kernel)
- IERS time web service — https://www.iers.org/iers/en/dataproducts/tools/webservices/webservice-time (not retrievable in this session)
