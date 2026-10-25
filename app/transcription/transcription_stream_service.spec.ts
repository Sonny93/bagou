import { test } from '@japa/runner';

import { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import { TranscriptionStreamService } from '#transcription/transcription_stream_service';

const PARTIAL_LAST_CHUNK_BYTE_LENGTH = 1000;

class TalkativeSession extends FakeTranscriptionSession {
	override sendAudio(pcm: Uint8Array): void {
		super.sendAudio(pcm);
		if (this.sentAudio.length === 1) this.simulateFinal('Bonjour');
	}
}

class BrokenSession extends FakeTranscriptionSession {
	override sendAudio(): void {
		this.simulateError(
			new TranscriptionProviderError(
				TranscriptionErrorCode.connectionClosed,
				'lost'
			)
		);
		throw new TranscriptionProviderError(
			TranscriptionErrorCode.sessionNotActive,
			'closed'
		);
	}
}

const buildPcm = (): Uint8Array =>
	new Uint8Array(
		PCM_AUDIO_FORMAT.chunkByteLength * 2 + PARTIAL_LAST_CHUNK_BYTE_LENGTH
	);

test.group('TranscriptionStreamService', () => {
	test('should send the audio in 100 ms chunks, print finals as they arrive and report timings', async ({
		assert,
	}) => {
		const session = new TalkativeSession('Bonjour tout le monde');
		const service = new TranscriptionStreamService(
			new FakeTranscriptionProvider(session)
		);
		const finals: string[] = [];

		const result = await service.stream({
			pcm: buildPcm(),
			chunkIntervalMs: 0,
			onFinal: (text) => finals.push(text),
		});

		assert.deepEqual(
			session.sentAudio.map((chunk) => chunk.byteLength),
			[
				PCM_AUDIO_FORMAT.chunkByteLength,
				PCM_AUDIO_FORMAT.chunkByteLength,
				PARTIAL_LAST_CHUNK_BYTE_LENGTH,
			]
		);
		assert.deepEqual(finals, ['Bonjour']);
		assert.equal(result.text, 'Bonjour tout le monde');
		assert.isAtLeast(result.timeToFirstFinalMs ?? -1, 0);
		assert.isAtLeast(result.finishLatencyMs, 0);
		assert.equal(session.finishCount, 1);
		assert.equal(session.abortCount, 1);
	});

	test('should report no time to first final when the provider emitted none', async ({
		assert,
	}) => {
		const service = new TranscriptionStreamService(
			new FakeTranscriptionProvider(new FakeTranscriptionSession('silence'))
		);

		const result = await service.stream({
			pcm: buildPcm(),
			chunkIntervalMs: 0,
			onFinal: () => undefined,
		});

		assert.isUndefined(result.timeToFirstFinalMs);
	});

	test('should fail with the provider error that broke the session', async ({
		assert,
	}) => {
		const session = new BrokenSession();
		const service = new TranscriptionStreamService(
			new FakeTranscriptionProvider(session)
		);

		await assert.rejects(
			() =>
				service.stream({
					pcm: buildPcm(),
					chunkIntervalMs: 0,
					onFinal: () => undefined,
				}),
			'lost'
		);
		assert.equal(session.abortCount, 1);
	});
});
