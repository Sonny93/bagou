export const CLEANUP_QUALITIES = ['standard', 'precise'] as const;

export type CleanupQuality = (typeof CLEANUP_QUALITIES)[number];
