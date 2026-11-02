import type { CleanupQuality } from '~/shared/cleanup_quality';
import { tuyauClient } from '~/shared/lib/tuyau_client';

type DraftCleanupRequest = {
	draftId: string;
	text: string;
	cleanupQuality?: CleanupQuality;
	signal: AbortSignal;
	timeoutMs: number;
};

/** Asks the server to clean a whole draft, with the given quality instead of the saved one when there is one. Rejects when the request fails. */
export async function requestDraftCleanup({
	draftId,
	text,
	cleanupQuality,
	signal,
	timeoutMs,
}: Readonly<DraftCleanupRequest>): Promise<string> {
	const { cleanedText } = await tuyauClient.request(
		'transcription_history.clean_draft',
		{
			params: { draftId },
			body: cleanupQuality === undefined ? { text } : { text, cleanupQuality },
			signal,
			timeout: timeoutMs,
		}
	);
	return cleanedText;
}
