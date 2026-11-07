import { test } from '@japa/runner';

import { joinSpeechTerms } from '#corrections/join_speech_terms';

test.group('joinSpeechTerms', () => {
	test('should put the vocabulary first, then the corrected words in the given order', ({
		assert,
	}) => {
		assert.deepEqual(joinSpeechTerms(['Adonis'], ['Claude', 'Voxtral']), [
			'Adonis',
			'Claude',
			'Voxtral',
		]);
	});

	test('should keep each term once whatever its case, the first spelling winning', ({
		assert,
	}) => {
		assert.deepEqual(
			joinSpeechTerms(['Claude'], ['claude', 'Voxtral', 'VOXTRAL']),
			['Claude', 'Voxtral']
		);
	});

	test('should return an empty list when there is nothing to join', ({
		assert,
	}) => {
		assert.deepEqual(joinSpeechTerms([], []), []);
	});
});
