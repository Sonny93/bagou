import { tuyauClient } from '~/shared/lib/tuyau_client';

export async function cleanDictationText(text: string): Promise<string> {
	const response = await tuyauClient.request('text_cleanup.clean_text', {
		body: { text },
	});
	return response.text;
}
