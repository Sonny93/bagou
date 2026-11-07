import { normalizeWordSequence } from './normalize_word_sequence';

/**
 * Counts the non-overlapping occurrences of a word sequence in a text, on
 * whole words, ignoring case, accents and punctuation: "there" is not found
 * in "therefore". Returns 0 for an empty sequence.
 */
export function countWordSequence(text: string, sequence: string): number {
	const needle = ` ${normalizeWordSequence(sequence)} `;
	if (needle.trim() === '') return 0;
	const haystack = ` ${normalizeWordSequence(text)} `;
	let count = 0;
	let position = haystack.indexOf(needle);
	while (position !== -1) {
		count += 1;
		position = haystack.indexOf(needle, position + needle.length - 1);
	}
	return count;
}
