import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import type { UserSettings } from '#user_settings/user_settings';

export function toCleanupPreferences({
	dictationLanguage,
	vocabulary,
	cleanupInstructions,
}: Readonly<UserSettings>): CleanupPreferences {
	return {
		language: dictationLanguage,
		vocabulary,
		instructions: cleanupInstructions,
	};
}
