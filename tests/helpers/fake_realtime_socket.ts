import type { RealtimeSocket } from '#transcription/providers/mistral/realtime_socket';

/**
 * In-memory stand-in for the provider WebSocket: records what the adapter
 * sends and lets a spec play the server's side.
 */
export class FakeRealtimeSocket implements RealtimeSocket {
	readonly sent: Record<string, unknown>[] = [];
	closeCount = 0;
	#messageListener: (message: string) => void = () => undefined;
	#errorListener: () => void = () => undefined;
	#closeListener: () => void = () => undefined;

	send(message: string): void {
		this.sent.push(JSON.parse(message));
	}

	close(): void {
		this.closeCount += 1;
	}

	onMessage(listener: (message: string) => void): void {
		this.#messageListener = listener;
	}

	onError(listener: () => void): void {
		this.#errorListener = listener;
	}

	onClose(listener: () => void): void {
		this.#closeListener = listener;
	}

	receive(message: Readonly<Record<string, unknown>>): void {
		this.#messageListener(JSON.stringify(message));
	}

	receiveRaw(message: string): void {
		this.#messageListener(message);
	}

	simulateError(): void {
		this.#errorListener();
	}

	simulateClose(): void {
		this.#closeListener();
	}
}
