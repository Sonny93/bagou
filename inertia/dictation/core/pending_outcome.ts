/**
 * An outcome that arrives later than the server acknowledgement, bounded in
 * time. Settles once: by `resolve`, by `reject`, or by the timeout. `dispose`
 * stops the timer. A rejection nobody awaits yet is not reported as unhandled.
 */
export class PendingOutcome<TValue> {
	readonly promise: Promise<TValue>;
	#resolve: (value: TValue) => void = () => undefined;
	#reject: (error: Error) => void = () => undefined;
	readonly #timer: ReturnType<typeof setTimeout>;

	constructor(timeoutMs: number, createTimeoutError: () => Error) {
		this.promise = new Promise<TValue>((resolve, reject) => {
			this.#resolve = resolve;
			this.#reject = reject;
		});
		this.promise.catch(() => undefined);
		this.#timer = setTimeout(
			() => this.#reject(createTimeoutError()),
			timeoutMs
		);
	}

	resolve(value: TValue): void {
		this.#resolve(value);
	}

	reject(error: Error): void {
		this.#reject(error);
	}

	dispose(): void {
		clearTimeout(this.#timer);
	}
}
