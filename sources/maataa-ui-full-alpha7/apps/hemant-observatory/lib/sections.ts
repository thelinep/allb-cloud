export type Capability = "implemented" | "partial" | "reference" | "workspace-pending";

export type Section = {
  slug: string;
  title: string;
  devanagari?: string;
  subtitle: string;
  description: string;
  capability: Capability;
  /** What actually works on this page today. */
  works: string;
  /** What is still pending, stated plainly. */
  pending: string;
};

export const sections: Section[] = [
  { slug: "clock", title: "Live clock & converter", devanagari: "काल", subtitle: "Host snapshot · UTC · IST · Hemant units", description: "Read the host clock through the Rust shell, see its source and age, and convert any supplied Unix-nanosecond value with full method provenance.", capability: "implemented", works: "Host snapshot, UTC civil representation, IST display, Hemant units, input conversion", pending: "Trusted time source, TAI/TT/TDB, sidereal time" },
  { slug: "observatory", title: "Observatory", devanagari: "वेधशाला", subtitle: "Sky geometry & state queries", description: "An illustrative 2D reference geometry with a text equivalent, and a state-query builder that shows exactly what a future ephemeris provider must answer.", capability: "workspace-pending", works: "Illustrative diagram (labelled), query builder", pending: "Any computed position (ASTRONOMY-DECISION-001)" },
  { slug: "panchanga", title: "Panchanga", devanagari: "पञ्चाङ्ग", subtitle: "Tradition-aware calendar", description: "Compare candidate calendar authorities, ayanamshas, locations and day/month rules; calculate only the explicit instantaneous JPL angle slice.", capability: "partial", works: "JPL instant tithi/paksha/karana and an assumptions-only comparison workbench", pending: "Named ruleset, sunrise-based dates and full field values" },
  { slug: "sankranti", title: "Sankranti engine", devanagari: "संक्रान्ति", subtitle: "Solar transitions", description: "Searches JPL solar longitudes and refines a sign crossing when an explicit numeric ayanamsha is supplied.", capability: "partial", works: "JPL-backed sign-crossing estimate with one-minute samples", pending: "Named ayanamsha implementation, independent reference validation and local observance" },
  { slug: "cosmology", title: "Brahmi cosmology", devanagari: "ब्राह्मी", subtitle: "Scripts · lineage · models", description: "Keeps textual lineage, interpretive models, scripts and empirically testable quantities as separate evidence layers.", capability: "reference", works: "Evidence-layer framework, Unicode script ranges", pending: "Sourced transliteration engine, cited textual lineage" },
  { slug: "developer", title: "API & developer portal", subtitle: "Endpoints · schemas · CLI", description: "The local endpoints and CLI that exist today, their schemas, and the live method registry.", capability: "implemented", works: "/api/time, /api/convert, /api/methods, hemant-shell CLI", pending: "Hosted API, SDKs (none exist)" },
  { slug: "learn", title: "Educational astronomy", subtitle: "Time scales · frames · evidence", description: "Short explanations of the time scales and position types the observatory distinguishes, with their sources.", capability: "reference", works: "Sourced explanations, links into the converter", pending: "Guided exercises" },
  { slug: "timeline", title: "Simulation timeline", subtitle: "Reference · definitional · computed", description: "Dated items with their evidence class. Only sourced or user-selected items are shown; computed events wait for a method.", capability: "partial", works: "Sourced and user-selected dated items with filters", pending: "Computed events, simulations" },
  { slug: "services", title: "Services", subtitle: "What runs today", description: "A catalogue of what exists locally and what is only planned, including the requested domains.", capability: "reference", works: "Local service inventory", pending: "Any hosted service or domain" },
  { slug: "research", title: "Methods & sources", subtitle: "Live method registry", description: "The registry served by the Rust core: every method's evidence class, inputs, time scale, units, uncertainty and limitations.", capability: "implemented", works: "Registry rendered from the Rust contract", pending: "Astronomy and Panchanga methods" },
  { slug: "mobile", title: "Mobile runtime", subtitle: "Field observation", description: "A field view that compares this device's clock with the Rust snapshot and states that agreement is not verification.", capability: "partial", works: "Device-vs-snapshot comparison, responsive layout", pending: "Offline observation logging" },
  { slug: "widgets", title: "Widget runtime", subtitle: "Small displays with provenance", description: "A compact clock widget that keeps source, age and verification in view.", capability: "partial", works: "Widget preview", pending: "Published embed package" },
  { slug: "modes", title: "Observatory modes", subtitle: "Scientific · learning · tradition", description: "Modes change how a result is explained, never the result or its evidence.", capability: "implemented", works: "Mode switcher over the live registry", pending: "—" },
  { slug: "planetary", title: "Planetary analytics", subtitle: "Bodies · frames · queries", description: "Supported body codes, frames and corrections for the first ephemeris increment, and a query builder that returns pending.", capability: "workspace-pending", works: "Query builder, body/frame reference", pending: "All coordinates and motion" },
  { slug: "ratios", title: "Universal ratio engine", subtitle: "Definitions before claims", description: "Draft a ratio definition with units and a falsifiable test. Nothing is accepted without a reproducible test.", capability: "workspace-pending", works: "Definition workspace and acceptance checklist", pending: "Accepted definitions (none)" },
];

export const capabilityLabel: Record<Capability, string> = {
  implemented: "Implemented",
  partial: "Partial",
  reference: "Reference",
  "workspace-pending": "Workspace · method pending",
};
