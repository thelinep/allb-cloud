export const themeFamilies = [
  "sovereign", "evidence", "observatory", "lipi", "finance", "production",
  "events", "research", "legal", "edge", "accessibility"
] as const;

export type ThemeFamily = typeof themeFamilies[number];
export interface MaataaTheme { id: string; label: string; family: ThemeFamily; mode: "dark" | "light"; }

const counts: Record<ThemeFamily, number> = {
  sovereign: 8, evidence: 6, observatory: 6, lipi: 6, finance: 6,
  production: 6, events: 6, research: 6, legal: 6, edge: 6, accessibility: 6
};

export const themes: MaataaTheme[] = themeFamilies.flatMap((family) =>
  Array.from({ length: counts[family] }, (_, index) => ({
    id: `${family}-${index + 1}`,
    label: `${family[0]?.toUpperCase()}${family.slice(1)} ${index + 1}`,
    family,
    mode: index % 3 === 2 ? "light" : "dark"
  }))
);

if (themes.length !== 68) throw new Error(`Theme registry contract violated: ${themes.length}/68`);
