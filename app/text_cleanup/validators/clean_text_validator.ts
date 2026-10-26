import vine from '@vinejs/vine';

const MAX_TEXT_LENGTH = 20_000;

/** The body parser turns an empty string into null, which an empty dictation sends. */
export const cleanTextValidator = vine.create({
	text: vine.string().trim().maxLength(MAX_TEXT_LENGTH).nullable(),
});
