export const AudioConversionErrorCode = {
	ffmpegMissing: 'E_AUDIO_CONVERSION_FFMPEG_MISSING',
	conversionFailed: 'E_AUDIO_CONVERSION_FAILED',
} as const;

export type AudioConversionErrorCode =
	(typeof AudioConversionErrorCode)[keyof typeof AudioConversionErrorCode];

/** The message never carries audio content or transcript text. */
export class AudioConversionError extends Error {
	override readonly name = 'AudioConversionError';

	constructor(
		readonly code: AudioConversionErrorCode,
		message: string
	) {
		super(message);
	}
}
