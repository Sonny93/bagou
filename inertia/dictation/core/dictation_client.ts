import { bytesToBase64 } from './bytes_to_base64';
import { DictationClientError } from './dictation_client_error';
import type { DictationStartRequest } from './dictation_start_request';
import type { DictationTranscript } from './dictation_transcript';
import type {
	DictationTransport,
	JoinedDictation,
} from './dictation_transport';
import { PendingOutcome } from './pending_outcome';

export const MAX_BUFFERED_FRAMES = 100;

/**
 * How long the client waits for the server to announce the provider session
 * ready after acknowledging the start. The server bound is 10 s (provider
 * `readyMs`), plus a margin.
 */
export const READY_TIMEOUT_MS = 20_000;

/**
 * How long the client waits for the completed transcript after the server
 * acknowledged the stop. The server bound is the provider finish (10 s) plus
 * two cleanup attempts of 15 s each, plus a margin. Past it the client gives
 * up and disconnects, while the server still completes and saves the
 * dictation to the history.
 */
export const COMPLETION_TIMEOUT_MS = 60_000;

export type DictationClientListener = {
	onPartial(text: string): void;
	onFinal(text: string): void;
	onFinished(text: string): void;
	onError(error: DictationClientError): void;
};

type ClientPhase = 'idle' | 'starting' | 'started' | 'ended';

const readServerCode = (error: unknown): string =>
	error instanceof Error ? error.message : String(error);

const toClientError = (error: unknown): DictationClientError =>
	error instanceof DictationClientError
		? error
		: new DictationClientError('rejected', readServerCode(error));

/**
 * One dictation over one socket. Audio produced while the session is still
 * opening is buffered and sent, in order, once the server acknowledged the
 * start. The server acknowledges fast; `start` resolves once the session is
 * also announced ready and `stop` once the completed transcript arrived, each
 * within a bound. An error that strikes while one of them waits rejects it;
 * otherwise it goes to the listener, so it is reported exactly once. A lost
 * connection ends the dictation with an error.
 */
export class DictationClient {
	#phase: ClientPhase = 'idle';
	#joined: JoinedDictation | undefined;
	#bufferedFrames: string[] = [];
	#isConnectionLost = false;
	#readiness: PendingOutcome<void> | undefined;
	#completion: PendingOutcome<DictationTranscript> | undefined;

	constructor(
		private readonly transport: DictationTransport,
		private readonly listener: DictationClientListener,
		private readonly createDictationId: () => string = () => crypto.randomUUID()
	) {}

	async start(request: Readonly<DictationStartRequest>): Promise<void> {
		if (this.#phase !== 'idle') throw new DictationClientError('rejected');
		this.#phase = 'starting';
		this.transport.onConnectionLost(this.#handleConnectionLost);
		try {
			await this.#open(request);
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
		const completion = new PendingOutcome<DictationTranscript>(
			COMPLETION_TIMEOUT_MS,
			() => new DictationClientError('completion_timed_out')
		);
		this.#completion = completion;
		try {
			const [, transcript] = await Promise.all([
				joined.stop(),
				completion.promise,
			]);
			return transcript;
		} catch (error) {
			throw this.#isConnectionLost
				? new DictationClientError('connection_lost')
				: toClientError(error);
		} finally {
			completion.dispose();
			this.#completion = undefined;
			this.#close();
		}
	}

	cancel(): void {
		if (this.#phase === 'ended') return;
		this.#joined?.cancel();
		this.#close();
		this.#readiness?.resolve();
		this.#completion?.reject(new DictationClientError('rejected'));
	}

	async #open(request: Readonly<DictationStartRequest>): Promise<void> {
		const readiness = new PendingOutcome<void>(
			READY_TIMEOUT_MS,
			() => new DictationClientError('start_timed_out')
		);
		this.#readiness = readiness;
		try {
			await this.#connectAndStart(request, readiness);
		} catch (error) {
			throw toClientError(error);
		} finally {
			readiness.dispose();
			this.#readiness = undefined;
		}
	}

	async #connectAndStart(
		request: Readonly<DictationStartRequest>,
		readiness: PendingOutcome<void>
	): Promise<void> {
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
				onReady: () => readiness.resolve(),
				onCompleted: (transcript) => this.#completion?.resolve(transcript),
				onProviderError: (code) =>
					this.#failWith(new DictationClientError('provider_error', code)),
			});
			await Promise.all([this.#joined.start(request), readiness.promise]);
		} catch (error) {
			throw toClientError(error);
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
		const pending = this.#readiness ?? this.#completion;
		if (pending) pending.reject(error);
		else this.listener.onError(error);
	}

	#hasEnded(): boolean {
		return this.#phase === 'ended';
	}

	#whileOpen(notify: () => void): void {
		if (this.#phase !== 'ended') notify();
	}

	#close(): void {
		if (this.#phase === 'ended') return;
		this.#phase = 'ended';
		this.#bufferedFrames = [];
		this.transport.disconnect();
	}
}
