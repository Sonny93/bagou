import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised when the database refuses a write on corrections. Replaces the
 * driver error, whose `detail` holds the values of the row.
 */
export default class CorrectionsStorageException extends Exception {
	static status = 500;
	static code = 'E_CORRECTIONS_STORAGE';

	constructor(message = 'Corrections could not be stored') {
		super(message);
	}
}
