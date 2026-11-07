import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeCorrectionFailure } from '~/corrections/shared/describe_correction_failure';
import { describeCorrectionRule } from '~/corrections/shared/describe_correction_rule';

describe('describeCorrectionFailure', () => {
	it('should word the full list from the application code', () => {
		expect(
			describeCorrectionFailure(
				{ kind: 'code', code: 'E_CORRECTIONS_FULL' },
				i18n
			)
		).toBe('Corrections limit reached. Remove some in the settings.');
	});

	it('should word the storage failure from the application code', () => {
		expect(
			describeCorrectionFailure(
				{ kind: 'code', code: 'E_CORRECTIONS_STORAGE' },
				i18n
			)
		).toBe('The correction could not be saved, try again');
	});

	it('should fall back to a generic wording for an unknown code', () => {
		expect(
			describeCorrectionFailure({ kind: 'code', code: 'E_OTHER' }, i18n)
		).toBe('The correction could not be saved, try again');
	});

	it('should word an unreachable server', () => {
		expect(describeCorrectionFailure({ kind: 'network' }, i18n)).toBe(
			'The server is unreachable'
		);
	});
});

describe('describeCorrectionRule', () => {
	it('should word the rule that forbids line breaks and angle brackets', () => {
		expect(describeCorrectionRule('regex', i18n)).toBe(
			'Line breaks, < and > are not allowed'
		);
	});

	it('should word identical sides', () => {
		expect(describeCorrectionRule('notSameAs', i18n)).toBe(
			'Must be different from what was heard'
		);
	});

	it('should reuse the shared wording of a common rule', () => {
		expect(describeCorrectionRule('required', i18n)).toBe(
			'This field is required'
		);
	});

	it('should fall back to a generic wording for an unknown rule', () => {
		expect(describeCorrectionRule('unheardOf', i18n)).toBe(
			'The value is not valid'
		);
	});
});
