// Panchanga field definitions. These state what each field MEASURES in the
// commonly described astronomical form. Exact boundaries, conventions and
// source editions depend on the tradition, which is not yet selected.
// No values are computed anywhere in this app.

export type PanchangaField = {
  key: string;
  name: string;
  devanagari: string;
  measures: string;
  inputs: string[];
  conventionDependent: string;
};

export const panchangaFields: PanchangaField[] = [
  { key: "tithi", name: "Tithi", devanagari: "तिथि", measures: "Moon–Sun elongation in 12° steps (30 per lunar month)", inputs: ["Sun longitude", "Moon longitude"], conventionDependent: "Which tithi is assigned to a civil day (usually the one at local sunrise)" },
  { key: "paksha", name: "Paksha", devanagari: "पक्ष", measures: "Waxing half (elongation 0°–180°) or waning half (180°–360°)", inputs: ["Sun longitude", "Moon longitude"], conventionDependent: "Day assignment at sunrise" },
  { key: "nakshatra", name: "Nakshatra", devanagari: "नक्षत्र", measures: "Moon's sidereal longitude in 27 divisions of 13°20′", inputs: ["Moon longitude", "ayanamsha"], conventionDependent: "Ayanamsha choice; 27 vs 28 nakshatra schemes" },
  { key: "yoga", name: "Yoga", devanagari: "योग", measures: "Sum of Sun and Moon sidereal longitudes in 27 divisions of 13°20′", inputs: ["Sun longitude", "Moon longitude", "ayanamsha"], conventionDependent: "Ayanamsha choice" },
  { key: "karana", name: "Karana", devanagari: "करण", measures: "Half a tithi (6° of elongation); 60 per lunar month from 11 named karanas", inputs: ["Sun longitude", "Moon longitude"], conventionDependent: "Naming sequence edition" },
  { key: "vara", name: "Vara", devanagari: "वार", measures: "Weekday", inputs: ["civil date", "local sunrise"], conventionDependent: "Day boundary: local sunrise (most traditions) vs midnight" },
  { key: "maasa", name: "Maasa", devanagari: "मास", measures: "Lunar month", inputs: ["new/full moon instants", "solar sign"], conventionDependent: "Amanta vs purnimanta; adhika-maasa rules" },
  { key: "ritu", name: "Ritu", devanagari: "ऋतु", measures: "Season (six per year)", inputs: ["maasa or solar sign"], conventionDependent: "Solar vs lunar mapping" },
  { key: "ayana", name: "Ayana", devanagari: "अयन", measures: "Northward or southward half-year of the Sun", inputs: ["Sun longitude"], conventionDependent: "Tropical solstice vs sidereal Makara Sankranti" },
];

export const panchangaDecisions = [
  { key: "tradition", question: "Which calculation tradition and source edition (e.g. a drik/observational school or a named siddhantic text)?", status: "open" },
  { key: "location", question: "Observer location policy: fixed Kashi (Varanasi) coordinates, or user-selected location?", status: "open" },
  { key: "ayanamsha", question: "Which ayanamsha, with its definition and epoch?", status: "open" },
  { key: "sunrise", question: "Sunrise definition (upper limb or centre; refraction; altitude) and day boundary.", status: "open" },
  { key: "month", question: "Month system: amanta or purnimanta; adhika/kshaya rules.", status: "open" },
  { key: "vectors", question: "Independent reference cases (a published panchang for named dates and place) to test against.", status: "open" },
] as const;

