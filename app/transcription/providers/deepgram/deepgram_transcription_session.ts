import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import type { DeepgramServerMessage } from '#transcription/providers/deepgram/deepgram_server_message';
import { parseDeepgramMessage } from '#transcription/providers/deepgram/parse_deepgram_message';
import type { RealtimeSocket } from '#transcription/realtime_socket/realtime_socket';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import { TranscriptionSession } from '#transcription/transcription_session';
import type { WarningLogger } from '#transcription/warning_logger';
import { withTimeout } from '#transcription/with_timeout';

export type DeepgramTimeouts = {
	readyMs: number;
	finishMs: number;
	keepAliveIntervalMs: number;
};

const DEFAULT_DEEPGRAM_TIMEOUTS: DeepgramTimeouts = {
	readyMs: 10_000,
	finishMs: 10_000,
	keepAliveIntervalMs: 4000,
};
const WORD_SEPARATOR = ' ';
const KEYTERM_LIMIT_EXCEEDED_CODE = 'CONFIGURE_KEYTERM_LIMIT_EXCEEDED';
/** Deepgram documents 100 terms and 500 tokens as the cap; the first ones win, like Mistral. */
export const MAX_KEYTERMS = 100;
/** 100 long terms can still exceed 500 tokens: halve the list this many times (100, 50, 25). */
const MAX_KEYTERM_RETRIES = 2;

type SessionPhase =
	| 'connecting'
	| 'configuring'
	| 'streaming'
	| 'finishing'
	| 'closed';

const ignoreRejection = (): void => undefined;

/**
 * Deepgram live transcription over one WebSocket. Each `Results` message with
 * `is_final: true` is committed text that Deepgram never revises, so it maps
 * to `final`; interim results map to `partial`. `Metadata`, which Deepgram
 * sends after `CloseStream`, resolves `finish()`. Keyterms travel in a
 * `Configure` message after the socket opens, never in the URL.
 */
export class DeepgramTranscriptionSession extends TranscriptionSession {
	readonly #socket: RealtimeSocket;
	readonly #options: Readonly<OpenTranscriptionOptions>;
	readonly #logger: WarningLogger;
	readonly #timeouts: Readonly<DeepgramTimeouts>;
	readonly #ready = Promise.withResolvers<void>();
	readonly #done = Promise.withResolvers<string>();
	#phase: SessionPhase = 'connecting';
	#finishing: Promise<string> | undefined;
	#keepAliveTimer: NodeJS.Timeout | undefined;
	#committedText = '';
	#isPartialShown = false;
	#sentKeytermCount = 0;
	#keytermRetryCount = 0;

