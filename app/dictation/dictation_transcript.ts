/** `cleanedText` is `null` when the cleanup failed, the raw text is then all there is. */
export type DictationTranscript = {
	rawText: string;
	cleanedText: string | null;
};
