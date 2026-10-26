import { test } from '@japa/runner';

import { computeWer } from '#stt_bench/compute_wer';

test.group('computeWer', () => {
	test('should score 0% for identical texts', ({ assert }) => {
		const score = computeWer('le chat dort', 'le chat dort');

		assert.equal(score.errorRatePercent, 0);
		assert.equal(score.referenceWordCount, 3);
	});

	test('should score 100% with only deletions for an empty hypothesis', ({
		assert,
	}) => {
		const score = computeWer('le chat dort', '');

		assert.equal(score.errorRatePercent, 100);
		assert.equal(score.deletions, 3);
		assert.equal(score.substitutions, 0);
		assert.equal(score.insertions, 0);
	});

	test('should ignore case and punctuation', ({ assert }) => {
		assert.equal(
			computeWer('Bonjour, le monde.', 'bonjour le MONDE').errorRatePercent,
			0
		);
	});

	test('should ignore apostrophe variants', ({ assert }) => {
		assert.equal(computeWer("l'appli", 'l’appli').errorRatePercent, 0);
	});

	test('should count one substitution and one insertion', ({ assert }) => {
		const score = computeWer('le chat dort', 'le chien dort ici');

		assert.equal(score.substitutions, 1);
		assert.equal(score.deletions, 0);
		assert.equal(score.insertions, 1);
		assert.closeTo(score.errorRatePercent, 66.67, 0.01);
	});

	test('should count one deletion for a missing word', ({ assert }) => {
		const score = computeWer('a b c', 'a c');

		assert.equal(score.deletions, 1);
		assert.equal(score.substitutions, 0);
		assert.equal(score.insertions, 0);
		assert.closeTo(score.errorRatePercent, 33.33, 0.01);
	});

	test('should exceed 100% when the hypothesis has many insertions', ({
		assert,
	}) => {
		assert.equal(computeWer('a', 'a b c').errorRatePercent, 200);
	});

	test('should score 0% for two empty texts and 100% for an empty reference only', ({
		assert,
	}) => {
		assert.equal(computeWer('', '').errorRatePercent, 0);
		assert.equal(computeWer('', 'bruit').errorRatePercent, 100);
	});
});
