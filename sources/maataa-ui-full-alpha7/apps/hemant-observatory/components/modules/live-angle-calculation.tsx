"use client";

import { useEffect, useState } from "react";
import { Facts, Panel, ErrorNote, Pending } from "./shared";

type InstantResult = {
  sun: { longitudeDegrees: number; latitudeDegrees: number };
  moon: { longitudeDegrees: number; latitudeDegrees: number };
  calculation: { elongation_degrees: number; tithi_ordinal: number; paksha: string; karana_index: number; karana_name: string };
  evidence: { source: string; ephemeris: string; observer: string; frame: string; instantUtc: string; uncertainty: string };
  limitations: string[];
};

type SankrantiResult = { event: string; sign: string; instantUtc: string; computation: string; uncertainty: string; locationNote: string };

const sourceLinks = [
  ["JPL Horizons API", "https://ssd-api.jpl.nasa.gov/doc/horizons.html"],
  ["JPL observer-angle definitions", "https://ssd.jpl.nasa.gov/horizons/manual.html"],
  ["NAIF time conversions", "https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/time.html"],
  ["IERS time scales", "https://www.iers.org/iers/en/dataproducts/tools/webservices/webservice-time"],
  ["NTPv4 specification", "https://datatracker.ietf.org/doc/html/rfc5905"],
  ["Network Time Security", "https://datatracker.ietf.org/doc/html/rfc8915"],
  ["IMD Indian Astronomical Ephemeris", "https://mausam.imd.gov.in/hindinew/imd_latest/contents/indian_astronomical_ephemerishi.php"],
  ["IMD Rashtriya Panchang", "https://packolkata.imd.gov.in/panchang/en/explanation"],
] as const;

export function LiveAngleCalculation({ showSankranti = false }: { showSankranti?: boolean }) {
  const [utc, setUtc] = useState("");
  const [result, setResult] = useState<InstantResult | null>(null);
  const [sankranti, setSankranti] = useState<SankrantiResult | null>(null);
  const [ayanamsha, setAyanamsha] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setUtc(new Date().toISOString().slice(0, 19) + "Z"); }, []);

  async function calculate(path: string) {
    setBusy(true); setError("");
    try {
      const instant = new Date(utc);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(utc) || Number.isNaN(instant.getTime())) throw new Error("Enter an exact UTC instant ending in Z, for example 2026-10-10T00:00:00Z.");
      let query = `utc=${encodeURIComponent(utc)}`;
      if (path === "/api/sankranti/next") {
        const degrees = Number(ayanamsha);
        if (!ayanamsha.trim() || !Number.isFinite(degrees) || degrees < 0 || degrees >= 60) throw new Error("Enter the ayanamsha offset in degrees. No tradition default is assumed.");
        query = `after_utc=${encodeURIComponent(utc)}&ayanamsha_microdegrees=${Math.round(degrees * 1_000_000)}`;
      }
      const response = await fetch(`${path}?${query}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status}).`);
      if (path === "/api/sankranti/next") setSankranti(body as SankrantiResult);
      else setResult(body as InstantResult);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Calculation request failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="m-grid">
      <Panel eyebrow="LIVE EPHEMERIS QUERY · CLICK TO CALCULATE" title="Sun–Moon observation">
        <p className="m-note">Input time is UTC. The Worker asks JPL Horizons for geocentric apparent ecliptic angles, then Rust classifies the instant. No local sunrise or daily Panchanga assignment is implied.</p>
        <form className="m-form" onSubmit={(event) => { event.preventDefault(); void calculate("/api/panchanga/instant"); }}>
          <label>UTC instant<input value={utc} onChange={(event) => setUtc(event.target.value)} spellCheck={false} aria-describedby="utc-help" /></label>
          <p className="m-note" id="utc-help">ISO-8601 seconds, ending in Z. The initial value comes from this browser's clock and is unverified.</p>
          <button className="m-button" type="submit" disabled={busy}>{busy ? "Querying Horizons…" : "Calculate this instant"}</button>
        </form>
        {error && <ErrorNote error={error} />}
        {result && <>
          <Facts label="JPL angle result" rows={[
            ["Instant tithi", `#${result.calculation.tithi_ordinal} · ${result.calculation.paksha}`],
            ["Karana", `${result.calculation.karana_name} · index ${result.calculation.karana_index}`],
            ["Moon–Sun elongation", `${result.calculation.elongation_degrees.toFixed(6)}°`],
            ["Sun apparent longitude", `${result.sun.longitudeDegrees.toFixed(7)}°`],
            ["Moon apparent longitude", `${result.moon.longitudeDegrees.toFixed(7)}°`],
            ["Ephemeris", result.evidence.ephemeris],
            ["Evidence limits", result.evidence.uncertainty],
          ]} />
          <Pending>{result.limitations.join("; ")}</Pending>
        </>}
      </Panel>
      {showSankranti && <Panel eyebrow="METHOD-DEPENDENT EVENT SOLVER" title="Next sidereal sign ingress">
        <p className="m-note">Searches up to 370 days, then refines the solar-longitude crossing with one-minute JPL samples and Rust interpolation. A sidereal result requires an explicit numeric offset; it is not a named ayanamsha or a certified regional Panchanga time.</p>
        <form className="m-form" onSubmit={(event) => { event.preventDefault(); void calculate("/api/sankranti/next"); }}>
          <label>Ayanamsha offset in degrees<input type="number" min="0" max="59.999999" step="0.000001" value={ayanamsha} onChange={(event) => setAyanamsha(event.target.value)} placeholder="Required; no default" /></label>
          <button className="m-button" type="submit" disabled={busy}>{busy ? "Searching JPL ephemeris…" : "Find next crossing"}</button>
        </form>
        {sankranti && <Facts label="Calculated sign ingress" rows={[
          ["Event", `${sankranti.event} · ${sankranti.sign}`], ["Instant", sankranti.instantUtc],
          ["Computation", sankranti.computation], ["Uncertainty", sankranti.uncertainty], ["Local observance", sankranti.locationNote],
        ]} />}
      </Panel>}
      <Panel eyebrow="PRIMARY SCIENTIFIC REFERENCES" title="Methods and time standards">
        <ul className="m-list">{sourceLinks.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul>
      </Panel>
    </div>
  );
}
