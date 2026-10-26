import { bytesToBase64 } from './bytes_to_base64';
import { DictationClientError } from './dictation_client_error';
import type { DictationTranscript } from './dictation_transcript';
import type {
	DictationTransport,
	JoinedDictation,
} from './dictation_transport';
import type { DraftContext } from './draft_context';

export const MAX_BUFFERED_FRAMES = 100;

export type DictationClientListener = {
	onPartial(text: string): void;
	onFinal(text: string): void;
	onFinished(text: string): void;
	onError(error: DictationClientError): void;
};

type ClientPhase = 'idle' | 'starting' | 'started' | 'ended';

const readMessage = (error: unknown): string =>
	error instanceof Error ? error.message : String(error);

/**
 * One dictation over one socket. Audio produced while the session is still
 * opening is buffered and sent, in order, once the server acknowledged the
 * start; a lost connection ends the dictation with an error.
 */
export class DictationClient {
	#phase: ClientPhase = 'idle';
	#joined: JoinedDictation | undefined;
	#bufferedFrames: string[] = [];
	#isConnectionLost = false;

	constructor(
		private readonly transport: DictationTransport,
		private readonly listener: DictationClientListener,
		private readonly createDictationId: () => string = () => crypto.randomUUID()
	) {}

	async start(context: Readonly<DraftContext>): Promise<void> {
		if (this.#phase !== 'idle') throw new DictationClientError('rejected');
		this.#phase = 'starting';
		this.transport.onConnectionLost(this.#handleConnectionLost);
		try {
			await this.#open(context);
		} catch (error) {
			this.#close();
			throw this.#isConnectionLost
				? new DictationClientError('connection_lost')
				: error;
		}
		if (this.#hasEnded()) return;
		this.#phase = 'started';
		this.#drainBufferedFrames();
	}

	sendAudio(frame: Uint8Array): void {
		const base64Frame = bytesToBase64(frame);
		if (this.#phase === 'started') this.#joined?.sendAudio(base64Frame);
		else if (this.#phase === 'starting') this.#buffer(base64Frame);
	}

	async stop(): Promise<DictationTranscript> {
		const joined = this.#joined;
		if (this.#phase !== 'started' || !joined)
			throw new DictationClientError('rejected');
		try {
			return await joined.stop();
		} catch (error) {
			throw this.#isConnectionLost
				? new DictationClientError('connection_lost')
				: new DictationClientError('rejected', readMessage(error));
		} finally {
			this.#close();
		}
	}

	cancel(): void {
		if (this.#phase === 'ended') return;
		this.#joined?.cancel();
		this.#close();
	}

	async #open(context: Readonly<DraftContext>): Promise<void> {
		try {
			await this.transport.connect();
		} catch {
			throw new DictationClientError('connection_failed');
		}
		try {
			this.#joined = await this.transport.join(this.createDictationId(), {
				onPartial: (text) =>
					this.#whileOpen(() => this.listener.onPartial(text)),
				onFinal: (text) => this.#whileOpen(() => this.listener.onFinal(text)),
				onFinished: (text) =>
					this.#whileOpen(() => this.listener.onFinished(text)),
				onProviderError: (message) =>
					this.#failWith(new DictationClientError('provider_error', message)),
			});
			await this.#joined.start(context);
		} catch (error) {
			throw new DictationClientError('rejected', readMessage(error));
		}
	}

	#buffer(base64Frame: string): void {
		if (this.#bufferedFrames.length >= MAX_BUFFERED_FRAMES) {
			this.#failWith(new DictationClientError('connection_failed'));
			return;
		}
		this.#bufferedFrames.push(base64Frame);
	}

	#drainBufferedFrames(): void {
		this.#bufferedFrames.forEach((frame) => this.#joined?.sendAudio(frame));
		this.#bufferedFrames = [];
	}

	#handleConnectionLost = (): void => {
		if (this.#hasEnded()) return;
		this.#isConnectionLost = true;
		this.#failWith(new DictationClientError('connection_lost'));
	};

	#failWith(error: DictationClientError): void {
		if (this.#phase === 'ended') return;
		this.#close();
		this.listener.onError(error);
	}

	#hasEnded(): boolean {
		return this.#phase === 'ended';
	}

	#whileOpen(notify: () => void): void {
		if (this.#phase !== 'ended') notify();
	}

	#close(): void {
		this.#phase = 'ended';
		this.#bufferedFrames = [];
		this.transport.disconnect();
	}
}
