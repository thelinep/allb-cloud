export const HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api";

export type ApparentLongitude = {
  target: "Sun" | "Moon";
  longitudeDegrees: number;
  latitudeDegrees: number;
  timeUtc: string;
  timescale: "UT";
  center: "Geocenter (Earth)";
  frame: "IAU 1976/80 apparent ecliptic and equinox of date";
  source: "NASA/JPL Horizons";
  ephemerisIdentity: string;
  earthOrientation: string | null;
  rawHeader: string;
};

export type LongitudeSample = { timeUtc: string; longitudeDegrees: number };

function csvFields(line: string): string[] {
  const result: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { result.push(field.trim()); field = ""; }
    else field += char;
  }
  result.push(field.trim());
  return result;
}

function tableColumns(resultText: string): { lonIndex: number; latIndex: number } | null {
  const start = resultText.indexOf("$$SOE");
  if (start < 0) return null;
  const header = resultText.slice(0, start).split(/\r?\n/).filter((line) => line.includes("ObsEcLon")).at(-1);
  if (!header) return null;
  const headers = csvFields(header);
  const lonIndex = headers.findIndex((column) => column.includes("ObsEcLon"));
  const latIndex = headers.findIndex((column) => column.includes("ObsEcLat"));
  return lonIndex >= 0 && latIndex >= 0 ? { lonIndex, latIndex } : null;
}

function rowTime(value: string): string | null {
  const match = /^(\d{4})-([A-Z][a-z]{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(match[2]);
  if (month < 0) return null;
  return `${match[1]}-${String(month + 1).padStart(2, "0")}-${match[3]}T${match[4]}:${match[5]}:${match[6] ?? "00"}Z`;
}

export function parseHorizonsLongitudeSeries(resultText: string): LongitudeSample[] | null {
  const start = resultText.indexOf("$$SOE");
  const end = resultText.indexOf("$$EOE", start + 5);
  const columns = tableColumns(resultText);
  if (start < 0 || end < 0 || !columns) return null;
  const samples = resultText.slice(start + 5, end).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const fields = csvFields(line);
    const timeUtc = rowTime(fields[0] ?? "");
    const longitudeDegrees = Number(fields[columns.lonIndex]);
    if (!timeUtc || !Number.isFinite(longitudeDegrees) || longitudeDegrees < 0 || longitudeDegrees >= 360) return null;
    return { timeUtc, longitudeDegrees };
  });
  if (!samples.length || samples.some((sample) => sample === null)) return null;
  return samples as LongitudeSample[];
}

export function parseHorizonsObserverCsv(resultText: string, target: "Sun" | "Moon"): ApparentLongitude | null {
  const start = resultText.indexOf("$$SOE");
  const end = resultText.indexOf("$$EOE", start + 5);
  if (start < 0 || end < 0) return null;
  const before = resultText.slice(0, start).split(/\r?\n/).filter((line) => line.includes("ObsEcLon"));
  const headers = before.length ? csvFields(before[before.length - 1]) : [];
  const lonIndex = headers.findIndex((column) => column.includes("ObsEcLon"));
  const latIndex = headers.findIndex((column) => column.includes("ObsEcLat"));
  if (lonIndex < 0 || latIndex < 0) return null;
  const rows = resultText.slice(start + 5, end).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!rows.length) return null;
  const fields = csvFields(rows[0]);
  const longitudeDegrees = Number(fields[lonIndex]);
  const latitudeDegrees = Number(fields[latIndex]);
  const timeUtc = fields[0];
  if (!Number.isFinite(longitudeDegrees) || longitudeDegrees < 0 || longitudeDegrees >= 360 || !Number.isFinite(latitudeDegrees) || !timeUtc) return null;
  return {
    target,
    longitudeDegrees,
    latitudeDegrees,
    timeUtc,
    timescale: "UT",
    center: "Geocenter (Earth)",
    frame: "IAU 1976/80 apparent ecliptic and equinox of date",
    source: "NASA/JPL Horizons",
    ephemerisIdentity: resultText.slice(0, start).match(/\{source:\s*([^}\s]+)\}/i)?.[1] ?? "not stated in provider header",
    earthOrientation: resultText.slice(0, start).split(/\r?\n/).filter((line) => /^(\s*EOP file|\s*EOP coverage|\s*PREDICTS->)/i.test(line.trim())).map((line) => line.trim()).join("; ") || null,
    rawHeader: resultText.slice(0, start).slice(-5000),
  };
}

export async function fetchHorizonsLongitude(target: "10" | "301", atUtc: string, signal: AbortSignal): Promise<ApparentLongitude> {
  const url = new URL(HORIZONS_API);
  for (const [key, value] of Object.entries({
    format: "json",
    COMMAND: `'${target}'`,
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'500@399'",
    START_TIME: `'${atUtc}'`,
    STOP_TIME: `'${new Date(Date.parse(atUtc) + 60_000).toISOString().replace("T", " ").replace(".000Z", "")}'`,
    STEP_SIZE: "'1 m'",
    QUANTITIES: "'31'",
    TIME_TYPE: "'UT'",
    CSV_FORMAT: "'YES'",
    ANG_FORMAT: "'DEG'",
  })) url.searchParams.set(key, value);
  const response = await fetch(url, { signal, cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Horizons upstream HTTP ${response.status}`);
  const envelope = await response.json() as { error?: string; result?: string; signature?: { source?: string } };
  if (envelope.error || typeof envelope.result !== "string" || envelope.signature?.source !== "NASA/JPL Horizons API") {
    throw new Error("Horizons response did not match the expected provider contract");
  }
  const parsed = parseHorizonsObserverCsv(envelope.result, target === "10" ? "Sun" : "Moon");
  if (!parsed) throw new Error("Horizons observer table did not contain one valid longitude row");
  return parsed;
}

export async function fetchHorizonsLongitudeSeries(startUtc: string, stopUtc: string, step: "1 d" | "1 m", signal: AbortSignal): Promise<{ samples: LongitudeSample[]; rawHeader: string }> {
  const url = new URL(HORIZONS_API);
  for (const [key, value] of Object.entries({
    format: "json", COMMAND: "'10'", MAKE_EPHEM: "'YES'", EPHEM_TYPE: "'OBSERVER'", CENTER: "'500@399'",
    START_TIME: `'${startUtc}'`, STOP_TIME: `'${stopUtc}'`, STEP_SIZE: `'${step}'`, QUANTITIES: "'31'",
    TIME_TYPE: "'UT'", CSV_FORMAT: "'YES'", ANG_FORMAT: "'DEG'",
  })) url.searchParams.set(key, value);
  const response = await fetch(url, { signal, cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Horizons upstream HTTP ${response.status}`);
  const envelope = await response.json() as { error?: string; result?: string; signature?: { source?: string } };
  if (envelope.error || typeof envelope.result !== "string" || envelope.signature?.source !== "NASA/JPL Horizons API") throw new Error("Horizons response did not match the expected provider contract");
  const samples = parseHorizonsLongitudeSeries(envelope.result);
  if (!samples) throw new Error("Horizons series did not contain a valid apparent longitude table");
  return { samples, rawHeader: envelope.result.slice(0, envelope.result.indexOf("$$SOE")).slice(-5000) };
}

export function parseUtcInstant(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return null;
  const millis = Date.parse(value);
  return Number.isFinite(millis) && new Date(millis).toISOString().slice(0, 19) + "Z" === value ? value : null;
}
