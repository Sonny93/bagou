import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { tuyauClient } from '~/shared/lib/tuyau_client';

/** Tells the server the user does not want these corrections suggested again. Rejects when the request fails. */
export async function requestDismissSuggestions(
	pairs: readonly CorrectionPair[]
): Promise<void> {
	await tuyauClient.request('correction_suggestions.dismiss_suggestions', {
		body: { pairs: pairs.map(({ heard, written }) => ({ heard, written })) },
	});
}
