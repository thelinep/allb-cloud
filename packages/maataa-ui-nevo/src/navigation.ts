import type { NavItem } from "./contracts.js";

export const canonicalNavigation: readonly NavItem[] = [
  ["home", "Home"], ["workspaces", "Workspaces"], ["products", "Products"],
  ["runtimes", "Runtimes"], ["workflows", "Workflows"], ["knowledge", "Knowledge"],
  ["evidence", "Evidence"], ["lipi", "Lipi"], ["people", "People"],
  ["assets", "Assets"], ["tasks", "Tasks"], ["communications", "Communications"],
  ["observatory", "Observatory"], ["reports", "Reports"], ["settings", "Settings"]
].map(([id, label]) => ({ id: id!, label: label!, href: `/${id}` }));
