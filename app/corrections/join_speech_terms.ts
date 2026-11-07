/**
 * The terms handed to speech recognition: the vocabulary first, then the
 * corrected words in the order given (newest first), each term once whatever
 * its case. The first spelling wins.
 */
export function joinSpeechTerms(
	vocabulary: readonly string[],
	correctedWords: readonly string[]
): string[] {
	const seenTerms = new Set<string>();
	const terms: string[] = [];
	for (const term of [...vocabulary, ...correctedWords]) {
		const key = term.toLowerCase();
		if (seenTerms.has(key)) continue;
		seenTerms.add(key);
		terms.push(term);
	}
	return terms;
}
