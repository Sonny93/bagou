import vine from '@vinejs/vine';

export const dictationChannelParamsValidator = vine.create({
	dictationId: vine.string().uuid(),
});
