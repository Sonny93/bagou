import { TranscriptionErrorCode } from '#transcription/transcription_error_code';

export const DictationErrorCode = {
	...TranscriptionErrorCode,
	silenceTimeout: 'E_DICTATION_SILENCE_TIMEOUT',
	tooLong: 'E_DICTATION_TOO_LONG',
	quotaExceeded: 'E_DICTATION_QUOTA_EXCEEDED',
	unavailable: 'E_DICTATION_UNAVAILABLE',
} as const;

export type DictationErrorCode =
	(typeof DictationErrorCode)[keyof typeof DictationErrorCode];
