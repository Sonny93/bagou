const DIACRITICS = /\p{M}/gu;
const NON_ALPHANUMERIC = /[^\p{L}\p{N}]/gu;

/**
 * Reduces a text to its letters and digits, lowercased, without accents,
 * punctuation or spaces, so that similarity ignores where a word was split.
 * Use `normalizeWordSequence` when word boundaries matter.
 */
export function normalizeForComparison(text: string): string {
	return text
		.normalize('NFD')
		.replace(DIACRITICS, '')
		.replace(NON_ALPHANUMERIC, '')
		.toLowerCase();
}
