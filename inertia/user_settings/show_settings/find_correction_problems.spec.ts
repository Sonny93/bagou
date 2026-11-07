import { describe, expect, it } from 'vitest';

import { findCorrectionProblems } from '~/user_settings/show_settings/find_correction_problems';

const MAX_SIDE_LENGTH = 10;

describe('findCorrectionProblems', () => {
	it('should accept a valid pair', () => {
		expect(
			findCorrectionProblems('vox trale', 'Voxtral', MAX_SIDE_LENGTH)
		).toEqual({ heard: null, written: null });
	});

	it('should accept a case-only correction', () => {
		expect(
			findCorrectionProblems('chatgpt', 'ChatGPT', MAX_SIDE_LENGTH).written
		).toBeNull();
	});

	it('should require both sides once trimmed', () => {
		expect(findCorrectionProblems('  ', '', MAX_SIDE_LENGTH)).toEqual({
			heard: 'required',
			written: 'required',
		});
	});

	it('should refuse a side that is too long', () => {
		expect(
			findCorrectionProblems('a'.repeat(11), 'b', MAX_SIDE_LENGTH).heard
		).toBe('maxLength');
	});

	it('should refuse line breaks and angle brackets', () => {
		expect(findCorrectionProblems('a\nb', '<b>', MAX_SIDE_LENGTH)).toEqual({
			heard: 'regex',
			written: 'regex',
		});
	});

	it('should refuse identical sides on the written field', () => {
		expect(
			findCorrectionProblems('Voxtral ', 'Voxtral', MAX_SIDE_LENGTH)
		).toEqual({ heard: null, written: 'notSameAs' });
	});
});
