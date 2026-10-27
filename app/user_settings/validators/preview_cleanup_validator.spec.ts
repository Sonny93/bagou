import { test } from '@japa/runner';
import { errors } from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';
import { MAX_DRAFT_TEXT_LENGTH } from '#dictation/validators/start_dictation_validator';
import { previewCleanupValidator } from '#user_settings/validators/preview_cleanup_validator';
import { previewSettingsValidator } from '#user_settings/validators/preview_settings_validator';

const VALID_SETTINGS = {
	dictationLanguage: 'fr',
	vocabulary: ['Adonis'],
	cleanupInstructions: 'Use bullet points',
};

async function readFailedFields(
	validate: () => Promise<unknown>
): Promise<string[]> {
	const error = await validate().then(
		() => undefined,
		(caught: unknown) => caught
	);
	if (!(error instanceof errors.E_VALIDATION_ERROR)) return [];
	return error.messages.map(({ field }: { field: string }) => field);
}

test.group('previewSettingsValidator', () => {
	test('should accept valid settings and trim the vocabulary and the instructions', async ({
		assert,
	}) => {
		const settings = await previewSettingsValidator.validate({
			...VALID_SETTINGS,
			vocabulary: ['  Adonis  '],
			cleanupInstructions: '  Use bullet points  ',
		});

		assert.deepEqual(settings, VALID_SETTINGS);
	});

	test('should apply the limits of the saved settings', async ({ assert }) => {
		const failedFields = await readFailedFields(() =>
			previewSettingsValidator.validate({
				dictationLanguage: 'de',
				vocabulary: Array.from(
					{ length: userSettingsConfig.maxVocabularyTerms + 1 },
					(_, index) => `term ${index}`
				),
				cleanupInstructions: 'x'.repeat(
					userSettingsConfig.maxInstructionsLength + 1
				),
			})
		);

		assert.sameMembers(failedFields, [
			'dictationLanguage',
			'vocabulary',
			'cleanupInstructions',
		]);
	});

	test('should reject a blank term and a too long term', async ({ assert }) => {
		const failedFields = await readFailedFields(() =>
			previewSettingsValidator.validate({
				...VALID_SETTINGS,
				vocabulary: ['   ', 'x'.repeat(userSettingsConfig.maxTermLength + 1)],
			})
		);

		assert.sameMembers(failedFields, ['vocabulary.0', 'vocabulary.1']);
	});
});

test.group('previewCleanupValidator', () => {
	test('should trim the text', async ({ assert }) => {
		const payload = await previewCleanupValidator.validate({
			...VALID_SETTINGS,
			text: '  euh bonjour  ',
		});

		assert.equal(payload.text, 'euh bonjour');
	});

	test('should reject a blank text', async ({ assert }) => {
		const failedFields = await readFailedFields(() =>
			previewCleanupValidator.validate({ ...VALID_SETTINGS, text: '   ' })
		);

		assert.deepEqual(failedFields, ['text']);
	});

	test('should reject a text longer than a draft', async ({ assert }) => {
		const failedFields = await readFailedFields(() =>
			previewCleanupValidator.validate({
				...VALID_SETTINGS,
				text: 'x'.repeat(MAX_DRAFT_TEXT_LENGTH + 1),
			})
		);

		assert.deepEqual(failedFields, ['text']);
	});
});
