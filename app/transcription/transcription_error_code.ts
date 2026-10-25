export const TranscriptionErrorCode = {
	connectionFailed: 'E_TRANSCRIPTION_CONNECTION_FAILED',
	connectionClosed: 'E_TRANSCRIPTION_CONNECTION_CLOSED',
	providerRejected: 'E_TRANSCRIPTION_PROVIDER_REJECTED',
	finishTimeout: 'E_TRANSCRIPTION_FINISH_TIMEOUT',
	sessionNotActive: 'E_TRANSCRIPTION_SESSION_NOT_ACTIVE',
	sessionAborted: 'E_TRANSCRIPTION_SESSION_ABORTED',
} as const;

export type TranscriptionErrorCode =
	(typeof TranscriptionErrorCode)[keyof typeof TranscriptionErrorCode];
