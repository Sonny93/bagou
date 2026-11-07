const DIACRITICS = /\p{M}/gu;
const NON_ALPHANUMERIC_OR_SPACE = /[^\p{L}\p{N}\s]/gu;
const WHITESPACE_RUN = /\s+/g;

/**
 * Reduces a text to its words: lowercased, without accents or punctuation,
 * with any whitespace run collapsed to one space. Unlike `normalizeForComparison`
 * it keeps word boundaries, so "a i" and "ai" stay different.
 */
export function normalizeWordSequence(text: string): string {
	return text
		.normalize('NFD')
		.replace(DIACRITICS, '')
		.replace(NON_ALPHANUMERIC_OR_SPACE, '')
		.toLowerCase()
		.replace(WHITESPACE_RUN, ' ')
		.trim();
}
