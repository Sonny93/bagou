import app from '@adonisjs/core/services/app';

import type { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { TranscriptionProvider } from '#transcription/transcription_provider';

/**
 * Replaces the transcription port for one test and returns the function that
 * restores the real binding, meant for the test's `cleanup`.
 */
export function swapTranscriptionProvider(
	provider: FakeTranscriptionProvider
): () => void {
	app.container.swap(TranscriptionProvider, () => provider);
	return () => app.container.restore(TranscriptionProvider);
}
