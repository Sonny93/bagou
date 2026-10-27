import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reportError } from './report_error';

vi.mock('sonner', () => ({ toast: { error: vi.fn<() => void>() } }));

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
		expect(toast.error).toHaveBeenCalledWith('Could not save', {
			id: undefined,
		});
	});

	it('should give the toast the requested id so a repeated failure shows once', () => {
		reportError('Could not save', new Error('boom'), { toastId: 'save' });

		expect(toast.error).toHaveBeenCalledWith('Could not save', { id: 'save' });
	});
});
