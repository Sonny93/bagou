import { describe, expect, it } from 'vitest';

import { insertSegment, splitDraft } from './dictation_draft';

const caretAt = (index: number) => ({ start: index, end: index });

describe('insertSegment', () => {
	it('should insert the segment at the end when the caret is at the end of the draft', () => {
		const insertion = insertSegment('Bonjour', caretAt(7), 'le monde');

		expect(insertion).toEqual({ text: 'Bonjour le monde', caret: 16 });
	});

	it('should insert the segment without separator into an empty draft', () => {
		const insertion = insertSegment('', caretAt(0), 'Bonjour');

		expect(insertion).toEqual({ text: 'Bonjour', caret: 7 });
	});

	it('should add a space on both sides when inserting between two words', () => {
		const insertion = insertSegment('Bonjourmonde', caretAt(7), 'le');

		expect(insertion).toEqual({ text: 'Bonjour le monde', caret: 10 });
	});

	it('should not add a space next to existing whitespace', () => {
		const insertion = insertSegment('Bonjour monde', caretAt(7), 'le');

		expect(insertion).toEqual({ text: 'Bonjour le monde', caret: 10 });
	});

	it('should replace the selected text with the segment', () => {
		const insertion = insertSegment(
			'Bonjour tout monde',
			{ start: 8, end: 12 },
			'le'
		);

		expect(insertion).toEqual({ text: 'Bonjour le monde', caret: 10 });
	});

	it('should trim the segment before inserting it', () => {
		const insertion = insertSegment('Bonjour', caretAt(7), '  le monde \n');

		expect(insertion).toEqual({ text: 'Bonjour le monde', caret: 16 });
	});

	it('should leave the draft and the selected text untouched when the segment is blank', () => {
		const insertion = insertSegment('Bonjour', { start: 2, end: 5 }, '   ');

		expect(insertion).toEqual({ text: 'Bonjour', caret: 5 });
	});

	it('should clamp a selection past the end of the draft', () => {
		const insertion = insertSegment('Bonjour', { start: 50, end: 60 }, 'monde');

		expect(insertion).toEqual({ text: 'Bonjour monde', caret: 13 });
	});

	it('should clamp a negative selection to the start of the draft', () => {
		const insertion = insertSegment('monde', { start: -4, end: -1 }, 'Bonjour');

		expect(insertion).toEqual({ text: 'Bonjour monde', caret: 7 });
	});
});

describe('splitDraft', () => {
	it('should expose the parts around the selection and the separators', () => {
		const split = splitDraft('Bonjourmonde', caretAt(7), 'le');

		expect(split).toEqual({
			textBefore: 'Bonjour',
			separatorBefore: ' ',
			separatorAfter: ' ',
			textAfter: 'monde',
		});
	});

	it('should not add any separator when the segment is blank', () => {
		const split = splitDraft('Bonjour monde', caretAt(7), ' ');

		expect(split).toMatchObject({ separatorBefore: '', separatorAfter: '' });
	});
});
