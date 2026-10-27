import { test } from '@japa/runner';
import vine, { errors } from '@vinejs/vine';

import { RuleNameMessagesProvider } from '#shared/rule_name_messages_provider';

test.group('RuleNameMessagesProvider', () => {
	test('should report the failed rule name as message', async ({ assert }) => {
		const validator = vine.create({ name: vine.string().maxLength(3) });

		const error = await validator
			.validate(
				{ name: 'too long' },
				{ messagesProvider: new RuleNameMessagesProvider() }
			)
			.then(
				() => undefined,
				(caught: unknown) => caught
			);

		if (!(error instanceof errors.E_VALIDATION_ERROR)) {
			assert.fail('Expected a validation error');
			return;
		}
		assert.lengthOf(error.messages, 1);
		assert.include(error.messages[0], {
			field: 'name',
			message: 'maxLength',
			rule: 'maxLength',
		});
	});
});
