import vine from '@vinejs/vine';

import { registrationResponseSchema } from '#passkeys/validators/registration_response_schema';

const MAX_LABEL_LENGTH = 60;

export const verifyRegistrationValidator = vine.create({
	label: vine.string().trim().minLength(1).maxLength(MAX_LABEL_LENGTH),
	response: registrationResponseSchema,
});
