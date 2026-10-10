import type { TlpsDraft } from "../tlps/src/types";

export const TLPS_FILM_HANDOFF_KEY = "maataa.tlps-film.handoff.v1";
export const TLPS_FILM_PREVIOUS_PROJECT_KEY = "maataa.tlps-film.previous-project.v1";

export interface TlpsFilmHandoff {
  version: 1;
  createdAt: string;
  project: {
    title: string;
    type: string;
    city: string;
    shootDate: string;
    budgetCeiling: number;
  };
  estimatedBudget: number;
  budgetLines: number;
  crewResponsibilities: number;
  locations: string[];
  callSheetEntries: Array<{ time: string; scene: string }>;
  scope: "local-demo-only";
}

export function createTlpsFilmHandoff(draft: TlpsDraft): TlpsFilmHandoff {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    project: {
      title: draft.project.title.trim().slice(0, 120),
      type: draft.project.productionType,
      city: draft.project.city.trim().slice(0, 120),
      shootDate: draft.project.shootDate,
      budgetCeiling: draft.project.ceiling,
    },
    estimatedBudget: draft.budget.reduce(
      (sum, line) => sum + line.quantity * line.rate,
      0,
    ),
    budgetLines: draft.budget.length,
    crewResponsibilities: draft.crew.length,
    locations: draft.locations.map((item) => item.name.slice(0, 120)).slice(0, 50),
    callSheetEntries: draft.schedule
      .map(({ time, scene }) => ({ time, scene: scene.slice(0, 200) }))
      .slice(0, 100),
    scope: "local-demo-only",
  };
}

export function parseTlpsFilmHandoff(raw: string | null): TlpsFilmHandoff | null {
  if (!raw || raw.length > 50_000) return null;
  try {
    const value = JSON.parse(raw) as Partial<TlpsFilmHandoff>;
    const project = value.project;
    if (
      value.version !== 1 ||
      value.scope !== "local-demo-only" ||
      !project ||
      typeof project.title !== "string" ||
      !project.title.trim() ||
      typeof project.type !== "string" ||
      typeof project.city !== "string" ||
      typeof project.shootDate !== "string"
    ) return null;
    return {
      version: 1,
      createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
      project: {
        title: project.title.slice(0, 120),
        type: project.type.slice(0, 80),
        city: project.city.slice(0, 120),
        shootDate: project.shootDate.slice(0, 10),
        budgetCeiling: Number.isSafeInteger(project.budgetCeiling) ? Math.max(0, project.budgetCeiling!) : 0,
      },
      estimatedBudget: Number.isSafeInteger(value.estimatedBudget) ? Math.max(0, value.estimatedBudget!) : 0,
      budgetLines: Number.isSafeInteger(value.budgetLines) ? Math.max(0, value.budgetLines!) : 0,
      crewResponsibilities: Number.isSafeInteger(value.crewResponsibilities) ? Math.max(0, value.crewResponsibilities!) : 0,
      locations: Array.isArray(value.locations)
        ? value.locations.filter((item): item is string => typeof item === "string").slice(0, 50)
        : [],
      callSheetEntries: Array.isArray(value.callSheetEntries)
        ? value.callSheetEntries.flatMap((item) =>
            item && typeof item.time === "string" && typeof item.scene === "string"
              ? [{ time: item.time.slice(0, 5), scene: item.scene.slice(0, 200) }]
              : [],
          ).slice(0, 100)
        : [],
      scope: "local-demo-only",
    };
  } catch {
    return null;
  }
}
