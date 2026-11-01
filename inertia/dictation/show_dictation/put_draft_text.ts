import { tuyauClient } from '~/shared/lib/tuyau_client';

const SAVE_TIMEOUT_MS = 10_000;

export type DraftText = {
	draftId: string;
	text: string;
};

type PutDraftTextOptions = {
	isKeptAliveOnPageExit: boolean;
};

/**
 * Stores the draft text in the history entry of its draft and resolves to
 * whether an entry was updated (false when no segment of the draft was
 * dictated yet). Rejects when the request fails, or, except when kept alive on
 * page exit, when it takes longer than `SAVE_TIMEOUT_MS`.
 */
export async function putDraftText(
	{ draftId, text }: Readonly<DraftText>,
	{ isKeptAliveOnPageExit }: Readonly<PutDraftTextOptions>
): Promise<boolean> {
	const { isStored } = await tuyauClient.request(
		'transcription_history.save_draft_text',
		{
			params: { draftId },
			body: { text },
			keepalive: isKeptAliveOnPageExit,
			signal: isKeptAliveOnPageExit
				? undefined
				: AbortSignal.timeout(SAVE_TIMEOUT_MS),
		}
	);
	return isStored;
}
