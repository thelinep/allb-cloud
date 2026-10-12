/**
 * @maataa/ui/tokens
 * Design system tokens for consistent styling
 */

// Color tokens
//
// Aligned to DESIGN_SYSTEM.md's documented "paper-and-ink" warm palette
// (MUI-01 follow-up, Sept 2026). Previously this file used an unrelated
// cool-gray palette (#1a1a1a / #ffffff / #f5f5f5) that only 11 of 20
// components ever adopted; the other 9 (including the four foundational
// primitives Badge/Button/Card/Input) hardcoded the warm palette from
// DESIGN_SYSTEM.md directly instead. Consolidating onto the warm palette
// here — rather than the other way around — keeps the documented design
// system, the majority of hardcoded values already in the codebase, and
// the one color already shared by both (`interactive.primary`) consistent
// in one place. `interactive.primary`/`secondary` are unchanged from
// before since they already matched.
export const colorTokens = {
  // Text colors
  text: {
    primary: "#3D2817",
    secondary: "#A0826D",
    tertiary: "#B39A82",
    inverse: "#FFFAF0",
    disabled: "#C9B8A8",
  },

  // Background colors
  background: {
    primary: "#FFFAF0",
    secondary: "#FAF6F1",
    tertiary: "#F5EDE4",
    inverse: "#3D2817",
  },

  // Border colors
  border: {
    primary: "#D4AF9F",
    secondary: "#EDD8CF",
    tertiary: "#F5E9E1",
  },

  // Interactive colors
  // The success/warning/error/info values here are the "Dark" variants
  // from DESIGN_SYSTEM.md's semantic palette — legible as text, icons, and
  // borders on the light paper background. For a soft filled badge/toast
  // background + matching text pair, use `colorTokens.semantic` instead.
  interactive: {
    primary: "#8B6F47",
    secondary: "#D4AF9F",
    success: "#2D6A3E",
    warning: "#7A6100",
    error: "#8B3A2B",
    info: "#1E3A5F",
  },

  // Soft semantic fills: a pale background paired with its matching dark
  // text color, both from DESIGN_SYSTEM.md, for badges/toasts/alerts.
  semantic: {
    success: { bg: "#C7E9C0", text: "#2D6A3E" },
    warning: { bg: "#F5D547", text: "#7A6100" },
    error: { bg: "#F5B5A6", text: "#8B3A2B" },
    info: { bg: "#B8D9F5", text: "#1E3A5F" },
  },

  // Shadow colors (warm-tinted, matching DESIGN_SYSTEM.md)
  shadow: {
    sm: "0 2px 8px rgba(139, 111, 71, 0.08)",
    md: "0 4px 12px rgba(139, 111, 71, 0.15)",
    lg: "0 8px 24px rgba(139, 111, 71, 0.12)",
    xl: "0 20px 48px rgba(139, 111, 71, 0.24)",
  },
};

// Dark theme color tokens — "night ops" palette
//
// Extracted from the MAATAA Desktop application itself (Sept 2026): its
// screenshots were sampled pixel-by-pixel (whole-image color-frequency and
// hue-bucket analysis, not eyeballed) to pull out the actual near-black
// navy base, the brand gold, and the per-workspace accent hues (blue/info,
// green/success, amber/warning, red/error) it already ships with. This is
// the first dark theme in the system — `colorTokens` above stays the
// default/light "paper-and-ink" palette; `darkColorTokens` is a same-shape
// sibling for anything that opts in via `ThemeProvider`/`useTheme` (see
// `src/themes/`). Existing components that import `colorTokens` directly
// are unaffected until they're migrated to read from theme context.
export const darkColorTokens = {
  text: {
    primary: "#F4F6F8",
    secondary: "#7C8A96",
    tertiary: "#54626D",
    inverse: "#0B1622",
    disabled: "#3A4550",
  },

  background: {
    primary: "#04080E",
    secondary: "#0B1420",
    tertiary: "#152030",
    inverse: "#F4F6F8",
  },

  border: {
    primary: "#2A3D4B",
    secondary: "#1B2833",
    tertiary: "#121C27",
  },

  interactive: {
    primary: "#E0B060",
    secondary: "#2070B0",
    success: "#5DD35A",
    warning: "#E8A23C",
    error: "#F03830",
    info: "#3C8FD0",
  },

  // Soft filled badge/toast backgrounds: a low-opacity tint of the
  // interactive color over the dark surface (a pale flat tint, as the
  // light theme uses, would either wash out or blind against near-black),
  // paired with the same bright interactive color as the text/icon.
  semantic: {
    success: { bg: "rgba(93, 211, 90, 0.16)", text: "#5DD35A" },
    warning: { bg: "rgba(232, 162, 60, 0.16)", text: "#E8A23C" },
    error: { bg: "rgba(240, 56, 48, 0.16)", text: "#F03830" },
    info: { bg: "rgba(60, 143, 208, 0.16)", text: "#3C8FD0" },
  },

  shadow: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.40)",
    md: "0 4px 16px rgba(0, 0, 0, 0.50)",
    lg: "0 8px 28px rgba(0, 0, 0, 0.55)",
    xl: "0 24px 56px rgba(0, 0, 0, 0.60)",
  },
};

