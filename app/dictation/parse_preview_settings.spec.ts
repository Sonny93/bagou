import { test } from '@japa/runner';

import { parsePreviewSettings } from '#dictation/parse_preview_settings';

test.group('parsePreviewSettings', () => {
	test('should return the settings with empty instructions as an empty string', async ({
		assert,
	}) => {
		const settings = await parsePreviewSettings({
			dictationLanguage: 'fr',
			vocabulary: ['Adonis'],
			cleanupInstructions: null,
		});

		assert.deepEqual(settings, {
			dictationLanguage: 'fr',
			vocabulary: ['Adonis'],
			cleanupInstructions: '',
		});
	});

	test('should throw the invalid preview settings error when the payload breaks a rule', async ({
		assert,
	}) => {
		await assert.rejects(
			() => parsePreviewSettings({ dictationLanguage: 'de' }),
			/E_INVALID_PREVIEW_SETTINGS/
		);
	});
});
