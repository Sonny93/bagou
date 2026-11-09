import { MissingTranscriptionApiKeyError } from '#transcription/missing_transcription_api_key_error';
import type { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionApiKeyEnvName } from '#transcription/transcription_provider_entry';
import type { TranscriptionProviderName } from '#transcription/transcription_provider_name';
import { TRANSCRIPTION_PROVIDER_REGISTRY } from '#transcription/transcription_provider_registry';
import type { WarningLogger } from '#transcription/warning_logger';

type BuildTranscriptionProviderInput = {
	providerName: TranscriptionProviderName;
	getApiKey: (envName: TranscriptionApiKeyEnvName) => string | undefined;
	logger: WarningLogger;
};

/**
 * Builds the adapter for `providerName`. A missing or empty key throws, so a
 * misconfigured instance fails when it is wired, not on the first dictation.
 */
export function buildTranscriptionProvider({
	providerName,
	getApiKey,
	logger,
}: Readonly<BuildTranscriptionProviderInput>): TranscriptionProvider {
	const entry = TRANSCRIPTION_PROVIDER_REGISTRY[providerName];
	const apiKey = getApiKey(entry.apiKeyEnvName);
	if (apiKey === undefined || apiKey === '') {
		throw new MissingTranscriptionApiKeyError(
			providerName,
			entry.apiKeyEnvName
		);
	}
	return entry.createProvider(apiKey, logger);
}
