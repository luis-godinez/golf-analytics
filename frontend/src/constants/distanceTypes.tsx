export const DISTANCE_TYPE_OPTIONS = ["Carry", "Total"] as const;
export type DistanceType = typeof DISTANCE_TYPE_OPTIONS[number];
export const DEFAULT_DISTANCE_TYPE: DistanceType = "Carry";