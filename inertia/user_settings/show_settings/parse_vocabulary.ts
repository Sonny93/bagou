const LINE_SEPARATOR = /\r?\n/;

/** One term per line: trimmed, blank lines dropped, duplicates removed (first one wins). */
export function parseVocabulary(vocabularyText: string): string[] {
	const terms = vocabularyText
		.split(LINE_SEPARATOR)
		.map((line) => line.trim())
		.filter((term) => term !== '');
	return [...new Set(terms)];
}
