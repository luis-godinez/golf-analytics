export const SHOT_QUALITY_OPTIONS = ["", "GOOD", "BAD"] as const;
export type ShotQualityType = typeof SHOT_QUALITY_OPTIONS[number];

export const DEFAULT_SHOT_QUALITY_TYPE: ShotQualityType = "";