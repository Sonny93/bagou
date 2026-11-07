import { tuyauClient } from '~/shared/lib/tuyau_client';

/** Asks the server to forget a correction; one that is already gone is fine. Rejects when the request fails. */
export async function requestDeleteCorrection(id: number): Promise<void> {
	await tuyauClient.request('corrections.delete_correction', {
		params: { id },
	});
}
