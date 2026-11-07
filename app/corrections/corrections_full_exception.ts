import { Exception } from '@adonisjs/core/exceptions';

/** Raised when the user already stores the maximum number of corrections. */
export default class CorrectionsFullException extends Exception {
	static status = 422;
	static code = 'E_CORRECTIONS_FULL';

	constructor(message = 'Too many corrections') {
		super(message);
	}
}
