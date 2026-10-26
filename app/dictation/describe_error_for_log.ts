type ErrorLogFields = {
	errorName: string;
	errorCode?: string;
};

/**
 * Only the error name and its string `code` (the SQLSTATE of a Postgres
 * error). Never the message, `detail` or stack, which can hold transcript text.
 */
export function describeErrorForLog(error: unknown): ErrorLogFields {
	const errorName = error instanceof Error ? error.name : 'UnknownError';
	const code =
		error instanceof Error ? (error as { code?: unknown }).code : undefined;
	return typeof code === 'string'
		? { errorName, errorCode: code }
		: { errorName };
}
