/**
 * Where a dictation segment lands in the user's draft: the draft it belongs
 * to and the text around the caret, which the segment is cleaned together with.
 */
export type DraftContext = {
	draftId: string;
	textBefore: string;
	textAfter: string;
};
