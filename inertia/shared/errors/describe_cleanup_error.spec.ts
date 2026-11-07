import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeCleanupError } from '~/shared/errors/describe_cleanup_error';

describe('describeCleanupError', () => {
	it('should word the unavailable cleanup', () => {
		expect(describeCleanupError('E_TEXT_CLEANUP_UNAVAILABLE', i18n)).toBe(
			'Text cleanup is unavailable'
		);
	});

	it('should word the cleanup that took too long', () => {
		expect(describeCleanupError('E_TEXT_CLEANUP_TIMEOUT', i18n)).toBe(
			'The cleanup took too long, try again or use the standard model'
		);
	});

	it('should fall back to a generic message for an unknown code', () => {
		expect(describeCleanupError('E_SOMETHING_NEW', i18n)).toBe(
			'Cleanup failed, try again'
		);
	});
});
