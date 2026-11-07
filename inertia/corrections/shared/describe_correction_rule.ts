import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { describeValidationRule } from '~/shared/i18n/describe_validation_rule';

const GENERIC_MESSAGE = msg`The value is not valid`;

const CORRECTION_RULE_MESSAGES: Readonly<Record<string, MessageDescriptor>> = {
	regex: msg`Line breaks, < and > are not allowed`,
	notSameAs: msg`Must be different from what was heard`,
};

/** Wording for the validation rule name the server sends for a field of a correction. */
export function describeCorrectionRule(rule: string, i18n: I18n): string {
	const descriptor = CORRECTION_RULE_MESSAGES[rule];
	if (descriptor !== undefined) return i18n._(descriptor);
	return describeValidationRule(rule, i18n) ?? i18n._(GENERIC_MESSAGE);
}
