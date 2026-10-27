export type DictationClientErrorCode =
	| 'connection_failed'
	| 'connection_lost'
	| 'rejected'
	| 'provider_error';

/**
 * `serverCode` is the stable error code sent by the server, set for
 * `rejected` and `provider_error` when the server gave one; the UI words every
 * code itself.
 */
export class DictationClientError extends Error {
	override readonly name = 'DictationClientError';

	constructor(
		readonly code: DictationClientErrorCode,
		readonly serverCode: string | null = null
	) {
		super(serverCode ?? code);
	}
}
