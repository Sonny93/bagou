import { TranscriptionErrorCode } from '#transcription/transcription_error_code';

export const DictationErrorCode = {
	...TranscriptionErrorCode,
	tooLong: 'E_DICTATION_TOO_LONG',
} as const;

export type DictationErrorCode =
	(typeof DictationErrorCode)[keyof typeof DictationErrorCode];
