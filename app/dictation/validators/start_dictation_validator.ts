import vine from '@vinejs/vine';

export const MAX_DRAFT_TEXT_LENGTH = 100_000;

const draftText = () => vine.string().maxLength(MAX_DRAFT_TEXT_LENGTH);

/** The draft a segment is dictated into: its id and the text around the caret, empty allowed. */
export const startDictationValidator = vine.create({
	draftId: vine.string().uuid(),
	textBefore: draftText(),
	textAfter: draftText(),
});
