import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';

/**
 * Raised when the cleanup engine did not answer within its time bound. It is
 * an unavailable cleanup, so existing handlers keep catching it; clients read
 * its own stable `code` to tell the user that retrying or a faster model may help.
 */
export default class TextCleanupTimeoutException extends TextCleanupUnavailableException {
	static code = 'E_TEXT_CLEANUP_TIMEOUT';

	constructor() {
		super('Text cleanup timed out');
	}
}
