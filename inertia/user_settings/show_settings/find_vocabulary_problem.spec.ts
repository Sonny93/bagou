import { describe, expect, it } from 'vitest';

import { findVocabularyProblem } from './find_vocabulary_problem';
import type { SettingsLimits } from './settings_limits';

const LIMITS: SettingsLimits = {
	maxVocabularyTerms: 2,
	maxTermLength: 5,
	maxInstructionsLength: 100,
	maxSampleTextLength: 1000,
};

describe('findVocabularyProblem', () => {
	it('should accept a vocabulary within the limits', () => {
		expect(findVocabularyProblem(['Adona', 'Vine'], LIMITS)).toBeNull();
	});

	it('should report too many terms', () => {
		expect(findVocabularyProblem(['a', 'b', 'c'], LIMITS)).toEqual({
			kind: 'too_many_terms',
			maxTermCount: 2,
		});
	});

	it('should report a term that is too long', () => {
		expect(findVocabularyProblem(['Adonisjs'], LIMITS)).toEqual({
			kind: 'term_too_long',
			maxTermLength: 5,
		});
	});
});
