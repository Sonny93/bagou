import env from '#start/env';
import type { BenchProviderEntry } from '#stt_bench/bench_provider_entry';
import { createMistralTranscriptionProvider } from '#transcription/providers/mistral/create_mistral_transcription_provider';
import { MISTRAL_REALTIME_MODEL } from '#transcription/providers/mistral/mistral_transcription_provider';

/**
 * Providers the benchmark can run, keyed by `TranscriptionProvider.name`.
 * Adding a provider = one adapter + one entry here.
 */
export const BENCH_PROVIDER_REGISTRY: Readonly<
	Record<string, BenchProviderEntry>
> = {
	mistral: {
		sttModel: MISTRAL_REALTIME_MODEL,
		createProvider: () =>
			createMistralTranscriptionProvider(env.get('MISTRAL_API_KEY')),
	},
};
