import type { TranscriptionErrorCode } from '#transcription/transcription_error_code';

/**
 * Any failure of a speech-to-text provider, mapped to a stable code. The
 * message is for logs and never carries secrets, audio or transcript text;
 * user-facing wording is decided by the caller from the code.
 */
export class TranscriptionProviderError extends Error {
	override readonly name = 'TranscriptionProviderError';

	constructor(
		readonly code: TranscriptionErrorCode,
		message: string
	) {
		super(message);
	}
}
