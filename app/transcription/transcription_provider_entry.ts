import type { TranscriptionProvider } from '#transcription/transcription_provider';
import type { WarningLogger } from '#transcription/warning_logger';

export type TranscriptionApiKeyEnvName = 'MISTRAL_API_KEY' | 'DEEPGRAM_API_KEY';

export type TranscriptionProviderEntry = {
	apiKeyEnvName: TranscriptionApiKeyEnvName;
	sttModel: string;
	createProvider: (
		apiKey: string,
		logger: WarningLogger
	) => TranscriptionProvider;
};
