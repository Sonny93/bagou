/** Every provider an instance can be configured with (`TRANSCRIPTION_PROVIDER`). */
export const TRANSCRIPTION_PROVIDER_NAMES = ['mistral', 'deepgram'] as const;

export type TranscriptionProviderName =
	(typeof TRANSCRIPTION_PROVIDER_NAMES)[number];
