import vine from '@vinejs/vine';

const MAX_DRAFT_TEXT_LENGTH = 200_000;

export const saveDraftTextValidator = vine.create({
	params: vine.object({ draftId: vine.string().uuid() }),
	/** Nullable because the body parser turns an empty string into `null`; an empty draft is a valid text. */
	text: vine.string().maxLength(MAX_DRAFT_TEXT_LENGTH).nullable(),
});
