import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised when the registration response does not pass WebAuthn verification.
 */
export default class PasskeyRegistrationFailedException extends Exception {
	static status = 400;
	static code = 'E_PASSKEY_REGISTRATION_FAILED';

	constructor(options?: ErrorOptions) {
		super('The passkey could not be registered', options);
	}
}
