import type { ApplicationService } from '@adonisjs/core/types';

import env from '#start/env';
import { createMistralTranscriptionProvider } from '#transcription/providers/mistral/create_mistral_transcription_provider';
import { TranscriptionProvider } from '#transcription/transcription_provider';

/**
 * Binds the transcription port to its single adapter. Swapping provider means
 * changing this one binding; nothing else in the app knows the adapter.
 */
export default class TranscriptionAppProvider {
	constructor(protected app: ApplicationService) {}

	register(): void {
		this.app.container.singleton(TranscriptionProvider, () =>
			createMistralTranscriptionProvider(env.get('MISTRAL_API_KEY'))
		);
	}
}
