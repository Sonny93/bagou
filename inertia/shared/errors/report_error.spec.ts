import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reportError } from '~/shared/errors/report_error';

const { toastError } = vi.hoisted(() => ({
	toastError: vi.fn<() => void>(),
}));

vi.mock('@minimalstuff/ui', () => ({ toast: { error: toastError } }));

describe('reportError', () => {
	let consoleError: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.restoreAllMocks();
	});

	it('should log the original error and show the message in a toast', () => {
		const error = new Error('boom');

		reportError('Could not save', error);

		expect(consoleError).toHaveBeenCalledWith('Could not save', error);
		expect(toastError).toHaveBeenCalledWith('Could not save', {
			id: undefined,
		});
	});

	it('should give the toast the requested id so a repeated failure shows once', () => {
		reportError('Could not save', new Error('boom'), { toastId: 'save' });

		expect(toastError).toHaveBeenCalledWith('Could not save', { id: 'save' });
	});
});
