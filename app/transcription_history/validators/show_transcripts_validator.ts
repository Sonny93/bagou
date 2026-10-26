import vine from '@vinejs/vine';

const MAX_QUERY_LENGTH = 200;

export const showTranscriptsValidator = vine.create({
	q: vine.string().trim().maxLength(MAX_QUERY_LENGTH).optional(),
	page: vine.number().withoutDecimals().min(1).optional(),
});
