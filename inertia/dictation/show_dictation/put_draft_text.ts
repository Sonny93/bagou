import { tuyauClient } from '~/shared/lib/tuyau_client';

export type DraftText = {
	draftId: string;
	text: string;
};

type PutDraftTextOptions = {
	isKeptAliveOnPageExit: boolean;
};

/** Stores the draft text in the history entry of its draft. Rejects when the request fails. */
export async function putDraftText(
	{ draftId, text }: Readonly<DraftText>,
	{ isKeptAliveOnPageExit }: Readonly<PutDraftTextOptions>
): Promise<void> {
	await tuyauClient.request('transcription_history.save_draft_text', {
		params: { draftId },
		body: { text },
		keepalive: isKeptAliveOnPageExit,
	});
}
