import type { ApplicationService } from '@adonisjs/core/types';

import env from '#start/env';
import { createNodeRealtimeSocket } from '#transcription/providers/mistral/create_node_realtime_socket';
import { MistralTranscriptionProvider } from '#transcription/providers/mistral/mistral_transcription_provider';
import { TranscriptionProvider } from '#transcription/transcription_provider';

/**
 * Binds the transcription port to its single adapter. Swapping provider means
 * changing this one binding; nothing else in the app knows the adapter.
 */
export default class TranscriptionAppProvider {
	constructor(protected app: ApplicationService) {}

	register(): void {
		this.app.container.singleton(
			TranscriptionProvider,
			() =>
				new MistralTranscriptionProvider(
					env.get('MISTRAL_API_KEY'),
					createNodeRealtimeSocket
				)
		);
	}
}
