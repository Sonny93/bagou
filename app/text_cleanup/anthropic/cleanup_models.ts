import type { CleanupQuality } from '#text_cleanup/cleanup_quality';

export const CLEANUP_MODELS = {
	standard: { modelId: 'claude-haiku-5-5', displayName: 'Claude Haiku 5.5' },
	precise: { modelId: 'claude-sonnet-5-5', displayName: 'Claude Sonnet 5.5' },
} as const satisfies Record<
	CleanupQuality,
	{ modelId: string; displayName: string }
>;
