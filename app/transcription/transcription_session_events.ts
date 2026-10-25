import type { TranscriptionProviderError } from '#transcription/transcription_provider_error';

export type TranscriptionSessionEvents = {
	final: [{ text: string }];
	partial: [{ text: string }];
	error: [{ error: TranscriptionProviderError }];
};
