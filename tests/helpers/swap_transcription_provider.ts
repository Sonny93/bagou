import app from '@adonisjs/core/services/app';

import { TranscriptionProvider } from '#transcription/transcription_provider';

/**
 * Replaces the transcription port for one test and returns the function that
 * restores the real binding, meant for the test's `cleanup`.
 */
export function swapTranscriptionProvider(
	provider: TranscriptionProvider
): () => void {
	app.container.swap(TranscriptionProvider, () => provider);
	return () => app.container.restore(TranscriptionProvider);
}
