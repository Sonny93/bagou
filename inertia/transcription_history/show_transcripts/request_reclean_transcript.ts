import type { CleanupQuality } from '~/shared/cleanup_quality';
import { tuyauClient } from '~/shared/lib/tuyau_client';

type RecleanTranscriptRequest = {
	transcriptId: number;
	cleanupQuality: CleanupQuality;
	signal: AbortSignal;
	timeoutMs: number;
};

/** Asks the server to clean the raw text of a history entry again with the given quality; nothing is stored. Rejects when the request fails. */
export async function requestRecleanTranscript({
	transcriptId,
	cleanupQuality,
	signal,
	timeoutMs,
}: Readonly<RecleanTranscriptRequest>): Promise<string> {
	const { cleanedText } = await tuyauClient.request(
		'transcription_history.reclean_transcript',
		{
			params: { id: transcriptId },
			body: { cleanupQuality },
			signal,
			timeout: timeoutMs,
		}
	);
	return cleanedText;
}
