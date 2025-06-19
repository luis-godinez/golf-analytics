export const CLUB_TYPE_ORDER = [
  "Lob Wedge",
  "Sand Wedge",
  "Gap Wedge",
  "Pitching Wedge",
  "9 Iron",
  "8 Iron",
  "7 Iron",
  "6 Iron",
  "5 Iron",
  "4 Iron",
  "3 Iron",
  "2 Iron",
  "1 Iron",
  "4 Hybrid",
  "3 Hybrid",
  "2 Hybrid",
  "9 Wood",
  "7 Wood",
  "5 Wood",
  "3 Wood",
  "Driver"
];

const colorPalette = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  "#393b79", "#637939", "#8c6d31", "#843c39", "#7b4173",
  "#3182bd", "#f33f3f", "#31a354", "#756bb1", "#636363",
  "#ffbb78", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5"
];

export const CLUB_TYPE_COLORS: Record<string, string> = CLUB_TYPE_ORDER.reduce<Record<string, string>>((acc, club, idx) => {
  acc[club] = colorPalette[idx % colorPalette.length];
  return acc;
}, {});