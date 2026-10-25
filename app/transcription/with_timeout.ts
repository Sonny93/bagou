/**
 * Rejects with the error built by `createError` when `promise` has not
 * settled within `timeoutMs`. The timer never outlives the promise.
 */
export async function withTimeout<TValue>(
	promise: Promise<TValue>,
	timeoutMs: number,
	createError: () => Error
): Promise<TValue> {
	let timer: NodeJS.Timeout | undefined;
	const timeout = new Promise<never>((_resolve, reject) => {
		timer = setTimeout(() => reject(createError()), timeoutMs);
	});
	try {
		return await Promise.race([promise, timeout]);
	} finally {
		clearTimeout(timer);
	}
}
