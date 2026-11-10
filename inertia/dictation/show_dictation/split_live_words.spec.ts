import { describe, expect, it } from 'vitest';

import { splitLiveWords } from '~/dictation/show_dictation/split_live_words';

const getWordKeys = (text: string, committedLength = 0): string[] =>
	splitLiveWords(text, committedLength)
		.filter((token) => token.isWord)
		.map((token) => token.key);

describe('splitLiveWords', () => {
	it('should keep the keys of existing words when text is appended', () => {
		const before = getWordKeys('hello big');

		expect(getWordKeys('hello big world').slice(0, 2)).toEqual(before);
	});

	it('should keep the keys when a partial becomes final with the same words', () => {
		expect(getWordKeys('hello world', 0)).toEqual(
			getWordKeys('hello world', 11)
		);
	});

	it('should give a new key to a revised word only', () => {
		const [firstKey, secondKey] = getWordKeys('hello wold');
		const [revisedFirstKey, revisedSecondKey] = getWordKeys('hello world');

		expect(revisedFirstKey).toBe(firstKey);
		expect(revisedSecondKey).not.toBe(secondKey);
	});

	it('should keep the key when only the case and the punctuation change', () => {
		expect(getWordKeys('Bonjour, tout le monde.')).toEqual(
			getWordKeys('bonjour tout le monde')
		);
	});

	it('should give a new key to a different word at the same position', () => {
		expect(getWordKeys('Sept')).not.toEqual(getWordKeys("C'est"));
	});

	it('should give a non-empty unique key to a punctuation-only word', () => {
		const keys = getWordKeys('a — ?');

		expect(keys).toEqual(['0:a', '1:—', '2:?']);
	});

	it('should flag as partial the tokens starting at or after the committed length', () => {
		const tokens = splitLiveWords('hello world again', 5);

		expect(tokens.map((token) => token.isPartial)).toEqual([
			false,
			true,
			true,
			true,
			true,
		]);
	});

	it('should preserve leading and multiple spaces', () => {
		const tokens = splitLiveWords('  a   b', 0);

		expect(tokens.map((token) => token.text).join('')).toBe('  a   b');
		expect(tokens.map((token) => token.isWord)).toEqual([
			false,
			true,
			false,
			true,
		]);
	});
});
