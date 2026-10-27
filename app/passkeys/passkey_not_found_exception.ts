import { Exception } from '@adonisjs/core/exceptions';

export default class PasskeyNotFoundException extends Exception {
	static status = 404;
	static code = 'E_PASSKEY_NOT_FOUND';

	constructor() {
		super('Passkey not found');
	}
}
