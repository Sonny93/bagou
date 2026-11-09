import type { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionApiKeyEnvName } from '#transcription/transcription_provider_entry';
import type { WarningLogger } from '#transcription/warning_logger';

export type BenchProviderEntry = {
	sttModel: string;
	apiKeyEnvName: TranscriptionApiKeyEnvName;
	isConfigured: () => boolean;
	createProvider: (logger: WarningLogger) => TranscriptionProvider;
};
