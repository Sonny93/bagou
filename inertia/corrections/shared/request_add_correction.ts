import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { tuyauClient } from '~/shared/lib/tuyau_client';

/** Asks the server to remember a correction; adding a pair that exists is harmless. Rejects when the request fails. */
export async function requestAddCorrection({
	heard,
	written,
}: Readonly<CorrectionPair>): Promise<void> {
	await tuyauClient.request('corrections.add_correction', {
		body: { heard, written },
	});
}
