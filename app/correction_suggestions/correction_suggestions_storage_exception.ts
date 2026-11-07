import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised when the database refuses a write on correction suggestions. Replaces
 * the driver error, whose `detail` holds the values of the row.
 */
export default class CorrectionSuggestionsStorageException extends Exception {
	static status = 500;
	static code = 'E_CORRECTION_SUGGESTIONS_STORAGE';

	constructor(message = 'Correction suggestions could not be stored') {
		super(message);
	}
}
