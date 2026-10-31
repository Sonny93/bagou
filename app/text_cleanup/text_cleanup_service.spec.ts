import { test } from '@japa/runner';

import { FRENCH_CLEANUP_PREFERENCES } from '#tests/helpers/cleanup_preferences_fixture';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';

const HUNDRED_CHARACTERS = 'a'.repeat(100);

function createService(textCleaner: FakeTextCleaner) {
	const { logger, lines } = createRecordingLogger();
	return { service: new TextCleanupService(textCleaner, logger), lines };
}

async function collectProgress(
	outputLengths: readonly number[],
	text: string = HUNDRED_CHARACTERS
): Promise<number[]> {
	const percents: number[] = [];
	const { service } = createService(
		new FakeTextCleaner(undefined, outputLengths)
	);
	await service.clean(text, FRENCH_CLEANUP_PREFERENCES, {
		onProgress: (percent) => percents.push(percent),
	});
	return percents;
}

test.group('TextCleanupService', () => {
	test('should return the cleaned text from the cleaner', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();

		const { service } = createService(textCleaner);
		const text = await service.clean('euh bonjour', FRENCH_CLEANUP_PREFERENCES);

		assert.equal(text, 'EUH BONJOUR');
		assert.deepEqual(textCleaner.cleaned, ['euh bonjour']);
		assert.deepEqual(textCleaner.receivedPreferences, [
			FRENCH_CLEANUP_PREFERENCES,
		]);
	});

	test('should return an empty string without calling the cleaner nor reporting progress when the text is blank', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner(undefined, [10]);
		const percents: number[] = [];

		const { service } = createService(textCleaner);
		const text = await service.clean('  \n ', FRENCH_CLEANUP_PREFERENCES, {
			onProgress: (percent) => percents.push(percent),
		});

		assert.equal(text, '');
		assert.lengthOf(textCleaner.cleaned, 0);
		assert.lengthOf(percents, 0);
	});

	test('should quantize the progress down to steps of 1 percent', async ({
		assert,
	}) => {
		assert.deepEqual(
			await collectProgress([2, 4, 5, 150], 'a'.repeat(300)),
			[0, 1, 50]
		);
	});

	test('should cap the progress at 95 percent', async ({ assert }) => {
		assert.deepEqual(await collectProgress([95, 100, 300]), [95]);
	});

	test('should never repeat nor lower the progress', async ({ assert }) => {
		assert.deepEqual(await collectProgress([30, 30, 12, 31, 36]), [30, 31, 36]);
	});

	test('should still clean and log a warning without any text when the progress callback throws', async ({
		assert,
	}) => {
		const { service, lines } = createService(
			new FakeTextCleaner(undefined, [10, 50])
		);

		const text = await service.clean(
			'texte secret',
			FRENCH_CLEANUP_PREFERENCES,
			{
				onProgress: () => {
					throw new Error('boom texte secret');
				},
			}
		);

		assert.equal(text, 'TEXTE SECRET');
		const logs = lines.map((line) => JSON.parse(line));
		assert.include(logs.at(-1), {
			level: 40,
			msg: 'Cleanup progress could not be reported',
			errorName: 'Error',
		});
		assert.notInclude(lines.join('').toLowerCase(), 'secret');
	});
});
