import { afterEach, describe, expect, it, vi } from 'vitest';

import { logError } from './log_error';

describe('logError', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should print the context and the original error in the console', () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		const error = new Error('boom');

		logError('Dictation failed', error);

		expect(consoleError).toHaveBeenCalledWith('Dictation failed', error);
	});
});
