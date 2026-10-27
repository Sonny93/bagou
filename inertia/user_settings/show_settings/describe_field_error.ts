import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { describeValidationRule } from '~/shared/i18n/describe_validation_rule';

/** Wording for the validation rule name the server sends as a field error. */
export function describeFieldError(rule: string, i18n: I18n): string {
	return (
		describeValidationRule(rule, i18n) ?? i18n._(msg`The value is not valid`)
	);
}
