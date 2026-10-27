import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import type { PreviewSettings } from '#user_settings/preview_settings';

export function toCleanupPreferences({
	dictationLanguage,
	vocabulary,
	cleanupInstructions,
}: Readonly<PreviewSettings>): CleanupPreferences {
	return {
		language: dictationLanguage,
		vocabulary,
		instructions: cleanupInstructions,
	};
}
