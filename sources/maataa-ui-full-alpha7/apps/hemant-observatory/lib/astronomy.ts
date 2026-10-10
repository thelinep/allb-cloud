// Mirrors crates/hemant-core/src/astronomy.rs (NAIF integer body codes).
// Plain data module so both server and client components can import it.
export const bodies = [
  { code: 0, name: "Solar-system barycenter" },
  { code: 10, name: "Sun" },
  { code: 301, name: "Moon" },
  { code: 399, name: "Earth" },
] as const;
