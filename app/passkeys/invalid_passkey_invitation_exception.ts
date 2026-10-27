import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised for an unknown, expired or already used invitation token. The three
 * cases share status, code and message so the response never tells which one
 * applies.
 */
export default class InvalidPasskeyInvitationException extends Exception {
	static status = 404;
	static code = 'E_INVALID_PASSKEY_INVITATION';

	constructor() {
		super('The invitation link is invalid or has expired');
	}
}
