/**
 * `cleanedDraft` is the whole draft cleaned, the segment included; `null`
 * when the segment was blank or the cleanup failed, the raw text is then all
 * there is.
 */
export type DictationTranscript = {
	rawText: string;
	cleanedDraft: string | null;
};
