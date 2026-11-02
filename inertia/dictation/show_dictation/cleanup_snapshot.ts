import type { CleanupQuality } from '~/shared/cleanup_quality';

/** The last manual re-clean of a draft: the input it started from and what it produced. */
export type CleanupSnapshot = {
	draftId: string;
	originalText: string;
	cleanedText: string;
	quality: CleanupQuality;
};
