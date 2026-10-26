import type { DictationTranscript } from '~/dictation/core/dictation_transcript';

type FinalizedDictation = {
	text: string;
	isCleaned: boolean;
	isCopied: boolean;
};

/**
 * Picks the text to keep, the cleaned one when the server produced it and the
 * raw one otherwise, then copies it. An empty text is not copied.
 */
export async function finalizeDictation(
	{ rawText, cleanedText }: Readonly<DictationTranscript>,
	copyText: (text: string) => Promise<boolean>
): Promise<FinalizedDictation> {
	const text = cleanedText ?? rawText;
	const isCopied = text.trim() === '' ? false : await copyText(text);
	return { text, isCleaned: cleanedText !== null, isCopied };
}
