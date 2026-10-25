import type { Logger } from '@adonisjs/core/logger';

import { DictationErrorCode } from '#dictation/dictation_error_code';
import { DICTATION_ERROR_MESSAGES } from '#dictation/dictation_error_messages';
import type { DictationListener } from '#dictation/dictation_listener';
import DictationNotActiveException from '#dictation/dictation_not_active_exception';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import type { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type { TranscriptionSession } from '#transcription/transcription_session';

const MAX_DICTATION_DURATION_MS = 10 * 60 * 1000;
const SECONDS_DECIMAL_FACTOR = 100;

type DictationPhase = 'created' | 'starting' | 'active' | 'finishing' | 'ended';
type DictationOutcome = 'completed' | 'timed_out' | 'cancelled' | 'failed';

const ignoreRejection = (): void => undefined;

/**
 * One dictation from the first audio to its end, over one provider session.
 * Counts the audio bytes received (the basis for the daily quota) and logs
 * duration, provider and outcome once at the end, never any text.
 */
export class Dictation {
	#phase: DictationPhase = 'created';
	#session: TranscriptionSession | undefined;
	#finishing: Promise<string> | undefined;
	#maxDurationTimer: NodeJS.Timeout | undefined;
	#receivedBytes = 0;

	constructor(
		private readonly provider: TranscriptionProvider,
		private readonly logger: Logger,
		private readonly listener: DictationListener,
		private readonly maxDurationMs = MAX_DICTATION_DURATION_MS
	) {}

	get isActive(): boolean {
		return this.#phase !== 'created' && this.#phase !== 'ended';
	}

	get receivedBytes(): number {
		return this.#receivedBytes;
	}

	async start(): Promise<void> {
		this.#phase = 'starting';
		const session = await this.#openSession();
		if (this.#hasEnded()) {
			session.abort();
			throw new DictationNotActiveException();
		}
		this.#listenTo(session);
		this.#session = session;
		this.#phase = 'active';
		this.#maxDurationTimer = setTimeout(
			() => this.#finishAtMaxDuration(session),
			this.maxDurationMs
		);
	}

	appendAudio(pcm: Uint8Array): void {
		if (this.#phase !== 'active' || !this.#session) {
			throw new DictationNotActiveException();
		}
		this.#receivedBytes += pcm.byteLength;
		this.#session.sendAudio(pcm);
	}

	stop(): Promise<string> {
		if (this.#finishing) return this.#finishing;
		if (this.#phase !== 'active' || !this.#session) {
			throw new DictationNotActiveException();
		}
		return this.#beginFinishing(this.#session, 'completed');
	}

	cancel(): void {
		this.#end('cancelled');
	}

	#hasEnded(): boolean {
		return this.#phase === 'ended';
	}

	async #openSession(): Promise<TranscriptionSession> {
		try {
			return await this.provider.open({ language: 'fr' });
		} catch (error) {
			this.#end('failed');
			throw error;
		}
	}

	#listenTo(session: TranscriptionSession): void {
		session.on('final', ({ text }) => this.listener.onFinal(text));
		session.on('partial', ({ text }) => this.listener.onPartial(text));
		session.on('error', ({ error }) => this.#reportProviderError(error));
	}

	#reportProviderError(error: TranscriptionProviderError): void {
		this.logger.warn(
			{ provider: this.provider.name, code: error.code },
			'Transcription provider error'
		);
		this.listener.onError({
			code: error.code,
			message: DICTATION_ERROR_MESSAGES[error.code],
		});
		this.#end('failed');
	}

	#finishAtMaxDuration(session: TranscriptionSession): void {
		if (this.#phase !== 'active') return;
		this.listener.onError({
			code: DictationErrorCode.tooLong,
			message: DICTATION_ERROR_MESSAGES[DictationErrorCode.tooLong],
		});
		this.#beginFinishing(session, 'timed_out').catch(ignoreRejection);
	}

	#beginFinishing(
		session: TranscriptionSession,
		outcome: DictationOutcome
	): Promise<string> {
		this.#phase = 'finishing';
		this.#finishing = this.#finish(session, outcome);
		return this.#finishing;
	}

	async #finish(
		session: TranscriptionSession,
		outcome: DictationOutcome
	): Promise<string> {
		try {
			const text = await session.finish();
			this.#end(outcome);
			return text;
		} catch (error) {
			this.#end('failed');
			throw error;
		}
	}

	#end(outcome: DictationOutcome): void {
		if (this.#phase === 'ended') return;
		this.#phase = 'ended';
		clearTimeout(this.#maxDurationTimer);
		this.#session?.abort();
		this.logger.info(
			{
				provider: this.provider.name,
				outcome,
				durationSeconds: this.#durationSeconds(),
			},
			'Dictation ended'
		);
	}

	#durationSeconds(): number {
		const seconds = this.#receivedBytes / PCM_AUDIO_FORMAT.bytesPerSecond;
		return (
			Math.round(seconds * SECONDS_DECIMAL_FACTOR) / SECONDS_DECIMAL_FACTOR
		);
	}
}
