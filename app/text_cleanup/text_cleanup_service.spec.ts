import { test } from '@japa/runner';

import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';

test.group('TextCleanupService', () => {
	test('should return the cleaned text from the cleaner', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();

		const text = await new TextCleanupService(textCleaner).clean('euh bonjour');

		assert.equal(text, 'EUH BONJOUR');
		assert.deepEqual(textCleaner.cleaned, ['euh bonjour']);
	});

	test('should return an empty string without calling the cleaner when the text is blank', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();

		const text = await new TextCleanupService(textCleaner).clean('  \n ');

		assert.equal(text, '');
		assert.lengthOf(textCleaner.cleaned, 0);
	});
});
