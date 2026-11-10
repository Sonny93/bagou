export type LiveToken = {
	key: string;
	text: string;
	isWord: boolean;
	isPartial: boolean;
};

const TOKEN_PATTERN = /\s+|\S+/g;
const EDGE_PUNCTUATION_PATTERN = /^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu;

const normalizeWord = (word: string): string =>
	word.replace(EDGE_PUNCTUATION_PATTERN, '').toLowerCase() || word;

/**
 * Splits the visible live text into words and whitespace runs. A word key
 * combines its word position and its text without case and edge punctuation,
 * so a word keeps its key when the provider only re-cases or re-punctuates it
 * while a revised word gets a new one.
 */
export function splitLiveWords(
	liveText: string,
	committedLength: number
): LiveToken[] {
	let wordIndex = 0;
	return Array.from(liveText.matchAll(TOKEN_PATTERN), (match) => {
		const text = match[0];
		const isWord = /\S/.test(text);
		const key = isWord
			? `${wordIndex}:${normalizeWord(text)}`
			: `space:${wordIndex}`;
		if (isWord) wordIndex += 1;
		return { key, text, isWord, isPartial: match.index >= committedLength };
	});
}
