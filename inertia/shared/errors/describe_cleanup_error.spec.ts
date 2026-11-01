import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeCleanupError } from './describe_cleanup_error';

describe('describeCleanupError', () => {
	it('should word the unavailable cleanup', () => {
		expect(describeCleanupError('E_TEXT_CLEANUP_UNAVAILABLE', i18n)).toBe(
			'Text cleanup is unavailable'
		);
	});

	it('should fall back to a generic message for an unknown code', () => {
		expect(describeCleanupError('E_SOMETHING_NEW', i18n)).toBe(
			'Cleanup failed, try again'
		);
	});
});
