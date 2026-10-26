const APOSTROPHE_VARIANTS = /[\u2018\u2019\u02BC\u00B4`]/gu;
const NON_WORD_CHARACTERS = /[^\p{L}\p{N}\s]/gu;
const WHITESPACE_RUNS = /\s+/gu;

/**
 * Lowercases (NFC), then turns every punctuation mark, apostrophe variant,
 * quote and hyphen into a separator, so « l’appli » and "l'appli" both
 * become « l appli ».
 */
export function normalizeText(text: string): string {
	return text
		.normalize('NFC')
		.toLowerCase()
		.replace(APOSTROPHE_VARIANTS, "'")
		.replace(NON_WORD_CHARACTERS, ' ')
		.replace(WHITESPACE_RUNS, ' ')
		.trim();
}

export function splitWords(text: string): string[] {
	const normalizedText = normalizeText(text);
	return normalizedText === '' ? [] : normalizedText.split(' ');
}
