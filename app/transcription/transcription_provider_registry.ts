import { createDeepgramTranscriptionProvider } from '#transcription/providers/deepgram/create_deepgram_transcription_provider';
import { DEEPGRAM_MODEL } from '#transcription/providers/deepgram/deepgram_transcription_provider';
import { createMistralTranscriptionProvider } from '#transcription/providers/mistral/create_mistral_transcription_provider';
import { MISTRAL_REALTIME_MODEL } from '#transcription/providers/mistral/mistral_transcription_provider';
import type { TranscriptionProviderEntry } from '#transcription/transcription_provider_entry';
import type { TranscriptionProviderName } from '#transcription/transcription_provider_name';

/**
 * The single place that knows each adapter: the env var holding its key, the
 * model it runs and how to build it. Adding a provider = one adapter + one
 * entry here (and its name in `TRANSCRIPTION_PROVIDER_NAMES`).
 */
export const TRANSCRIPTION_PROVIDER_REGISTRY: Readonly<
	Record<TranscriptionProviderName, TranscriptionProviderEntry>
> = {
	mistral: {
		apiKeyEnvName: 'MISTRAL_API_KEY',
		sttModel: MISTRAL_REALTIME_MODEL,
		createProvider: (apiKey) => createMistralTranscriptionProvider(apiKey),
	},
	deepgram: {
		apiKeyEnvName: 'DEEPGRAM_API_KEY',
		sttModel: DEEPGRAM_MODEL,
		createProvider: (apiKey, logger) =>
			createDeepgramTranscriptionProvider(apiKey, logger),
	},
};
