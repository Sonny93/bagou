import { test } from '@japa/runner';
import { setTimeout as sleep } from 'node:timers/promises';

import { Dictation } from '#dictation/dictation';
import { DictationErrorCode } from '#dictation/dictation_error_code';
import type { DictationErrorEvent } from '#dictation/dictation_error_event';
import { DictationService } from '#dictation/dictation_service';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type { TranscriptionSession } from '#transcription/transcription_session';

const SHORT_MAX_DURATION_MS = 20;

function createDictation(
	provider: TranscriptionProvider = new FakeTranscriptionProvider(),
	maxDurationMs?: number
) {
	const { logger, lines } = createRecordingLogger();
	const partials: string[] = [];
	const finals: string[] = [];
	const errors: DictationErrorEvent[] = [];
	const dictation = new Dictation(
		provider,
		logger,
		{
			onPartial: (text) => partials.push(text),
			onFinal: (text) => finals.push(text),
			onError: (event) => errors.push(event),
		},
		maxDurationMs
	);
	return { dictation, lines, partials, finals, errors };
}

const readLogs = (lines: readonly string[]): Record<string, unknown>[] =>
	lines.map((line) => JSON.parse(line));

class DeferredProvider extends TranscriptionProvider {
	readonly name = 'deferred';
	readonly session = new FakeTranscriptionSession();
	openingResolver: (session: TranscriptionSession) => void = () => undefined;

	open(
		_options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession> {
		return new Promise((resolve) => {
			this.openingResolver = resolve;
		});
	}
}

test.group('Dictation', () => {
	test('should open a French session when started', async ({ assert }) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation } = createDictation(provider);

		await dictation.start();

		assert.deepEqual(provider.openedWith, [{ language: 'fr' }]);
		assert.isTrue(dictation.isActive);
	});

	test('should relay finals and partials of the session to the listener', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation, finals, partials } = createDictation(provider);
		await dictation.start();

		provider.session.simulateFinal('Bonjour');
		provider.session.simulatePartial(' le mon');

		assert.deepEqual(finals, ['Bonjour']);
		assert.deepEqual(partials, [' le mon']);
	});

	test('should forward audio to the session and count the received bytes', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation } = createDictation(provider);
		await dictation.start();

		dictation.appendAudio(new Uint8Array(3200));
		dictation.appendAudio(new Uint8Array(1600));

		assert.lengthOf(provider.session.sentAudio, 2);
		assert.equal(dictation.receivedBytes, 4800);
	});

	test('should resolve the full text on stop and log the duration, provider and outcome without any text', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte secret')
		);
		const { dictation, lines } = createDictation(provider);
		await dictation.start();
		dictation.appendAudio(new Uint8Array(PCM_AUDIO_FORMAT.bytesPerSecond * 2));

		const text = await dictation.stop();

		assert.equal(text, 'texte secret');
		const logs = readLogs(lines);
		assert.lengthOf(logs, 1);
		assert.include(logs[0], {
			provider: 'fake',
			outcome: 'completed',
			durationSeconds: 2,
		});
		assert.notInclude(lines.join(''), 'secret');
		assert.isFalse(dictation.isActive);
	});

	test('should reject audio once stopped', async ({ assert }) => {
		const { dictation } = createDictation();
		await dictation.start();
		await dictation.stop();

		assert.throws(
			() => dictation.appendAudio(new Uint8Array(2)),
			/Aucune dictée/
		);
	});

	test('should tell the listener a safe French message when the provider fails', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation, errors, lines } = createDictation(provider);
		await dictation.start();

		provider.session.simulateError(
			new TranscriptionProviderError(
				TranscriptionErrorCode.connectionClosed,
				'socket hang up with internal details'
			)
		);

		assert.deepEqual(errors, [
			{
				code: TranscriptionErrorCode.connectionClosed,
				message: 'La connexion au service de transcription a été interrompue.',
			},
		]);
		assert.equal(provider.session.abortCount, 1);
		assert.isFalse(dictation.isActive);
		assert.include(readLogs(lines).at(-1), { outcome: 'failed' });
	});

	test('should log the provider and error code, never the message, when the provider cannot open', async ({
		assert,
	}) => {
		const openError = new TranscriptionProviderError(
			TranscriptionErrorCode.connectionFailed,
			'secret provider text'
		);
		const provider = new FakeTranscriptionProvider(undefined, openError);
		const { dictation, lines } = createDictation(provider);

		await assert.rejects(() => dictation.start());

		assert.include(readLogs(lines).at(-2), {
			provider: provider.name,
			code: TranscriptionErrorCode.connectionFailed,
		});
		assert.notInclude(lines.join(''), 'secret provider text');
	});

	test('should abort the session once when cancelled twice', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation, lines } = createDictation(provider);
		await dictation.start();

		dictation.cancel();
		dictation.cancel();

		assert.equal(provider.session.abortCount, 1);
		const logs = readLogs(lines);
		assert.lengthOf(logs, 1);
		assert.include(logs[0], { outcome: 'cancelled' });
	});

	test('should fail to start and log it when the provider cannot open', async ({
		assert,
	}) => {
		const openError = new TranscriptionProviderError(
			TranscriptionErrorCode.connectionFailed,
			'unreachable'
		);
		const provider = new FakeTranscriptionProvider(undefined, openError);
		const { dictation, lines } = createDictation(provider);

		await assert.rejects(() => dictation.start(), /unreachable/);

		assert.isFalse(dictation.isActive);
		assert.include(readLogs(lines).at(-1), { outcome: 'failed' });
	});

	test('should abort a session that opens after the dictation was cancelled', async ({
		assert,
	}) => {
		const provider = new DeferredProvider();
		const { dictation } = createDictation(provider);
		const starting = dictation.start();

		dictation.cancel();
		provider.openingResolver(provider.session);

		await assert.rejects(() => starting, /Aucune dictée/);
		assert.equal(provider.session.abortCount, 1);
	});

	test('should finish by itself with an error event at the maximum duration, keeping the text available to stop', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte long')
		);
		const { dictation, errors, lines } = createDictation(
			provider,
			SHORT_MAX_DURATION_MS
		);
		await dictation.start();

		await sleep(SHORT_MAX_DURATION_MS * 3);

		assert.deepEqual(
			errors.map(({ code }) => code),
			[DictationErrorCode.tooLong]
		);
		assert.equal(await dictation.stop(), 'texte long');
		assert.equal(provider.session.finishCount, 1);
		assert.include(readLogs(lines).at(-1), { outcome: 'timed_out' });
	});
});

test.group('DictationService', () => {
	test('should create a dictation on the injected provider that is not started yet', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { logger } = createRecordingLogger();
		const service = new DictationService(provider, logger);

		const dictation = service.create({
			onPartial: () => undefined,
			onFinal: () => undefined,
			onError: () => undefined,
		});

		assert.isFalse(dictation.isActive);
		await dictation.start();
		assert.lengthOf(provider.openedWith, 1);
	});
});
