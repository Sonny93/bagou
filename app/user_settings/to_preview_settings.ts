import type { PreviewSettings } from '#user_settings/preview_settings';

type ValidatedPreviewSettings = Omit<PreviewSettings, 'cleanupInstructions'> & {
	readonly cleanupInstructions: string | null;
};

/** Empty instructions reach the validator as `null`; the rest of the app reads an empty string. */
export function toPreviewSettings({
	dictationLanguage,
	vocabulary,
	cleanupInstructions,
}: Readonly<ValidatedPreviewSettings>): PreviewSettings {
	return {
		dictationLanguage,
		vocabulary,
		cleanupInstructions: cleanupInstructions ?? '',
	};
}
