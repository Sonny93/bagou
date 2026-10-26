import { test } from '@japa/runner';

import { joinDraft } from '#dictation/join_draft';

test.group('joinDraft', () => {
	test('should return the trimmed segment when the draft is empty', ({
		assert,
	}) => {
		assert.equal(
			joinDraft({ textBefore: '', textAfter: '' }, '  bonjour  '),
			'bonjour'
		);
	});

	test('should put a single space between the text before and the segment', ({
		assert,
	}) => {
		assert.equal(
			joinDraft({ textBefore: 'Avant.', textAfter: '' }, 'bonjour'),
			'Avant. bonjour'
		);
	});

	test('should put a single space between the segment and the text after', ({
		assert,
	}) => {
		assert.equal(
			joinDraft({ textBefore: '', textAfter: 'Après.' }, 'bonjour'),
			'bonjour Après.'
		);
	});

	test('should add no space next to existing whitespace', ({ assert }) => {
		assert.equal(
			joinDraft({ textBefore: 'Avant.\n', textAfter: ' Après.' }, 'bonjour'),
			'Avant.\nbonjour Après.'
		);
	});
});
