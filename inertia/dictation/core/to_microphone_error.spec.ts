import { describe, expect, it } from 'vitest';

import { MicrophoneError } from './microphone_error';
import { toMicrophoneError } from './to_microphone_error';

const domError = (name: string): Error =>
	Object.assign(new Error(name), { name });

describe('toMicrophoneError', () => {
	it.each([
		['NotAllowedError', 'permission_denied'],
		['SecurityError', 'permission_denied'],
		['NotFoundError', 'no_device'],
		['OverconstrainedError', 'no_device'],
		['AbortError', 'failed'],
	])('should map %s to %s', (name, code) => {
		expect(toMicrophoneError(domError(name)).code).toBe(code);
	});

	it('should keep an error that is already typed', () => {
		const error = new MicrophoneError('unsupported');

		expect(toMicrophoneError(error)).toBe(error);
	});

	it('should map anything unknown to a generic failure', () => {
		expect(toMicrophoneError('boom').code).toBe('failed');
	});
});
