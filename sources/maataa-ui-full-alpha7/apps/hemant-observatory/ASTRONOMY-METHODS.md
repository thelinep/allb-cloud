# Astronomy method baseline

This note records the delivered narrow astronomy slice and the wider work that remains. A complete ephemeris or Panchanga ruleset is not implemented.

## Separate time and position foundations

- Keep host wall time, UTC representation, atomic/dynamical time scales, monotonic elapsed time, and Hemant calendar units as separate typed values. A host timestamp remains unverified until its synchronization source and uncertainty are measured.
- For reproducible solar-system geometry, evaluate JPL Development Ephemeris data through a documented ephemeris interface. JPL Horizons states that its calculations use DE440/441 and an ICRF-aligned reference frame; a result must still identify the requested target, observer, frame, corrections, and time argument.
- Use a maintained time-conversion implementation with pinned leap-second data for UTC/TAI/TT/TDB conversions. NASA NAIF SPICE documents conversions among UTC representations and TAI, TT, and TDB time systems. UTC is a civil representation with leap-second rules; it is not interchangeable with TDB.
- For Earth-rotation and local-horizon results, include the appropriate IERS Earth-orientation data and its epoch/version. Do not derive precise sidereal or horizon results from UTC alone.

## Result record required before showing computed astronomy

Every computed value should carry:

1. target and observer identifiers;
2. coordinate frame and origin;
3. time value and time scale;
4. algorithm/provider, version, data-file identity, and coverage interval;
5. corrections and conventions (for example, geometric versus apparent position);
6. units, validity status, and uncertainty or an explicit unknown value.

The UI should distinguish observed, ephemeris-derived, simulated, user-selected, tradition-derived, illustrative, and pending values. A method label is provenance, not a guarantee of accuracy.

## Panchanga boundary

Panchanga calculations need a named calendar tradition and explicit rules for ayanāṃśa, location, sunrise convention, boundary handling, and source editions. Keep that ruleset separate from the planetary ephemeris engine. Do not display tithi, nakshatra, yoga, or karana until a selected ruleset is implemented and compared against independent reference cases.

## Current implementation

The local Rust ephemeris boundary still has no bundled kernel. Separately, a Cloudflare Worker now requests geocentric apparent Sun and Moon angles from the public JPL Horizons API and sends them to Rust angle-bin calculations. The endpoints do not make this an onboard or bundled ephemeris and do not independently verify JPL's values. Planetary state vectors, spacecraft navigation and the complete Panchanga ruleset remain pending. See `SCIENTIFIC-VALIDATION.md` for the precise contract, sample, sources and gates.

## Primary references

- [NASA/JPL Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html)
- [NASA NAIF SPICE time subsystem](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/time.html)
- [IERS time scales and leap-second service](https://www.iers.org/iers/en/dataproducts/tools/webservices/webservice-time)
