import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

const VALIDATION_RULE_MESSAGES: Readonly<Record<string, MessageDescriptor>> = {
	required: msg`This field is required`,
	string: msg`The field value must be a string`,
	array: msg`The field value must be a list`,
	enum: msg`The selected value is not available`,
	regex: msg`The value is not valid`,
	minLength: msg`The value is too short`,
	maxLength: msg`The value is too long`,
	'array.maxLength': msg`There are too many items`,
};

/**
 * Wording for the VineJS rule name the server sends as validation message,
 * or `null` for a rule this front does not know.
 */
export function describeValidationRule(
	rule: string,
	i18n: I18n
): string | null {
	const descriptor = VALIDATION_RULE_MESSAGES[rule];
	return descriptor === undefined ? null : i18n._(descriptor);
}
