import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised when the authentication response does not match a known passkey or
 * fails WebAuthn verification. Both cases share one response.
 */
export default class PasskeyAuthenticationFailedException extends Exception {
	static status = 401;
	static code = 'E_PASSKEY_AUTHENTICATION_FAILED';

	constructor(options?: ErrorOptions) {
		super('Passkey authentication failed', options);
	}
}
