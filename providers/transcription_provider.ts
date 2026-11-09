import type { ApplicationService } from '@adonisjs/core/types';

import env from '#start/env';
import { buildTranscriptionProvider } from '#transcription/build_transcription_provider';
import { TranscriptionProvider } from '#transcription/transcription_provider';

/**
 * Binds the transcription port to the adapter chosen by `TRANSCRIPTION_PROVIDER`
 * for the whole instance. Nothing else in the app knows the adapter. The
 * adapter is resolved in `boot()` (the logger it needs is only available
 * through the async container, which `register()` cannot await), so an unset
 * key stops the boot instead of failing the first dictation.
 */
export default class TranscriptionAppProvider {
	constructor(protected app: ApplicationService) {}

	register(): void {
		this.app.container.singleton(TranscriptionProvider, async (resolver) =>
			buildTranscriptionProvider({
				providerName: env.get('TRANSCRIPTION_PROVIDER'),
				getApiKey: (envName) => env.get(envName),
				logger: await resolver.make('logger'),
			})
		);
	}

	async boot(): Promise<void> {
		await this.app.container.make(TranscriptionProvider);
	}
}