// Spacing tokens (4px base unit)
export const spacingTokens = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "40px",
  "3xl": "48px",
  "4xl": "56px",
};

// Border radius tokens
export const radiusTokens = {
  none: "0",
  sm: "2px",
  md: "6px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
};

// Typography tokens
export const typographyTokens = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  fontSize: {
    xs: "12px",
    sm: "13px",
    md: "14px",
    lg: "15px",
    xl: "16px",
    "2xl": "18px",
    "3xl": "20px",
    "4xl": "24px",
    "5xl": "32px",
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Transition/Animation tokens
export const transitionTokens = {
  fast: "0.1s ease-out",
  base: "0.2s ease-out",
  slow: "0.3s ease-out",
};

// Data visualization tokens (MUI-07 start)
//
// Chart series need real hue diversity to encode identity, which the
// paper-and-ink UI palette above doesn't provide (it's tuned for chrome,
// not for 6-8 mutually-distinguishable series) — reusing it validates with
// hard FAILs (lightness band, chroma floor, and CVD separation all fail).
// `categorical` below is a color-vision-deficiency-safe categorical order,
// validated on this system's paper background (#FFFAF0): every adjacent
// pair clears the CVD Delta E >= 8 target and the >= 15 normal-vision floor;
// three slots (aqua/yellow/magenta) sit under 3:1 contrast on our light
// surface and so are used only with a direct label or legend swatch, never
// as unlabeled text or a lone color-only fill. The order is the safety
// mechanism — never reorder or cycle past 8 without re-running the
// palette's validator. Single-series charts (Sparkline, a lone metric
// trend) use `chartTokens.single` instead — the system's own brand color —
// since there's nothing for a single series to be confused with.
export const chartTokens = {
  single: "#8B6F47",
  categorical: [
    "#2a78d6", // 1 blue
    "#eb6834", // 2 orange
    "#1baf7a", // 3 aqua
    "#eda100", // 4 yellow
    "#e87ba4", // 5 magenta
    "#008300", // 6 green
    "#4a3aa7", // 7 violet
    "#e34948", // 8 red
  ],
  // Sequential ramp (single hue, light -> dark), for future magnitude
  // encoding (heatmaps, choropleths). Lightest step reads as "near zero".
  sequential: ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"],
  grid: colorTokens.border.secondary,
  areaOpacity: 0.1,
};

// Data visualization tokens for the dark theme.
//
// Reuses the dataviz skill's documented dark-mode categorical steps
// (`references/palette.md`) rather than hand-picking new hues — they're
// the *same eight hues* as `chartTokens.categorical` above, re-stepped for
// a dark surface, so a chart keeps its series identity across a theme
// switch. Re-validated with the skill's `validate_palette.js` against this
// system's actual dark surface (`darkColorTokens.background.primary`,
// `#04080E` — notably darker than the skill's own `#1a1a19` reference):
// all checks pass (lightness band, chroma floor, CVD separation >= 8 ΔE
// on every adjacent pair, normal-vision floor, and >= 3:1 contrast on
// all 8 slots). The sequential ramp is the same blue ramp read in
// reverse (dark = near-zero/recedes into the surface, light = high
// magnitude/stands out) and capped at step 600 (`#184f95`) per the
// skill's guidance not to go darker on a dark surface, where the next
// step down (`#0d366b`) would sit under 2:1 and disappear into `#04080E`.
export const darkChartTokens = {
  single: darkColorTokens.interactive.primary,
  categorical: [
    "#3987e5", // 1 blue
    "#d95926", // 2 orange
    "#199e70", // 3 aqua
    "#c98500", // 4 yellow
    "#d55181", // 5 magenta
    "#008300", // 6 green
    "#9085e9", // 7 violet
    "#e66767", // 8 red
  ],
  sequential: ["#184f95", "#256abf", "#3987e5", "#6da7ec", "#9ec5f4", "#cde2fb"],
  grid: darkColorTokens.border.secondary,
  areaOpacity: 0.12,
};
