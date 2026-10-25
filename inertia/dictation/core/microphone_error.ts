export type MicrophoneErrorCode =
	| 'permission_denied'
	| 'no_device'
	| 'unsupported'
	| 'audio_blocked'
	| 'failed';

export class MicrophoneError extends Error {
	override readonly name = 'MicrophoneError';

	constructor(
		readonly code: MicrophoneErrorCode,
		options?: ErrorOptions
	) {
		super(code, options);
	}
}
