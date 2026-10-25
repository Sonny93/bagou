import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import type { MistralServerMessage } from '#transcription/providers/mistral/mistral_server_message';
import { parseMistralMessage } from '#transcription/providers/mistral/parse_mistral_message';
import type { RealtimeSocket } from '#transcription/providers/mistral/realtime_socket';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import { TranscriptionSession } from '#transcription/transcription_session';
import { withTimeout } from '#transcription/with_timeout';

export type MistralTimeouts = {
	readyMs: number;
	finishMs: number;
};

const DEFAULT_MISTRAL_TIMEOUTS: MistralTimeouts = {
	readyMs: 10_000,
	finishMs: 10_000,
};
const STREAMING_DELAY_MS = 480;
const PCM_ENCODING = 'pcm_s16le';

type SessionPhase =
	| 'connecting'
	| 'configuring'
	| 'streaming'
	| 'finishing'
	| 'closed';

const ignoreRejection = (): void => undefined;

/**
 * Mistral Voxtral Realtime over one WebSocket. Every `transcription.text.delta`
 * is committed text that Mistral never revises, so it maps to `final`; this
 * adapter never emits `partial`. `transcription.done` resolves `finish()`.
 */
export class MistralTranscriptionSession extends TranscriptionSession {
	readonly #socket: RealtimeSocket;
	readonly #options: Readonly<OpenTranscriptionOptions>;
	readonly #timeouts: Readonly<MistralTimeouts>;
	readonly #ready = Promise.withResolvers<void>();
	readonly #done = Promise.withResolvers<string>();
	#phase: SessionPhase = 'connecting';
	#finishing: Promise<string> | undefined;

	constructor(
		socket: RealtimeSocket,
		options: Readonly<OpenTranscriptionOptions>,
		timeouts: Readonly<MistralTimeouts> = DEFAULT_MISTRAL_TIMEOUTS
	) {
		super();
		this.#timeouts = timeouts;
		this.#socket = socket;
		this.#options = options;
		this.#ready.promise.catch(ignoreRejection);
		this.#done.promise.catch(ignoreRejection);
		socket.onMessage((raw) => this.#handleMessage(parseMistralMessage(raw)));
		socket.onError(() => this.#failUnexpectedly());
		socket.onClose(() => this.#failUnexpectedly());
	}

	async waitUntilReady(): Promise<void> {
		try {
			await withTimeout(
				this.#ready.promise,
				this.#timeouts.readyMs,
				() =>
					new TranscriptionProviderError(
						TranscriptionErrorCode.connectionFailed,
						'Timed out waiting for the Mistral session to be ready'
					)
			);
		} catch (error) {
			this.abort();
			throw error;
		}
	}

	sendAudio(pcm: Uint8Array): void {
		if (this.#phase !== 'streaming') throw this.#notActiveError();
		const audio = Buffer.from(
			pcm.buffer,
			pcm.byteOffset,
			pcm.byteLength
		).toString('base64');
		this.#send({ type: 'input_audio.append', audio });
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
		this.#send({ type: 'input_audio.end' });
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

	#handleMessage(message: MistralServerMessage): void {
		switch (message.type) {
			case 'session.created':
				return this.#configure();
			case 'session.updated':
				return this.#markReady();
			case 'transcription.text.delta':
				return this.#commitText(message.text);
			case 'transcription.done':
				return this.#complete(message.text);
			case 'error':
				return this.#fail(
					new TranscriptionProviderError(
						TranscriptionErrorCode.providerRejected,
						`Mistral rejected the session: ${message.message}`
					)
				);
			case 'ignored':
				return;
		}
	}

	#configure(): void {
		if (this.#phase !== 'connecting') return;
		this.#phase = 'configuring';
		const { language, vocabulary = [] } = this.#options;
		this.#send({
			type: 'session.update',
			session: {
				audio_format: {
					encoding: PCM_ENCODING,
					sample_rate: PCM_AUDIO_FORMAT.sampleRateHz,
				},
				language,
				target_streaming_delay_ms: STREAMING_DELAY_MS,
				...(vocabulary.length > 0 && { context_bias: vocabulary }),
			},
		});
	}

	#markReady(): void {
		if (this.#phase !== 'configuring') return;
		this.#phase = 'streaming';
		this.#ready.resolve();
	}

	#commitText(text: string): void {
		const isReceivingAudio =
			this.#phase === 'streaming' || this.#phase === 'finishing';
		if (!isReceivingAudio || text === '') return;
		this.emit('final', { text });
	}

	#complete(text: string): void {
		if (this.#phase !== 'finishing') return;
		this.#phase = 'closed';
		this.#done.resolve(text);
		this.#socket.close();
	}

	#failUnexpectedly(): void {
		const code =
			this.#phase === 'connecting'
				? TranscriptionErrorCode.connectionFailed
				: TranscriptionErrorCode.connectionClosed;
		this.#fail(
			new TranscriptionProviderError(
				code,
				'Connection to the Mistral session was lost'
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
		this.#ready.reject(error);
		this.#done.reject(error);
		this.#socket.close();
	}

	#notActiveError(): TranscriptionProviderError {
		return new TranscriptionProviderError(
			TranscriptionErrorCode.sessionNotActive,
			`Session is not accepting audio (${this.#phase})`
		);
	}

	#send(message: Readonly<Record<string, unknown>>): void {
		this.#socket.send(JSON.stringify(message));
	}
}
