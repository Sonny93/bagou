import vine from '@vinejs/vine';

export const clientExtensionResultsSchema = vine.object({
	appid: vine.boolean().optional(),
	credProps: vine
		.object({
			rk: vine.boolean().optional(),
		})
		.optional(),
	hmacCreateSecret: vine.boolean().optional(),
});
