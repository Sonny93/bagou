export type DictationClientErrorCode =
	| 'connection_failed'
	| 'connection_lost'
	| 'rejected'
	| 'provider_error';

/**
 * `message` is only meaningful for `rejected` and `provider_error`, where it
 * is the server's safe French wording; the other codes are worded by the UI.
 */
export class DictationClientError extends Error {
	override readonly name = 'DictationClientError';

	constructor(
		readonly code: DictationClientErrorCode,
		message: string = code
	) {
		super(message);
	}
}
