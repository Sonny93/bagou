import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeValidationRule } from './describe_validation_rule';

describe('describeValidationRule', () => {
	it('should describe a known rule name', () => {
		expect(describeValidationRule('maxLength', i18n)).toBe(
			'The value is too long'
		);
	});

	it('should describe the array rule names', () => {
		expect(describeValidationRule('array.maxLength', i18n)).toBe(
			'There are too many items'
		);
	});

	it('should return null for an unknown rule name', () => {
		expect(describeValidationRule('somethingNew', i18n)).toBeNull();
	});
});
