import type { DictationLanguage } from '#shared/dictation_language';
import type { CleanupQuality } from '#text_cleanup/cleanup_quality';
import type { InterfaceLanguage } from '#user_settings/interface_language';

export type UserSettings = {
	readonly dictationLanguage: DictationLanguage;
	readonly interfaceLanguage: InterfaceLanguage;
	readonly vocabulary: readonly string[];
	readonly cleanupQuality: CleanupQuality;
	readonly cleanupInstructions: string;
};
