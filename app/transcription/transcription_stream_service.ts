import { inject } from '@adonisjs/core';
import { setTimeout as sleep } from 'node:timers/promises';

import type { DictationLanguage } from '#shared/dictation_language';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type { TranscriptionSession } from '#transcription/transcription_session';
import type { TranscriptionStreamResult } from '#transcription/transcription_stream_result';

export type StreamOptions = {
	language: DictationLanguage;
	pcm: Uint8Array;
	chunkIntervalMs: number;
	onFinal: (text: string) => void;
};

/**
 * Streams recorded audio through the transcription port as if it were live:
 * 100 ms chunks, one per `chunkIntervalMs`. Used by the dev command and meant
 * to be reused by the provider benchmark.
 */
@inject()
export class TranscriptionStreamService {
	constructor(private readonly provider: TranscriptionProvider) {}

	async stream(
		options: Readonly<StreamOptions>
	): Promise<TranscriptionStreamResult> {
		const session = await this.provider.open({ language: options.language });
		const streamStartedAt = performance.now();
		let timeToFirstFinalMs: number | undefined;
		session.on('final', ({ text }) => {
			timeToFirstFinalMs ??= performance.now() - streamStartedAt;
			options.onFinal(text);
		});
		let providerError: TranscriptionProviderError | undefined;
		session.on('error', ({ error }) => {
			providerError = error;
		});

		try {
			await this.#sendInChunks(session, options);
			const endOfAudioAt = performance.now();
			const text = await session.finish();
			return {
				text,
				timeToFirstFinalMs,
				finishLatencyMs: performance.now() - endOfAudioAt,
			};
		} catch (error) {
			throw providerError ?? error;
		} finally {
			session.abort();
		}
	}

	async #sendInChunks(
		session: TranscriptionSession,
		{ pcm, chunkIntervalMs }: Readonly<StreamOptions>
	): Promise<void> {
		const { chunkByteLength } = PCM_AUDIO_FORMAT;
		for (let start = 0; start < pcm.byteLength; start += chunkByteLength) {
			session.sendAudio(pcm.subarray(start, start + chunkByteLength));
			await sleep(chunkIntervalMs);
		}
	}
}
