import type { MiddlewareContext } from '@rlanz/socket/types';
import { errors } from '@vinejs/vine';

import InvalidDictationIdException from '#dictation/invalid_dictation_id_exception';
import { dictationChannelParamsValidator } from '#dictation/validators/dictation_channel_params_validator';
import type User from '#users/user';

/**
 * Channel middleware: only an authenticated user may subscribe, and only to a
 * well-formed (client-generated UUID) dictation id.
 */
export async function ensureDictationAccess(
	{ socket, params }: MiddlewareContext<User>,
	next: () => Promise<void>
): Promise<void> {
	socket.getUserOrFail();
	try {
		await dictationChannelParamsValidator.validate(params);
	} catch (error) {
		if (error instanceof errors.E_VALIDATION_ERROR) {
			throw new InvalidDictationIdException();
		}
		throw error;
	}
	await next();
}
