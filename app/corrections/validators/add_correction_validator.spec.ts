import { test } from '@japa/runner';
import { errors } from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';
import { addCorrectionValidator } from '#corrections/validators/add_correction_validator';

const VALID_INPUT = { heard: 'cloud', written: 'Claude' };

async function readFailedFields(
	input: Record<string, unknown>
): Promise<Record<string, string>> {
	const error = await addCorrectionValidator.validate(input).then(
		() => undefined,
		(caught: unknown) => caught
	);
	if (!(error instanceof errors.E_VALIDATION_ERROR)) return {};
	return Object.fromEntries(
		error.messages.map(({ field, rule }: { field: string; rule: string }) => [
			field,
			rule,
		])
	);
}

test.group('addCorrectionValidator', () => {
	test('should accept a pair and trim both sides', async ({ assert }) => {
		const pair = await addCorrectionValidator.validate({
			heard: '  cloud ',
			written: ' Claude  ',
		});

		assert.deepEqual(pair, VALID_INPUT);
	});

	test('should accept a case-only correction', async ({ assert }) => {
		const pair = await addCorrectionValidator.validate({
			heard: 'chatgpt',
			written: 'ChatGPT',
		});

		assert.deepEqual(pair, { heard: 'chatgpt', written: 'ChatGPT' });
	});

	test('should accept sides of the maximum length', async ({ assert }) => {
		const heard = 'a'.repeat(userSettingsConfig.maxCorrectionSideLength);
		const written = 'b'.repeat(userSettingsConfig.maxCorrectionSideLength);

		const pair = await addCorrectionValidator.validate({ heard, written });

		assert.deepEqual(pair, { heard, written });
	});

	test('should reject a blank or missing side on its own field', async ({
		assert,
	}) => {
		assert.deepEqual(await readFailedFields({ heard: '   ' }), {
			heard: 'minLength',
			written: 'required',
		});
	});

	test('should reject a side that is too long', async ({ assert }) => {
		const tooLong = 'a'.repeat(userSettingsConfig.maxCorrectionSideLength + 1);

		assert.deepEqual(
			await readFailedFields({ heard: tooLong, written: 'Claude' }),
			{ heard: 'maxLength' }
		);
	});

	test('should reject line breaks and angle brackets', async ({ assert }) => {
		assert.deepEqual(
			await readFailedFields({ heard: 'cl\noud', written: '<Claude>' }),
			{ heard: 'regex', written: 'regex' }
		);
		assert.deepEqual(
			await readFailedFields({ heard: 'cl\roud', written: 'Claude' }),
			{ heard: 'regex' }
		);
	});

	test('should reject a NUL character, which the database cannot store', async ({
		assert,
	}) => {
		assert.deepEqual(
			await readFailedFields({ heard: 'cl\u0000oud', written: 'Claude\u0000' }),
			{ heard: 'regex', written: 'regex' }
		);
	});

	test('should reject a pair whose sides are strictly identical', async ({
		assert,
	}) => {
		assert.deepEqual(
			await readFailedFields({ heard: 'Claude', written: ' Claude ' }),
			{ written: 'notSameAs' }
		);
	});
});
