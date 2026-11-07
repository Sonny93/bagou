import { describe, expect, it } from 'vitest';

import { countWordSequence } from './count_word_sequence';

describe('countWordSequence', () => {
	it('should count whole-word occurrences ignoring case and punctuation', () => {
		expect(countWordSequence('There, there. Therefore', 'there')).toBe(2);
	});

	it('should count a multi-word sequence as consecutive words', () => {
		expect(countWordSequence('a donis and a donis', 'A Donis')).toBe(2);
		expect(countWordSequence('a big donis', 'a donis')).toBe(0);
	});

	it('should return 0 when the sequence is empty', () => {
		expect(countWordSequence('some text', ' ')).toBe(0);
	});
});
