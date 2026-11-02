import { describe, expect, it } from 'vitest';

import { splitInlineCode } from '~/changelog/show_changelog/split_inline_code';

describe('splitInlineCode', () => {
	it('should return a single text part when there is no code', () => {
		expect(splitInlineCode('Plain entry.')).toEqual([
			{ text: 'Plain entry.', isCode: false, offset: 0 },
		]);
	});

	it('should separate code spans from the text around them', () => {
		expect(splitInlineCode('Press `Ctrl+S` to save, or `Esc`.')).toEqual([
			{ text: 'Press ', isCode: false, offset: 0 },
			{ text: 'Ctrl+S', isCode: true, offset: 6 },
			{ text: ' to save, or ', isCode: false, offset: 14 },
			{ text: 'Esc', isCode: true, offset: 27 },
			{ text: '.', isCode: false, offset: 32 },
		]);
	});

	it('should keep an unclosed backtick as text', () => {
		expect(splitInlineCode('A stray ` backtick')).toEqual([
			{ text: 'A stray ` backtick', isCode: false, offset: 0 },
		]);
	});

	it('should return no part for an empty text', () => {
		expect(splitInlineCode('')).toEqual([]);
	});
});
