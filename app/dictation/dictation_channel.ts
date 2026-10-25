import { inject } from '@adonisjs/core';
import { BaseChannel, SocketResponseError } from '@rlanz/socket';
import { onMessage } from '@rlanz/socket/decorators';
import type { AuthenticatedSocket } from '@rlanz/socket/types';

import { decodeAudioChunk } from '#dictation/decode_audio_chunk';
import type { Dictation } from '#dictation/dictation';
import DictationAlreadyActiveException from '#dictation/dictation_already_active_exception';
import DictationNotActiveException from '#dictation/dictation_not_active_exception';
import type { DictationServerEvents } from '#dictation/dictation_server_events';
import { DictationService } from '#dictation/dictation_service';
import DictationUnavailableException from '#dictation/dictation_unavailable_exception';
import { ensureDictationAccess } from '#dictation/ensure_dictation_access';
import type User from '#users/user';

/**
 * One channel per dictation (`dictation/<client-generated uuid>`): the
 * browser subscribes to a fresh id for each dictation, so transcript events
 * (which are channel broadcasts) reach only the tab that started it. The
 * container builds one instance per subscription, which owns that
 * subscription's dictation.
 */
@inject()
export default class DictationChannel extends BaseChannel<
	User,
	DictationServerEvents
> {
	static pattern = 'dictation/:dictationId';
	static middlewares = [ensureDictationAccess];

	#dictation: Dictation | undefined;

	constructor(private readonly dictationService: DictationService) {
		super();
	}

	@onMessage('dictation:start')
	async start(_socket: AuthenticatedSocket<User>): Promise<void> {
		if (this.#dictation?.isActive) throw new DictationAlreadyActiveException();
		const dictation = this.dictationService.create({
			onPartial: (text) => this.broadcast('transcript:partial', { text }),
			onFinal: (text) => this.broadcast('transcript:final', { text }),
			onError: (event) => this.broadcast('transcript:error', event),
		});
		this.#dictation = dictation;
		await this.#startOrFail(dictation);
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
	async stop(_socket: AuthenticatedSocket<User>): Promise<{ text: string }> {
		const text = await this.#requireDictation().stop();
		return { text };
	}

	@onMessage('dictation:cancel')
	async cancel(_socket: AuthenticatedSocket<User>): Promise<void> {
		this.#dictation?.cancel();
	}

	override async onLeave(): Promise<void> {
		this.#dictation?.cancel();
	}

	async #startOrFail(dictation: Dictation): Promise<void> {
		try {
			await dictation.start();
		} catch (error) {
			if (error instanceof SocketResponseError) throw error;
			throw new DictationUnavailableException();
		}
	}

	#requireDictation(): Dictation {
		if (!this.#dictation) throw new DictationNotActiveException();
		return this.#dictation;
	}
}
