import { test } from '@japa/runner';
import { errors } from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';
import { updateSettingsValidator } from '#user_settings/validators/update_settings_validator';

const VALID_INPUT = {
	dictationLanguage: 'fr',
	interfaceLanguage: 'system',
	vocabulary: ['Adonis'],
	cleanupInstructions: 'Use bullet points',
};

async function readFailedFields(
	input: Record<string, unknown>
): Promise<string[]> {
	const error = await updateSettingsValidator.validate(input).then(
		() => undefined,
		(caught: unknown) => caught
	);
	if (!(error instanceof errors.E_VALIDATION_ERROR)) return [];
	return error.messages.map(({ field }: { field: string }) => field);
}

test.group('updateSettingsValidator', () => {
	test('should accept valid settings and trim the vocabulary and the instructions', async ({
		assert,
	}) => {
		const settings = await updateSettingsValidator.validate({
			...VALID_INPUT,
			vocabulary: ['  Adonis  '],
			cleanupInstructions: '  Use bullet points  ',
		});

		assert.deepEqual(settings, VALID_INPUT);
	});

	test('should accept empty instructions and an empty vocabulary', async ({
		assert,
	}) => {
		const settings = await updateSettingsValidator.validate({
			...VALID_INPUT,
			vocabulary: [],
			cleanupInstructions: '',
		});

		assert.equal(settings.cleanupInstructions, '');
		assert.deepEqual(settings.vocabulary, []);
	});

	test('should reject a language that is not offered', async ({ assert }) => {
		const failedFields = await readFailedFields({
			...VALID_INPUT,
			dictationLanguage: 'de',
			interfaceLanguage: 'de',
		});

		assert.sameMembers(failedFields, [
			'dictationLanguage',
			'interfaceLanguage',
		]);
	});

	test('should reject a vocabulary with too many terms', async ({ assert }) => {
		const vocabulary = Array.from(
			{ length: userSettingsConfig.maxVocabularyTerms + 1 },
			(_, index) => `term ${index}`
		);

		const failedFields = await readFailedFields({ ...VALID_INPUT, vocabulary });

		assert.deepEqual(failedFields, ['vocabulary']);
	});

	test('should reject a blank term and a too long term', async ({ assert }) => {
		const failedFields = await readFailedFields({
			...VALID_INPUT,
			vocabulary: ['   ', 'x'.repeat(userSettingsConfig.maxTermLength + 1)],
		});

		assert.sameMembers(failedFields, ['vocabulary.0', 'vocabulary.1']);
	});

	test('should reject too long cleanup instructions', async ({ assert }) => {
		const failedFields = await readFailedFields({
			...VALID_INPUT,
			cleanupInstructions: 'x'.repeat(
				userSettingsConfig.maxInstructionsLength + 1
			),
		});

		assert.deepEqual(failedFields, ['cleanupInstructions']);
	});
});