/** Comparison candidates are choices to evaluate, not a chosen default ruleset. */
export const comparisonAxes = [
  {
    key: "authority",
    label: "Calendar authority / calculation school",
    help: "These names do not all describe the same kind of authority. Pick an exact edition and algorithm before treating outputs as comparable.",
    options: [
      { id: "imd-rp", label: "IMD Rashtriya Panchang", detail: "Published national reference; uses the Indian Astronomical Ephemeris and documents its adopted central station and sunrise convention.", source: "https://packolkata.imd.gov.in/panchang/en/explanation", sourceLabel: "IMD method notes" },
      { id: "drik", label: "Drik / observational calculation", detail: "Candidate family, not one standard. Choose a named publisher, edition, ephemeris and settings to make a reproducible track." },
      { id: "siddhanta", label: "Siddhānta-text implementation", detail: "Choose a specific text, recension/edition, translation and computational interpretation; no text-derived engine is implemented yet." },
      { id: "regional", label: "Regional published Panchang", detail: "Choose the region, publisher and annual edition. Regional observance rules may differ even when the astronomical instant is shared." },
    ],
  },
  {
    key: "ayanamsha",
    label: "Zodiac / ayanamsha",
    help: "A named sidereal mode is an algorithm and epoch definition, not a timeless fixed offset. Tropical is a separate comparison basis.",
    options: [
      { id: "lahiri", label: "Lahiri / Chitrapaksha", detail: "The Lahiri mode is documented as the Indian Astronomical Ephemeris standard from 1985; evaluate its exact implementation and epoch.", source: "https://www.astro.com/swisseph/swephprg.htm", sourceLabel: "Swiss Ephemeris mode documentation" },
      { id: "raman", label: "Raman", detail: "Alternative named sidereal mode; implementation and comparison vectors required.", source: "https://www.astro.com/swisseph/swephprg.htm", sourceLabel: "Swiss Ephemeris mode documentation" },
      { id: "krishnamurti", label: "Krishnamurti (KP)", detail: "Alternative named sidereal mode; implementation and comparison vectors required.", source: "https://www.astro.com/swisseph/swephprg.htm", sourceLabel: "Swiss Ephemeris mode documentation" },
      { id: "fagan-bradley", label: "Fagan–Bradley", detail: "Documented sidereal comparison mode; not a Panchang authority by itself.", source: "https://www.astro.com/swisseph/swephprg.htm", sourceLabel: "Swiss Ephemeris mode documentation" },
      { id: "sayana", label: "Tropical / sayana", detail: "No ayanamsha subtraction; useful as a distinct tropical reference, not equivalent to a sidereal Panchang." },
    ],
  },
  {
    key: "location",
    label: "Observer location",
    help: "Names are candidate locations only. Exact WGS84 coordinates, elevation, coordinate source and horizon assumptions are needed before local calculations.",
    options: [
      { id: "kashi", label: "Kashi / Varanasi", detail: "Historical epoch reference chosen earlier; it does not automatically set the daily observer location." },
      { id: "delhi", label: "Delhi", detail: "Candidate local-observance location; exact site coordinates remain to be supplied or sourced." },
      { id: "prayagraj", label: "Prayagraj", detail: "Candidate local-observance location; exact site coordinates remain to be supplied or sourced." },
      { id: "ujjain", label: "Ujjain", detail: "Candidate city location. Keep it distinct from IMD's adopted central station coordinates." },
      { id: "haridwar", label: "Haridwar", detail: "Candidate local-observance location; exact site coordinates remain to be supplied or sourced." },
      { id: "imd-central", label: "IMD adopted central station", detail: "IMD describes 23°11′ N, 82°30′ E for relevant central-station calculations; this is a published reference coordinate, not the city of Ujjain.", source: "https://packolkata.imd.gov.in/panchang/en/explanation", sourceLabel: "IMD adopted-station definition" },
      { id: "multi", label: "Compare multiple locations", detail: "Requires a separate, fully specified coordinate set for each site." },
      { id: "custom", label: "Custom WGS84 coordinates", detail: "Enter latitude, longitude, elevation and coordinate provenance in a later calculation step." },
    ],
  },
  {
    key: "day-boundary",
    label: "Civil-day assignment",
    help: "The same astronomical instant can receive different civil-date labels under different day boundaries.",
    options: [
      { id: "sunrise", label: "Local sunrise", detail: "IMD documents sunrise-based day reckoning for its Panchang; its adopted-station and local-time rules must be reproduced.", source: "https://packolkata.imd.gov.in/panchang/en/explanation", sourceLabel: "IMD day-reckoning notes" },
      { id: "midnight", label: "Civil midnight", detail: "Gregorian civil-day comparison; not interchangeable with sunrise-based Panchang assignment." },
      { id: "instant", label: "Instant only", detail: "Keep continuous event times without assigning a Panchang civil day. This is the current computed slice." },
    ],
  },
  {
    key: "month-system",
    label: "Month / calendar system",
    help: "Keep lunar-month naming separate from the fixed-length all-India nirayana solar calendar.",
    options: [
      { id: "amanta", label: "Amānta lunar months", detail: "Candidate lunar month boundary convention; month and adhika/kshaya rules need a named source and tests." },
      { id: "purnimanta", label: "Pūrṇimānta lunar months", detail: "Alternative lunar month naming convention; month and adhika/kshaya rules need a named source and tests." },
      { id: "imd-solar", label: "All-India Nirayana solar calendar", detail: "IMD documents a uniform fixed-length nirayana solar calendar alongside the national calendar; this is a different calendar system, not an amānta variant.", source: "https://packolkata.imd.gov.in/panchang/en/explanation", sourceLabel: "IMD calendar notes" },
    ],
  },
  {
    key: "ayana",
    label: "Ayana / seasonal reference",
    help: "These are separate definitions; do not assume tropical solstice and sidereal Makara ingress occur at the same instant.",
    options: [
      { id: "tropical-solstice", label: "Tropical solstice (sayana)", detail: "Seasonal/tropical reference based on the equinox and solstice points." },
      { id: "sidereal-ingress", label: "Sidereal Makara ingress (nirayana)", detail: "Depends on the selected ayanamsha and solar longitude method; the event solver supports an explicit offset only." },
      { id: "both", label: "Show both side by side", detail: "Requires both methods and their uncertainty/reference comparisons." },
    ],
  },
] as const;

export type ComparisonAxis = (typeof comparisonAxes)[number];
export type ComparisonAxisKey = ComparisonAxis["key"];
export type PanchangaProfileSelection = Record<ComparisonAxisKey, string>;

/** Sidereal sign boundaries used by the Sankranti page (0° … 330°). */
export const rashis = [
  ["Mesha", "मेष"], ["Vrishabha", "वृषभ"], ["Mithuna", "मिथुन"], ["Karka", "कर्क"],
  ["Simha", "सिंह"], ["Kanya", "कन्या"], ["Tula", "तुला"], ["Vrishchika", "वृश्चिक"],
  ["Dhanu", "धनु"], ["Makara", "मकर"], ["Kumbha", "कुम्भ"], ["Meena", "मीन"],
].map(([name, devanagari], index) => ({ name, devanagari, startDegrees: index * 30 }));
