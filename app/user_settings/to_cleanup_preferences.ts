import type { CorrectionPair } from '#corrections/correction_pair';
import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import type { PreviewSettings } from '#user_settings/preview_settings';

export function toCleanupPreferences(
	{
		dictationLanguage,
		vocabulary,
		cleanupQuality,
		cleanupInstructions,
	}: Readonly<PreviewSettings>,
	corrections: readonly CorrectionPair[]
): CleanupPreferences {
	return {
		language: dictationLanguage,
		vocabulary,
		instructions: cleanupInstructions,
		quality: cleanupQuality,
		corrections,
	};
}
