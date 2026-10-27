import type { DictationLanguage } from '#shared/dictation_language';

export type CleanupPreferences = {
	language: DictationLanguage;
	vocabulary: readonly string[];
	instructions: string;
};
