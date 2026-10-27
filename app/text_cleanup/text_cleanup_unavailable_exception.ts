import { Exception } from '@adonisjs/core/exceptions';

/**
 * Raised when the text cleanup engine fails for any reason. The cause is
 * logged by the adapter; clients read the stable `code`.
 */
export default class TextCleanupUnavailableException extends Exception {
	static status = 503;
	static code = 'E_TEXT_CLEANUP_UNAVAILABLE';

	constructor() {
		super('Text cleanup is unavailable');
	}
}
