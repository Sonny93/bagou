import { describe, expect, it } from 'vitest';

import { pickVocabularyError } from './pick_vocabulary_error';

describe('pickVocabularyError', () => {
	it('should pick the error of the list itself', () => {
		expect(pickVocabularyError({ vocabulary: 'array.maxLength' })).toBe(
			'array.maxLength'
		);
	});

	it('should pick the error of a term', () => {
		expect(
			pickVocabularyError({
				cleanupInstructions: 'maxLength',
				'vocabulary.3': 'minLength',
			})
		).toBe('minLength');
	});

	it('should ignore the errors of other fields', () => {
		expect(pickVocabularyError({ cleanupInstructions: 'maxLength' })).toBe(
			undefined
		);
	});
});
