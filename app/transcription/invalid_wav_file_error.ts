export class InvalidWavFileError extends Error {
	override readonly name = 'InvalidWavFileError';
	readonly code = 'E_INVALID_WAV_FILE';
}
