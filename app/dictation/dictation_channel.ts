import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';
import { BaseChannel } from '@rlanz/socket';
import { onMessage } from '@rlanz/socket/decorators';
import type { AuthenticatedSocket } from '@rlanz/socket/types';

import { decodeAudioChunk } from '#dictation/decode_audio_chunk';
import { describeErrorForLog } from '#dictation/describe_error_for_log';
import type { Dictation } from '#dictation/dictation';
import DictationAlreadyActiveException from '#dictation/dictation_already_active_exception';
import { DictationErrorCode } from '#dictation/dictation_error_code';
import type { DictationListener } from '#dictation/dictation_listener';
import DictationNotActiveException from '#dictation/dictation_not_active_exception';
import type { DictationServerEvents } from '#dictation/dictation_server_events';
import { DictationService } from '#dictation/dictation_service';
import type { DictationTranscript } from '#dictation/dictation_transcript';
import type { DraftContext } from '#dictation/draft_context';
import { ensureDictationAccess } from '#dictation/ensure_dictation_access';
import { parseDraftContext } from '#dictation/parse_draft_context';
import { parsePreviewSettings } from '#dictation/parse_preview_settings';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type { PreviewSettings } from '#user_settings/preview_settings';
import type User from '#users/user';

/**
 * One channel per dictation (`dictation/<client-generated uuid>`): the
 * browser subscribes to a fresh id for each dictation, so transcript events
 * (which are channel broadcasts) reach only the tab that started it. The
 * container builds one instance per subscription, which owns that
 * subscription's dictation. Handlers acknowledge as soon as the request is
 * accepted: what takes time (opening the provider session, finishing and
 * cleaning the text) is reported later by `dictation:ready`,
 * `dictation:completed` or `transcript:error`, so no outcome depends on how
 * long the client is willing to wait for an acknowledgement.
 */
@inject()
export default class DictationChannel extends BaseChannel<
	User,
	DictationServerEvents
> {
	static pattern = 'dictation/:dictationId';
	static middlewares = [ensureDictationAccess];

	#dictation: Dictation | undefined;
	#isStarting = false;

	readonly #listener: DictationListener = {
		onPartial: (text) => this.broadcast('transcript:partial', { text }),
		onFinal: (text) => this.broadcast('transcript:final', { text }),
		onFinished: (text) => this.broadcast('transcript:finished', { text }),
		onError: (event) => this.broadcast('transcript:error', event),
	};

	constructor(
		private readonly dictationService: DictationService,
		private readonly logger: Logger
	) {
		super();
	}

	@onMessage('dictation:start')
	async start(
		socket: AuthenticatedSocket<User>,
		payload: DraftContext
	): Promise<void> {
		await this.#startOnce(async () => {
			const draft = await parseDraftContext(payload);
			return this.dictationService.create(
				socket.getUserOrFail().id,
				draft,
				this.#listener
			);
		});
	}

	/** Dictates with the given settings instead of the saved ones; nothing is saved. */
	@onMessage('dictation:preview')
	async startPreview(
		socket: AuthenticatedSocket<User>,
		payload: PreviewSettings
	): Promise<void> {
		await this.#startOnce(async () => {
			const settings = await parsePreviewSettings(payload);
			return this.dictationService.createPreview(
				socket.getUserOrFail().id,
				settings,
				this.#listener
			);
		});
	}

	@onMessage('dictation:audio')
	async appendAudio(
		_socket: AuthenticatedSocket<User>,
		payload: { chunk: string }
	): Promise<void> {
		const pcm = await decodeAudioChunk(payload);
		this.#requireDictation().appendAudio(pcm);
	}

	@onMessage('dictation:stop')
	async stop(_socket: AuthenticatedSocket<User>): Promise<void> {
		const completion = this.#requireDictation().stop();
		void this.#broadcastOutcome(completion);
	}

	@onMessage('dictation:cancel')
	async cancel(_socket: AuthenticatedSocket<User>): Promise<void> {
		this.#dictation?.cancel();
	}

	override async onLeave(): Promise<void> {
		this.#dictation?.cancel();
	}

	async #startOnce(createDictation: () => Promise<Dictation>): Promise<void> {
		if (this.#isStarting || this.#dictation?.isActive) {
			throw new DictationAlreadyActiveException();
		}
		this.#isStarting = true;
		try {
			const dictation = await createDictation();
			this.#dictation = dictation;
			void this.#openInBackground(dictation);
		} finally {
			this.#isStarting = false;
		}
	}

	async #openInBackground(dictation: Dictation): Promise<void> {
		try {
			await dictation.start();
		} catch (error) {
			this.#reportStartFailure(error);
			return;
		}
		this.broadcast('dictation:ready', {});
	}

	#reportStartFailure(error: unknown): void {
		if (error instanceof DictationNotActiveException) return;
		this.broadcast('transcript:error', { code: this.#toErrorCode(error) });
	}

	async #broadcastOutcome(
		completion: Promise<DictationTranscript>
	): Promise<void> {
		try {
			this.broadcast('dictation:completed', await completion);
		} catch (error) {
			if (!(error instanceof TranscriptionProviderError)) {
				this.logger.error(
					describeErrorForLog(error),
					'Dictation could not be completed'
				);
			}
			this.broadcast('transcript:error', { code: this.#toErrorCode(error) });
		}
	}

	#toErrorCode(error: unknown): DictationErrorCode {
		return error instanceof TranscriptionProviderError
			? error.code
			: DictationErrorCode.unavailable;
	}

	#requireDictation(): Dictation {
		if (!this.#dictation) throw new DictationNotActiveException();
		return this.#dictation;
	}
}
