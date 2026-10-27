import type { FieldContext, MessagesProviderContact } from '@vinejs/vine/types';

/**
 * Validation messages are the name of the failed rule (`required`,
 * `maxLength`, `enum`...): the server stays language-agnostic and the browser
 * translates by rule.
 */
export class RuleNameMessagesProvider implements MessagesProviderContact {
	getMessage(
		_defaultMessage: string,
		rule: string,
		_field: FieldContext
	): string {
		return rule;
	}
}
