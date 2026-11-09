import type { RealtimeSocket } from '#transcription/realtime_socket/realtime_socket';

/**
 * In-memory stand-in for the provider WebSocket: records what the adapter
 * sends and lets a spec play the server's side. Text frames are kept parsed
 * in `sent`, binary frames as copies of their bytes in `sentBinary`.
 */
export class FakeRealtimeSocket implements RealtimeSocket {
	readonly sent: Record<string, unknown>[] = [];
	readonly sentBinary: Uint8Array[] = [];
	closeCount = 0;
	#openListener: () => void = () => undefined;
	#messageListener: (message: string) => void = () => undefined;
	#errorListener: () => void = () => undefined;
	#closeListener: (code: number, reason: string) => void = () => undefined;

	send(message: string | Uint8Array): void {
		if (typeof message === 'string') {
			this.sent.push(JSON.parse(message));
			return;
		}
		this.sentBinary.push(Uint8Array.from(message));
	}

	close(): void {
		this.closeCount += 1;
	}

	onOpen(listener: () => void): void {
		this.#openListener = listener;
	}

	onMessage(listener: (message: string) => void): void {
		this.#messageListener = listener;
	}

	onError(listener: () => void): void {
		this.#errorListener = listener;
	}

	onClose(listener: (code: number, reason: string) => void): void {
		this.#closeListener = listener;
	}

	receive(message: Readonly<Record<string, unknown>>): void {
		this.#messageListener(JSON.stringify(message));
	}

	receiveRaw(message: string): void {
		this.#messageListener(message);
	}

	simulateOpen(): void {
		this.#openListener();
	}

	simulateError(): void {
		this.#errorListener();
	}

	simulateClose(code = 1006, reason = ''): void {
		this.#closeListener(code, reason);
	}
}
