import type { PreviewSettings } from '~/dictation/core/dictation_start_request';
import { tuyauClient } from '~/shared/lib/tuyau_client';

type PreviewCleanupRequest = {
	text: string;
	settings: Readonly<PreviewSettings>;
};

/** Cleans a sample text with the given settings, which the server does not save. */
export async function requestPreviewCleanup({
	text,
	settings,
}: Readonly<PreviewCleanupRequest>): Promise<string> {
	const { cleanedText } = await tuyauClient.request(
		'user_settings.preview_cleanup',
		{
			body: {
				text,
				dictationLanguage: settings.dictationLanguage,
				vocabulary: [...settings.vocabulary],
				cleanupInstructions: settings.cleanupInstructions,
			},
		}
	);
	return cleanedText;
}
