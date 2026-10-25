import { test } from '@japa/runner';

import { FakeRealtimeSocket } from '#tests/helpers/fake_realtime_socket';
import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import {
	type MistralTimeouts,
	MistralTranscriptionSession,
} from '#transcription/providers/mistral/mistral_transcription_session';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';

const FRENCH_OPTIONS: OpenTranscriptionOptions = { language: 'fr' };

const SHORT_TIMEOUT_MS = 20;
const SHORT_TIMEOUTS = {
	readyMs: SHORT_TIMEOUT_MS,
	finishMs: SHORT_TIMEOUT_MS,
};

function createSession(
	options: OpenTranscriptionOptions = FRENCH_OPTIONS,
	timeouts?: MistralTimeouts
) {
	const socket = new FakeRealtimeSocket();
	const session = new MistralTranscriptionSession(socket, options, timeouts);
	return { socket, session };
}

async function createReadySession(
	options?: OpenTranscriptionOptions,
	timeouts?: MistralTimeouts
) {
	const { socket, session } = createSession(options, timeouts);
	const ready = session.waitUntilReady();
	socket.receive({ type: 'session.created' });
	socket.receive({ type: 'session.updated' });
	await ready;
	return { socket, session };
}

function captureErrors(session: MistralTranscriptionSession) {
	const errors: TranscriptionProviderError[] = [];
	session.on('error', ({ error }) => errors.push(error));
	return errors;
}

test.group('MistralTranscriptionSession', () => {
	test('should send the session configuration first once the server created the session', async ({
		assert,
	}) => {
		const { socket } = await createReadySession();

		assert.deepEqual(socket.sent, [
			{
				type: 'session.update',
				session: {
					audio_format: { encoding: 'pcm_s16le', sample_rate: 16_000 },
					language: 'fr',
					target_streaming_delay_ms: 480,
				},
			},
		]);
	});

	test('should send the vocabulary as context bias', async ({ assert }) => {
		const { socket } = await createReadySession({
			language: 'fr',
			vocabulary: ['Adonis', 'Voxtral'],
		});

		assert.deepEqual(socket.sent[0]?.session, {
			audio_format: { encoding: 'pcm_s16le', sample_rate: 16_000 },
			language: 'fr',
			target_streaming_delay_ms: 480,
			context_bias: ['Adonis', 'Voxtral'],
		});
	});

	test('should append audio as base64 once the session is configured', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();

		session.sendAudio(new Uint8Array([1, 2, 3, 4]));

		assert.deepEqual(socket.sent.at(-1), {
			type: 'input_audio.append',
			audio: 'AQIDBA==',
		});
	});

	test('should reject audio before the session is configured', async ({
		assert,
	}) => {
		const { session } = createSession();

		assert.throws(
			() => session.sendAudio(new Uint8Array([1, 2])),
			/not accepting audio/
		);
	});

	test('should emit every delta as a final text and never a partial', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const finals: string[] = [];
		let partialCount = 0;
		session.on('final', ({ text }) => finals.push(text));
		session.on('partial', () => (partialCount += 1));

		socket.receive({ type: 'transcription.text.delta', text: 'Bonjour' });
		socket.receive({ type: 'transcription.text.delta', text: ' le monde' });

		assert.deepEqual(finals, ['Bonjour', ' le monde']);
		assert.equal(partialCount, 0);
	});

	test('should signal the end of audio and resolve the full text once the provider is done', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();

		const finishing = session.finish();
		socket.receive({ type: 'transcription.done', text: 'Bonjour le monde' });

		assert.equal(await finishing, 'Bonjour le monde');
		assert.deepEqual(socket.sent.at(-1), { type: 'input_audio.end' });
		assert.equal(socket.closeCount, 1);
	});

	test('should signal the end of audio only once when finishing twice', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();

		const first = session.finish();
		const second = session.finish();
		socket.receive({ type: 'transcription.done', text: 'Salut' });

		assert.equal(await first, 'Salut');
		assert.equal(await second, 'Salut');
		assert.equal(
			socket.sent.filter(({ type }) => type === 'input_audio.end').length,
			1
		);
	});

	test('should emit an error and reject finish when the provider reports an error', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);
		const finishing = session.finish();

		socket.receive({ type: 'error', error: { message: 'boom', code: 1 } });

		await assert.rejects(() => finishing, /Mistral rejected the session: boom/);
		assert.equal(errors[0]?.code, TranscriptionErrorCode.providerRejected);
		assert.equal(socket.closeCount, 1);
	});

	test('should emit an error and reject finish when the connection closes unexpectedly', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);
		const finishing = session.finish();

		socket.simulateClose();

		await assert.rejects(() => finishing, /Connection .* was lost/);
		assert.equal(errors[0]?.code, TranscriptionErrorCode.connectionClosed);
	});

	test('should fail to become ready when the connection fails before the session is created', async ({
		assert,
	}) => {
		const { socket, session } = createSession();
		const ready = session.waitUntilReady();

		socket.simulateError();

		await assert.rejects(() => ready, /Connection .* was lost/);
	});

	test('should fail to become ready and close when the provider never confirms the configuration', async ({
		assert,
	}) => {
		const { socket, session } = createSession(FRENCH_OPTIONS, SHORT_TIMEOUTS);
		const ready = session.waitUntilReady();
		socket.receive({ type: 'session.created' });

		await assert.rejects(() => ready, /Timed out waiting/);
		assert.equal(socket.closeCount, 1);
	});

	test('should reject finish with a timeout error when the provider never confirms', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession(
			FRENCH_OPTIONS,
			SHORT_TIMEOUTS
		);
		const errors = captureErrors(session);
		const finishing = session.finish();

		await assert.rejects(() => finishing, /Timed out waiting/);
		assert.equal(errors[0]?.code, TranscriptionErrorCode.finishTimeout);
		assert.equal(socket.closeCount, 1);
	});

	test('should close once and reject finish when aborted, however many times', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);

		session.abort();
		session.abort();

		await assert.rejects(() => session.finish(), /Session aborted/);
		assert.equal(socket.closeCount, 1);
		assert.lengthOf(errors, 0);
	});

	test('should ignore frames it does not understand', async ({ assert }) => {
		const { socket, session } = await createReadySession();
		const finals: string[] = [];
		session.on('final', ({ text }) => finals.push(text));

		socket.receiveRaw('not json');
		socket.receive({ type: 'turn.start', time_s: 1 });
		socket.receive({ type: 'transcription.text.delta' });

		assert.lengthOf(finals, 0);
	});
});
