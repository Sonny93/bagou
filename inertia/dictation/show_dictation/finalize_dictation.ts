import type { DictationTranscript } from '~/dictation/core/dictation_transcript';

type FinalizedDictation = {
	draftText: string;
	isCleaned: boolean;
	isCopied: boolean;
};

/**
 * Inserts the segment into the draft, the cleaned text when the server
 * produced it and the raw one otherwise, then copies the whole draft. A blank
 * draft is not copied.
 */
export async function finalizeDictation(
	{ rawText, cleanedText }: Readonly<DictationTranscript>,
	insertSegment: (segment: string) => string,
	copyText: (text: string) => Promise<boolean>
): Promise<FinalizedDictation> {
	const draftText = insertSegment(cleanedText ?? rawText);
	const isCopied = draftText.trim() === '' ? false : await copyText(draftText);
	return { draftText, isCleaned: cleanedText !== null, isCopied };
}
