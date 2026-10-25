import vine from '@vinejs/vine';

import { clientExtensionResultsSchema } from '#passkeys/validators/client_extension_results_schema';

export const authenticationResponseSchema = vine.object({
	id: vine.string(),
	rawId: vine.string(),
	type: vine.literal('public-key'),
	authenticatorAttachment: vine.enum(['cross-platform', 'platform']).optional(),
	clientExtensionResults: clientExtensionResultsSchema,
	response: vine.object({
		clientDataJSON: vine.string(),
		authenticatorData: vine.string(),
		signature: vine.string(),
		userHandle: vine.string().optional(),
	}),
});
