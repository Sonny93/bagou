import vine from '@vinejs/vine';

import { authenticationResponseSchema } from '#passkeys/validators/authentication_response_schema';

export const verifyAuthenticationValidator = vine.create({
	response: authenticationResponseSchema,
});
