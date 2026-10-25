import { MicrophoneError } from './microphone_error';

const PERMISSION_ERROR_NAMES = new Set(['NotAllowedError', 'SecurityError']);
const NO_DEVICE_ERROR_NAMES = new Set([
	'NotFoundError',
	'OverconstrainedError',
]);

/** Maps whatever getUserMedia or the audio graph threw to a typed error. */
export function toMicrophoneError(error: unknown): MicrophoneError {
	if (error instanceof MicrophoneError) return error;
	const name = error instanceof Error ? error.name : '';
	if (PERMISSION_ERROR_NAMES.has(name)) {
		return new MicrophoneError('permission_denied', { cause: error });
	}
	if (NO_DEVICE_ERROR_NAMES.has(name)) {
		return new MicrophoneError('no_device', { cause: error });
	}
	return new MicrophoneError('failed', { cause: error });
}
