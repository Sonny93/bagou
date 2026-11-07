import { describe, expect, it } from 'vitest';

import { levenshteinSimilarity } from './levenshtein_similarity';

describe('levenshteinSimilarity', () => {
	it('should be 1 when both texts are identical or empty', () => {
		expect(levenshteinSimilarity('voxtral', 'voxtral')).toBe(1);
		expect(levenshteinSimilarity('', '')).toBe(1);
	});

	it('should be 0 when one text is empty and the other is not', () => {
		expect(levenshteinSimilarity('', 'abc')).toBe(0);
	});

	it('should divide the edit distance by the longer text when the texts differ', () => {
		expect(levenshteinSimilarity('cloud', 'claude')).toBeCloseTo(1 - 2 / 6, 5);
	});
});
