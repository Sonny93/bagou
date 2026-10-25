import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised when a passkey ceremony is verified without a pending challenge in
 * the session, or when that challenge has expired.
 */
export default class MissingPasskeyChallengeException extends Exception {
	static status = 400;
	static code = 'E_MISSING_PASSKEY_CHALLENGE';

	constructor() {
		super('La demande a expiré, recommence');
	}
}
