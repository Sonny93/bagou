import { describe, expect, it } from 'vitest';

import { parseVocabulary } from './parse_vocabulary';

describe('parseVocabulary', () => {
	it('should split the text into one trimmed term per line', () => {
		expect(parseVocabulary('  Adonis \nMistral\r\nInertia')).toEqual([
			'Adonis',
			'Mistral',
			'Inertia',
		]);
	});

	it('should drop blank lines', () => {
		expect(parseVocabulary('\nAdonis\n   \n\nMistral\n')).toEqual([
			'Adonis',
			'Mistral',
		]);
	});

	it('should remove duplicates and keep the first occurrence order', () => {
		expect(parseVocabulary('Adonis\nMistral\nAdonis')).toEqual([
			'Adonis',
			'Mistral',
		]);
	});

	it('should return no term for an empty text', () => {
		expect(parseVocabulary('')).toEqual([]);
	});
});
