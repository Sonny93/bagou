import type { CorrectionPair } from '#corrections/correction_pair';
import type { DictationLanguage } from '#shared/dictation_language';
import type { CleanupQuality } from '#text_cleanup/cleanup_quality';

export type CleanupPreferences = {
	language: DictationLanguage;
	vocabulary: readonly string[];
	instructions: string;
	quality: CleanupQuality;
	/** Newest first. */
	corrections: readonly CorrectionPair[];
};
