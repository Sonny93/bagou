const UNEXPECTED_ERROR_CODE = 'E_BENCH_UNEXPECTED';

/** Stable code of a failure, never its message (messages may be sensitive). */
export function describeErrorCode(error: unknown): string {
	if (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof error.code === 'string'
	) {
		return error.code;
	}
	return UNEXPECTED_ERROR_CODE;
}
