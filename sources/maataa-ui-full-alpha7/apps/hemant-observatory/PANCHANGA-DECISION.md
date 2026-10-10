# PANCHANGA-DECISION — open

**Status:** no complete Panchanga ruleset is selected. The runtime calculates instantaneous tithi/paksha/karana angle bins from JPL apparent Sun/Moon longitudes; it does not assign a sunrise-based civil day or produce a complete named calendar. `panchanga-ruleset` remains pending.

The Panchanga page now includes a comparison workbench for alternative authority families, ayanamsha modes, observer locations, day boundaries, month/calendar systems and ayana definitions. It can retain up to four assumption profiles in page state. This is a comparison of declarations only: it does not calculate outputs, persist a profile, select a canonical default, or validate any tradition. Candidate source links and limits are shown beside the options.

The project records name a **Kashi (Varanasi)** reference for the Hemant epoch, but they do not name a calculation tradition, source edition, ayanamsha, sunrise rule or month system. These cannot be inferred safely, so they are product-owner decisions. The IMD Rashtriya Panchang is listed as a potential independent reference, not selected as the product default:

1. **Authority and source edition:** compare IMD Rashtriya Panchang, a named observational *drik* publication, a named siddhantic text and edition, and regional published Panchangs. These are not interchangeable categories; identify the exact calculation method and publication before comparing their outputs.
2. **Location policy:** compare Kashi, Delhi, Prayagraj, Ujjain, Haridwar, the IMD adopted central-station reference, multiple locations, or custom WGS84 coordinates. Named cities need exact site coordinates, elevation and provenance before local results can be calculated. The IMD adopted central station is documented as 23°11′ N, 82°30′ E and should not be confused with Ujjain city.
3. **Ayanamsha/zodiac:** compare Lahiri/Chitrapaksha, Raman, Krishnamurti, Fagan–Bradley, or a tropical/sayana reference. A named mode and its epoch/model must be implemented; tropical is a separate reference rather than an ayanamsha.
4. **Sunrise and day boundary:** compare the IMD-described upper-limb/refraction convention, geometric-center sunrise without refraction, a fully specified local horizon model, civil midnight, and instant-only event reporting.
5. **Month/calendar system:** compare amanta and purnimanta lunar-month rules, plus the distinct all-India nirayana solar calendar; document adhika/kshaya handling.
6. **Ayana definition:** compare tropical solstice, sidereal Makara ingress, or display both as separate events.
7. **Independent reference cases:** select a published Panchang or ephemeris (publisher, edition) with specific dates, locations and stated precision for each profile.

The UI comparison tracks capture up to four combinations of these choices so they can be reviewed side by side. They are not yet independent computed calendars; each remains `not calculated` until the corresponding method, inputs and reference tests exist.

## Implementation plan once decided

- The ruleset is a versioned record layered on the ephemeris provider (ASTRONOMY-DECISION-001); it never computes positions itself.
- Fields are added one at a time, in dependency order: tithi/paksha (Sun–Moon elongation only), then karana, then nakshatra/yoga (need ayanamsha), then vara/maasa/ritu/ayana (need sunrise and month rules).
- Each field ships with boundary cases (near-transition instants, location changes, day-boundary cases) checked against the independent reference cases.
- The UI shows the selected location and ruleset beside every value. Unimplemented fields stay `pending`.

Field definitions used on the Panchanga page are in `lib/panchanga.ts`. Instant tithi/paksha/karana are calculated when an explicit instant is requested; the other fields remain definitions until their own rules and reference tests are added.
