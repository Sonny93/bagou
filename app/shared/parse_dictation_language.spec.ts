import { test } from '@japa/runner';

import { parseDictationLanguage } from '#shared/parse_dictation_language';
import { UnknownDictationLanguageError } from '#shared/unknown_dictation_language_error';

test.group('parseDictationLanguage', () => {
	test('should return the language when it is a known one', ({ assert }) => {
		assert.equal(parseDictationLanguage('en'), 'en');
	});

	test('should throw the unknown language error when the value is not a known language', ({
		assert,
	}) => {
		assert.throws(
			() => parseDictationLanguage('de'),
			UnknownDictationLanguageError
		);
	});
});
