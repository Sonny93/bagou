import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised when deleting the only remaining passkey, which would lock the
 * owner out.
 */
export default class LastPasskeyException extends Exception {
	static status = 409;
	static code = 'E_LAST_PASSKEY';

	constructor() {
		super('Impossible de supprimer la dernière passkey');
	}
}
