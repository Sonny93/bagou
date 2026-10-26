/** `cleanedText` is `null` when the server could not clean the raw text. */
export type DictationTranscript = {
	rawText: string;
	cleanedText: string | null;
};
