/**
 * Where a dictation segment lands in the draft: the draft it belongs to and
 * the raw text around the caret, without any separator (the server adds them).
 */
export type DraftContext = {
	draftId: string;
	textBefore: string;
	textAfter: string;
};
