import type { TranscriptionProvider } from '#transcription/transcription_provider';

export type BenchProviderEntry = {
	sttModel: string;
	createProvider: () => TranscriptionProvider;
};
