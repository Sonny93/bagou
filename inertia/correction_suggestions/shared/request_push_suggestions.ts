import type { PendingSuggestion } from '~/correction_suggestions/shared/pending_suggestion';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { tuyauClient } from '~/shared/lib/tuyau_client';

type PushSuggestionsRequest = {
	draftId: string;
	pairs: readonly CorrectionPair[];
	isPageLeaving?: boolean;
};

/**
 * Hands the corrections found in a draft to the server and resolves to all the
 * suggestions it now holds, newest first. `isPageLeaving` lets the request
 * outlive the page. Rejects when the request fails.
 */
export async function requestPushSuggestions({
	draftId,
	pairs,
	isPageLeaving = false,
}: Readonly<PushSuggestionsRequest>): Promise<readonly PendingSuggestion[]> {
	const response = await tuyauClient.request(
		'correction_suggestions.push_suggestions',
		{
			body: {
				draftId,
				pairs: pairs.map(({ heard, written }) => ({ heard, written })),
			},
			keepalive: isPageLeaving,
		}
	);
	return response.pending;
}
