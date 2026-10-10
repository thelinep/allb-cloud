import manifest from "../public/allb/manifest.json";

export type AllbLanding = (typeof manifest.items)[number];

export const allbLandings = manifest.items as AllbLanding[];
export const allbCategories = [...new Set(allbLandings.map((item) => item.category))];

export function getAllbLanding(slug: string) {
  return allbLandings.find((landing) => landing.slug === slug);
}
