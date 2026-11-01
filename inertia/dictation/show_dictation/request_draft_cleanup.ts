import { tuyauClient } from '~/shared/lib/tuyau_client';

type DraftCleanupRequest = {
	draftId: string;
	text: string;
	signal: AbortSignal;
	timeoutMs: number;
};

/** Asks the server to clean a whole draft. Rejects when the request fails. */
export async function requestDraftCleanup({
	draftId,
	text,
	signal,
	timeoutMs,
}: Readonly<DraftCleanupRequest>): Promise<string> {
	const { cleanedText } = await tuyauClient.request(
		'transcription_history.clean_draft',
		{ params: { draftId }, body: { text }, signal, timeout: timeoutMs }
	);
	return cleanedText;
}
