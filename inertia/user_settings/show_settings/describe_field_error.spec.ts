import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeFieldError } from './describe_field_error';

describe('describeFieldError', () => {
	it('should word a known rule', () => {
		expect(describeFieldError('enum', i18n)).toBe(
			'The selected value is not available'
		);
	});

	it('should fall back to a generic message for an unknown rule', () => {
		expect(describeFieldError('somethingNew', i18n)).toBe(
			'The value is not valid'
		);
	});
});