	constructor(
		socket: RealtimeSocket,
		options: Readonly<OpenTranscriptionOptions>,
		logger: WarningLogger,
		timeouts: Readonly<DeepgramTimeouts> = DEFAULT_DEEPGRAM_TIMEOUTS
	) {
		super();
		this.#socket = socket;
		this.#options = options;
		this.#logger = logger;
		this.#timeouts = timeouts;
		this.#ready.promise.catch(ignoreRejection);
		this.#done.promise.catch(ignoreRejection);
		socket.onOpen(() => this.#handleOpen());
		socket.onMessage((raw) => this.#handleMessage(parseDeepgramMessage(raw)));
		socket.onError(() => this.#handleError());
		socket.onClose((code, reason) => this.#handleClose(code, reason));
	}

	async waitUntilReady(): Promise<void> {
		try {
			await withTimeout(
				this.#ready.promise,
				this.#timeouts.readyMs,
				() =>
					new TranscriptionProviderError(
						TranscriptionErrorCode.connectionFailed,
						'Timed out waiting for the Deepgram session to be ready'
					)
			);
		} catch (error) {
			this.abort();
			throw error;
		}
	}

	sendAudio(pcm: Uint8Array): void {
		if (this.#phase !== 'streaming') throw this.#notActiveError();
		if (pcm.byteLength === 0) return;
		this.#socket.send(pcm);
	}

	finish(): Promise<string> {
		this.#finishing ??= this.#startFinishing();
		return this.#finishing;
	}

	abort(): void {
		if (this.#phase === 'closed') return;
		this.#shutdown(
			new TranscriptionProviderError(
				TranscriptionErrorCode.sessionAborted,
				'Session aborted'
			)
		);
	}

	async #startFinishing(): Promise<string> {
		if (this.#phase === 'closed') return this.#done.promise;
		if (this.#phase !== 'streaming') throw this.#notActiveError();
		this.#phase = 'finishing';
		this.#stopKeepAlive();
		this.#sendJson({ type: 'CloseStream' });
		try {
			return await withTimeout(
				this.#done.promise,
				this.#timeouts.finishMs,
				() =>
					new TranscriptionProviderError(
						TranscriptionErrorCode.finishTimeout,
						'Timed out waiting for the final transcription'
					)
			);
		} catch (error) {
			if (error instanceof TranscriptionProviderError) this.#fail(error);
			throw error;
		}
	}

	#handleOpen(): void {
		if (this.#phase !== 'connecting') return;
		const { vocabulary = [] } = this.#options;
		if (vocabulary.length === 0) return this.#markReady();
		this.#phase = 'configuring';
		this.#sendKeyterms(vocabulary.slice(0, MAX_KEYTERMS));
	}

	#sendKeyterms(keyterms: readonly string[]): void {
		this.#sentKeytermCount = keyterms.length;
		this.#sendJson({ type: 'Configure', keyterms });
	}

	#handleMessage(message: DeepgramServerMessage): void {
		switch (message.type) {
			case 'configureSuccess':
				return this.#confirmConfiguration();
			case 'configureFailure':
				return this.#handleConfigureFailure(message.code);
			case 'results':
				return this.#mapResults(message.isFinal, message.transcript);
			case 'metadata':
				return this.#complete();
			case 'error':
				return this.#fail(
					new TranscriptionProviderError(
						TranscriptionErrorCode.providerRejected,
						`Deepgram rejected the session: ${message.reason}`
					)
				);
			case 'ignored':
				return;
		}
	}

	#confirmConfiguration(): void {
		if (this.#phase !== 'configuring') return;
		this.#markReady();
	}

	#handleConfigureFailure(code: string): void {
		if (this.#phase !== 'configuring') return;
		const keytermCount = this.#sentKeytermCount;
		this.#logger.warn({ code, keytermCount }, 'Deepgram rejected the keyterms');
		if (this.#canRetryWithFewerKeyterms(code)) return this.#retryWithHalf();
		this.#markReady();
	}

	#canRetryWithFewerKeyterms(code: string): boolean {
		return (
			code === KEYTERM_LIMIT_EXCEEDED_CODE &&
			this.#keytermRetryCount < MAX_KEYTERM_RETRIES
		);
	}

	#retryWithHalf(): void {
		this.#keytermRetryCount += 1;
		const { vocabulary = [] } = this.#options;
		const halfCount = Math.ceil(this.#sentKeytermCount / 2);
		this.#sendKeyterms(vocabulary.slice(0, halfCount));
	}

	#markReady(): void {
		this.#phase = 'streaming';
		this.#keepAliveTimer = setInterval(
			() => this.#sendJson({ type: 'KeepAlive' }),
			this.#timeouts.keepAliveIntervalMs
		);
		this.#keepAliveTimer.unref();
		this.#ready.resolve();
	}

	#mapResults(isFinal: boolean, transcript: string): void {
		const isReceivingAudio =
			this.#phase === 'streaming' || this.#phase === 'finishing';
		if (!isReceivingAudio) return;
		const text = transcript.trim();
		if (isFinal) return this.#commitFinal(text);
		if (text === '') return this.#clearPartial();
		this.#isPartialShown = true;
		this.emit('partial', { text: this.#withSeparator(text) });
	}

	#commitFinal(text: string): void {
		this.#clearPartial();
		if (text === '') return;
		this.emit('final', { text: this.#withSeparator(text) });
		this.#committedText += this.#withSeparator(text);
	}

	#clearPartial(): void {
		if (!this.#isPartialShown) return;
		this.#isPartialShown = false;
		this.emit('partial', { text: '' });
	}

	#withSeparator(text: string): string {
		return this.#committedText === '' ? text : WORD_SEPARATOR + text;
	}

	#complete(): void {
		if (this.#phase !== 'finishing') return;
		this.#phase = 'closed';
		this.#stopKeepAlive();
		this.#done.resolve(this.#committedText);
		this.#socket.close();
	}

	#handleError(): void {
		if (this.#phase === 'finishing') return;
		this.#failUnexpectedly();
	}

	#handleClose(code: number, reason: string): void {
		if (this.#phase === 'finishing') {
			this.#logger.warn(
				{ closeCode: code, closeReason: reason },
				'Deepgram closed the connection before its final metadata'
			);
			return this.#complete();
		}
		this.#failUnexpectedly();
	}

	#failUnexpectedly(): void {
		const isConnecting =
			this.#phase === 'connecting' || this.#phase === 'configuring';
		this.#fail(
			new TranscriptionProviderError(
				isConnecting
					? TranscriptionErrorCode.connectionFailed
					: TranscriptionErrorCode.connectionClosed,
				'Connection to the Deepgram session was lost'
			)
		);
	}

	#fail(error: TranscriptionProviderError): void {
		if (this.#phase === 'closed') return;
		this.#shutdown(error);
		this.reportError(error);
	}

	#shutdown(error: TranscriptionProviderError): void {
		this.#phase = 'closed';
		this.#stopKeepAlive();
		this.#ready.reject(error);
		this.#done.reject(error);
		this.#socket.close();
	}

	#stopKeepAlive(): void {
		clearInterval(this.#keepAliveTimer);
		this.#keepAliveTimer = undefined;
	}

	#notActiveError(): TranscriptionProviderError {
		return new TranscriptionProviderError(
			TranscriptionErrorCode.sessionNotActive,
			`Session is not accepting audio (${this.#phase})`
		);
	}

	#sendJson(message: Readonly<Record<string, unknown>>): void {
		this.#socket.send(JSON.stringify(message));
	}
}
