import env from '#start/env';
import type { BenchProviderEntry } from '#stt_bench/bench_provider_entry';
import { buildTranscriptionProvider } from '#transcription/build_transcription_provider';
import { TRANSCRIPTION_PROVIDER_NAMES } from '#transcription/transcription_provider_name';
import { TRANSCRIPTION_PROVIDER_REGISTRY } from '#transcription/transcription_provider_registry';

/**
 * Providers the benchmark can run, keyed by `TranscriptionProvider.name`.
 * Derived from the instance registry: a new adapter is benchmarkable as soon
 * as it is registered there. Creating a provider throws when its key is unset.
 */
export const BENCH_PROVIDER_REGISTRY: Readonly<
	Record<string, BenchProviderEntry>
> = Object.fromEntries(
	TRANSCRIPTION_PROVIDER_NAMES.map((providerName) => [
		providerName,
		{
			sttModel: TRANSCRIPTION_PROVIDER_REGISTRY[providerName].sttModel,
			apiKeyEnvName:
				TRANSCRIPTION_PROVIDER_REGISTRY[providerName].apiKeyEnvName,
			isConfigured: () =>
				Boolean(
					env.get(TRANSCRIPTION_PROVIDER_REGISTRY[providerName].apiKeyEnvName)
				),
			createProvider: (logger) =>
				buildTranscriptionProvider({
					providerName,
					getApiKey: (envName) => env.get(envName),
					logger,
				}),
		} satisfies BenchProviderEntry,
	])
);
