# Scientific calculation and clock evidence

Status: first reproducible astronomy/Panchanga slice implemented; not a verified clock, complete Panchanga, or flight-navigation product.

## Clock claim

The runtime clock remains `unverified`. The Worker reads `Date.now()` and preserves its source and unknown uncertainty. A read-only macOS SNTP check at 2026-10-09 23:26:29–30 UTC returned Cloudflare `-0.025926 ± 0.097105 s`, Apple `+0.000144 ± 0.095654 s`, and Google `-0.002653 ± 0.071259 s`. The intervals overlap, and the offsets differ by at most about 29 ms. These are one-time, unauthenticated SNTP measurements; the server error estimates do not establish independent upstreams or the Mac's ongoing time-discipline state. They support “host clock cross-check consistent within reported ±0.1 s for this sample,” not an ongoing `verified` clock status. The earlier JPL generation-stamp comparison is not used as a clock reference.

For a defensible synchronized clock record, capture repeated request/response timestamps against multiple administratively and technically independent time sources, estimate offset and round-trip delay, propagate dispersion and oscillator drift between syncs, reject inconsistent sources, and record the acceptance threshold and freshness. NTP defines offset, delay, dispersion and synchronization distance; NTS authenticates/protects NTP exchanges but does not by itself prove source accuracy. A Cloudflare Worker cannot directly establish the host's clock discipline; the local OS or a separate trusted time monitor must supply that measurement record. macOS `systemsetup` would not reveal the network-time setting without administrator access, so this check did not inspect that persistent configuration.

## Reproducible JPL observation

An earlier live JPL Horizons request for 2026-10-10 00:00 UT used target Sun `10` and Moon `301`, geocenter `500@399`, observer ephemeris quantity `31` (`ObsEcLon`, `ObsEcLat`), UTC/UT input, one-minute output step, and degrees. The provider reported ephemeris DE441 and an Earth-orientation file with measured/predicted coverage in its response header.

| Quantity at 2026-10-10 00:00 UT | Value |
| --- | ---: |
| Sun apparent ecliptic longitude | 196.7084879° |
| Moon apparent ecliptic longitude | 188.7250176° |
| Moon-minus-Sun elongation, normalized to [0, 360) | 352.0165297° |
| 12° bin | tithi ordinal 30 |
| 6° bin | karana index 58 |

The live endpoint obtains these values afresh and passes rounded integer microdegrees to the Rust core. A saved provider response fixture protects parsing and parity regression. A local direct-JPL-to-Rust/Wasm smoke test also requests these values from JPL and checks the returned angle bins. Tithi ordinal 30 is an instantaneous angular bin, not a sunrise-assigned civil day or complete named Panchanga. The rendered decimals are output precision, not an error bound. One provider is not an independent ephemeris validation. The local Workerd sandbox could not reach the upstream JPL API, so the Worker's live-egress test is explicitly skipped there after it returns a typed 503 with no values; the same JPL parser and Rust/Wasm calculation are tested directly from the host process.

## Calculation contracts

The Panchanga page exposes candidate authorities, sidereal modes, location choices, civil-day boundaries, month systems and ayana definitions as selectable comparison dimensions. Up to four profiles can be recorded side by side, but they currently compare declared assumptions only. No canonical profile is preselected and no competing calendar values are fabricated. The IMD profile links to its method description, which specifies such details as sunrise-based day reckoning, its adopted central station, and the upper-limb/refraction convention.

- Apparent longitudes come from JPL Horizons observer quantity 31: observer-centered IAU 1976/80 ecliptic-of-date apparent target coordinates, including light-time, gravitational light deflection and stellar aberration per the Horizons manual. The current observer is geocenter; there is no Kashi/local topocentric correction.
- Instantaneous elongation is `(Moon longitude - Sun longitude) mod 360°`. Tithi bins have width 12°; paksha is split at 180°; karana bins have width 6°. Integer microdegrees avoid floating-point boundary drift in this classification.
- Nakshatra and yoga require a selected ayanamsha and are intentionally omitted. Vara, sunrise assignment, maasa, ritu, ayana, and observance require additional calendar/location rules and independent comparison cases.
- The Sankranti endpoint searches up to 370 days at daily steps, narrows a detected crossing with one-minute Horizons samples, and linearly interpolates in Rust. It requires an explicit numeric ayanamsha offset and returns the crossed sidereal sign. It does not silently select Lahiri or another tradition. One-minute sampling is resolution evidence, not an uncertainty budget. Regional observance depends on location and tradition.
- The user-selected 1979 Kashi reference remains 14 Jan 1979 13:29 IST (07:59 UT/UTC), at minute precision. This code has not independently recomputed that historical reference under a named ayanamsha and chosen published comparison source.

## Remaining validation gates

1. Pin the intended calendar authority and edition. The IMD Rashtriya Panchang is a documented scientific comparison source, but adopting it as Hemant's default is a product decision.
2. Select the ayanamsha and epoch convention; document the algorithm and version. Add published reference vectors for longitudes, tithi boundaries, named karanas, and Sankranti times.
3. Compare a second ephemeris implementation/data set or official Indian Astronomical Ephemeris values. Define tolerances from their published uncertainty/precision before claiming validation.
4. Choose observer coordinates, sunrise limb/refraction/elevation rule, timezone database policy, amanta/purnimanta behavior, adhika/kshaya rules, and day boundary.
5. For clock verification, capture NTP/NTS evidence from the operating system or a separate monitor. Set maximum offset, delay, dispersion, source agreement, sample age and drift thresholds; test stale sources and outliers.
6. Preserve requests, provider signature, ephemeris identity, EOP file/coverage, instant, method IDs and software revision in evidence. Never describe decimal places as uncertainty.

## Primary scientific references

- [JPL Horizons API documentation](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- [JPL Horizons system manual: observer quantities and time scales](https://ssd.jpl.nasa.gov/horizons/manual.html)
- [NAIF SPICE time subsystem](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/time.html)
- [IERS time-scales web service](https://www.iers.org/iers/en/dataproducts/tools/webservices/webservice-time)
- [IETF RFC 5905: Network Time Protocol Version 4](https://datatracker.ietf.org/doc/html/rfc5905)
- [IETF RFC 8915: Network Time Security](https://datatracker.ietf.org/doc/html/rfc8915)
- [IMD: Indian Astronomical Ephemeris](https://mausam.imd.gov.in/hindinew/imd_latest/contents/indian_astronomical_ephemerishi.php)
- [IMD Positional Astronomy Centre: Rashtriya Panchang explanation](https://packolkata.imd.gov.in/panchang/en/explanation)
- [IMD Rashtriya Panchang preface](https://packolkata.imd.gov.in/panchang/en/preface)
