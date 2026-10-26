import { test } from '@japa/runner';

import { normalizeText, splitWords } from '#stt_bench/normalize_text';

test.group('normalizeText', () => {
	test('should lowercase and drop punctuation', ({ assert }) => {
		assert.equal(normalizeText('Bonjour, le Monde !'), 'bonjour le monde');
	});

	test('should treat straight and typographic apostrophes alike and split on them', ({
		assert,
	}) => {
		assert.equal(normalizeText("l'appli"), 'l appli');
		assert.equal(normalizeText('l’appli'), 'l appli');
		assert.equal(normalizeText('lʼappli'), 'l appli');
	});

	test('should drop straight and typographic quotes', ({ assert }) => {
		assert.equal(
			normalizeText('« oui » "non" “peut-être”'),
			'oui non peut être'
		);
	});

	test('should split hyphenated words', ({ assert }) => {
		assert.equal(normalizeText('peut-être'), 'peut être');
	});

	test('should compose decomposed accents to NFC before comparing', ({
		assert,
	}) => {
		assert.equal(normalizeText('été'), 'été');
	});

	test('should collapse whitespace and trim', ({ assert }) => {
		assert.equal(normalizeText('  a \n\t b  '), 'a b');
	});
});

test.group('splitWords', () => {
	test('should return no word for text made only of punctuation', ({
		assert,
	}) => {
		assert.deepEqual(splitWords(' ... ! '), []);
	});
});
