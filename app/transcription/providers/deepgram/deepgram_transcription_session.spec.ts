import { test } from '@japa/runner';
import { setTimeout as sleep } from 'node:timers/promises';

import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FakeRealtimeSocket } from '#tests/helpers/fake_realtime_socket';
import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import {
	MAX_KEYTERMS,
	type DeepgramTimeouts,
	DeepgramTranscriptionSession,
} from '#transcription/providers/deepgram/deepgram_transcription_session';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';

const FRENCH_OPTIONS: OpenTranscriptionOptions = { language: 'fr' };
const SECRET_TERM = 'Zyphorra-keyterm';
const SECRET_TEXT = 'confidential-dictated-sentence';

const SHORT_INTERVAL_MS = 15;
const SHORT_TIMEOUTS: DeepgramTimeouts = {
	readyMs: 20,
	finishMs: 20,
	keepAliveIntervalMs: SHORT_INTERVAL_MS,
};
const LONG_TIMEOUTS: DeepgramTimeouts = {
	readyMs: 5000,
	finishMs: 5000,
	keepAliveIntervalMs: 5000,
};

function buildResults(transcript: string, isFinal: boolean) {
	return {
		type: 'Results',
		is_final: isFinal,
		channel: { alternatives: [{ transcript }] },
	};
}

function createSession(
	options: OpenTranscriptionOptions = FRENCH_OPTIONS,
	timeouts: DeepgramTimeouts = LONG_TIMEOUTS
) {
	const socket = new FakeRealtimeSocket();
	const { logger, lines } = createRecordingLogger();
	const session = new DeepgramTranscriptionSession(
		socket,
		options,
		logger,
		timeouts
	);
	return { socket, session, lines };
}

async function createReadySession(
	options?: OpenTranscriptionOptions,
	timeouts?: DeepgramTimeouts
) {
	const created = createSession(options, timeouts);
	const ready = created.session.waitUntilReady();
	created.socket.simulateOpen();
	if (options?.vocabulary?.length) {
		created.socket.receive({ type: 'ConfigureSuccess' });
	}
	await ready;
	return created;
}

function captureErrors(session: DeepgramTranscriptionSession) {
	const errors: TranscriptionProviderError[] = [];
	session.on('error', ({ error }) => errors.push(error));
	return errors;
}

function captureEvents(session: DeepgramTranscriptionSession) {
	const events: { type: 'final' | 'partial'; text: string }[] = [];
	session.on('final', ({ text }) => events.push({ type: 'final', text }));
	session.on('partial', ({ text }) => events.push({ type: 'partial', text }));
	return events;
}

function countKeepAlives(socket: FakeRealtimeSocket): number {
	return socket.sent.filter(({ type }) => type === 'KeepAlive').length;
}

test.group('DeepgramTranscriptionSession ready', () => {
	test('should be ready on open and send nothing when there are no terms', async ({
		assert,
	}) => {
		const { socket } = await createReadySession();

		assert.deepEqual(socket.sent, []);
	});

	test('should send the terms as a Configure message and be ready on ConfigureSuccess', async ({
		assert,
	}) => {
		const { socket, session } = createSession({
			language: 'fr',
			vocabulary: ['Adonis', 'Voxtral'],
		});
		let isReady = false;
		const ready = session.waitUntilReady().then(() => {
			isReady = true;
		});

		socket.simulateOpen();
		await Promise.resolve();
		assert.isFalse(isReady);
		socket.receive({ type: 'ConfigureSuccess' });
		await ready;

		assert.deepEqual(socket.sent, [
			{ type: 'Configure', keyterms: ['Adonis', 'Voxtral'] },
		]);
	});

	test('should become ready and warn with the code only when Configure fails', async ({
		assert,
	}) => {
		const { socket, session, lines } = createSession({
			language: 'fr',
			vocabulary: [SECRET_TERM],
		});
		const ready = session.waitUntilReady();

		socket.simulateOpen();
		socket.receive({
			type: 'ConfigureFailure',
			code: 'CONFIGURE_FAILED',
			description: SECRET_TERM,
		});
		await ready;

		assert.lengthOf(lines, 1);
		assert.include(lines[0], 'CONFIGURE_FAILED');
		assert.notInclude(lines[0], SECRET_TERM);
	});

	test('should fail with connectionFailed and close the socket when not ready in time', async ({
		assert,
	}) => {
		const { socket, session } = createSession(FRENCH_OPTIONS, SHORT_TIMEOUTS);

		const error = await session.waitUntilReady().catch((caught) => caught);

		assert.instanceOf(error, TranscriptionProviderError);
		assert.equal(error.code, TranscriptionErrorCode.connectionFailed);
		assert.equal(socket.closeCount, 1);
	});

	test('should fail with connectionFailed when the socket closes before opening', async ({
		assert,
	}) => {
		const { socket, session } = createSession();
		const ready = session.waitUntilReady();

		socket.simulateClose();

		const error = await ready.catch((caught) => caught);
		assert.equal(error.code, TranscriptionErrorCode.connectionFailed);
	});

	test('should fail with connectionFailed when the socket closes while configuring', async ({
		assert,
	}) => {
		const { socket, session } = createSession({
			language: 'fr',
			vocabulary: ['Adonis'],
		});
		const ready = session.waitUntilReady();
		socket.simulateOpen();

		socket.simulateError();

		const error = await ready.catch((caught) => caught);
		assert.equal(error.code, TranscriptionErrorCode.connectionFailed);
	});
});

function buildTerms(count: number): string[] {
	return Array.from({ length: count }, (_unused, index) => `term-${index}`);
}

function limitExceeded() {
	return { type: 'ConfigureFailure', code: 'CONFIGURE_KEYTERM_LIMIT_EXCEEDED' };
}

function configureKeyterms(socket: FakeRealtimeSocket): unknown[] {
	return socket.sent
		.filter(({ type }) => type === 'Configure')
		.map(({ keyterms }) => keyterms);
}

test.group('DeepgramTranscriptionSession keyterm limits', () => {
	test('should send at most the first 100 terms when given more', async ({
		assert,
	}) => {
		const terms = buildTerms(MAX_KEYTERMS + 50);
		const { socket, session } = createSession({
			language: 'fr',
			vocabulary: terms,
		});
		void session.waitUntilReady();

		socket.simulateOpen();

		assert.deepEqual(configureKeyterms(socket), [terms.slice(0, MAX_KEYTERMS)]);
	});

	test('should retry with half the terms on a limit failure and be ready on the next success', async ({
		assert,
	}) => {
		const terms = buildTerms(MAX_KEYTERMS);
		const { socket, session } = createSession({
			language: 'fr',
			vocabulary: terms,
		});
		const ready = session.waitUntilReady();
		socket.simulateOpen();

		socket.receive(limitExceeded());
		socket.receive({ type: 'ConfigureSuccess' });
		await ready;

		assert.deepEqual(configureKeyterms(socket), [terms, terms.slice(0, 50)]);
	});

	test('should become ready without keyterms and warn after two limit retries', async ({
		assert,
	}) => {
		const terms = buildTerms(MAX_KEYTERMS);
		const { socket, session, lines } = createSession({
			language: 'fr',
			vocabulary: terms,
		});
		const ready = session.waitUntilReady();
		socket.simulateOpen();

		socket.receive(limitExceeded());
		socket.receive(limitExceeded());
		socket.receive(limitExceeded());
		await ready;

		assert.deepEqual(
			configureKeyterms(socket).map(
				(keyterms) => (keyterms as string[]).length
			),
			[100, 50, 25]
		);
		assert.lengthOf(lines, 3);
		assert.include(lines[2], '"keytermCount":25');
	});

	test('should not retry on another failure code', async ({ assert }) => {
		const { socket, session } = createSession({
			language: 'fr',
			vocabulary: buildTerms(10),
		});
		const ready = session.waitUntilReady();
		socket.simulateOpen();

		socket.receive({
			type: 'ConfigureFailure',
			code: 'CONFIGURE_ALREADY_PENDING',
		});
		await ready;

		assert.lengthOf(configureKeyterms(socket), 1);
	});

	test('should never put a term in a warning', async ({ assert }) => {
		const { socket, session, lines } = createSession({
			language: 'fr',
			vocabulary: [SECRET_TERM, 'other-secret'],
		});
		const ready = session.waitUntilReady();
		socket.simulateOpen();

		socket.receive(limitExceeded());
		socket.receive(limitExceeded());
		socket.receive(limitExceeded());
		await ready;

		assert.isAbove(lines.length, 0);
		assert.isTrue(
			lines.every(
				(line) => !line.includes(SECRET_TERM) && !line.includes('other-secret')
			)
		);
	});
});

test.group('DeepgramTranscriptionSession audio', () => {
	test('should send the chunk as a binary frame of its exact bytes', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();

		session.sendAudio(new Uint8Array([1, 2, 3, 4]));

		assert.deepEqual(
			socket.sentBinary.map((frame) => [...frame]),
			[[1, 2, 3, 4]]
		);
	});

	test('should send only the bytes of a view with a non-zero offset', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const pool = new Uint8Array([9, 9, 1, 2, 3, 9, 9]);

		session.sendAudio(pool.subarray(2, 5));

		assert.deepEqual([...(socket.sentBinary[0] ?? [])], [1, 2, 3]);
	});

	test('should skip a zero-length chunk', async ({ assert }) => {
		const { socket, session } = await createReadySession();

		session.sendAudio(new Uint8Array(0));

		assert.lengthOf(socket.sentBinary, 0);
	});

	test('should refuse audio before the session is ready', ({ assert }) => {
		const { session } = createSession();

		assert.throws(
			() => session.sendAudio(new Uint8Array([1])),
			/not accepting/
		);
	});

	test('should refuse audio once finishing started', async ({ assert }) => {
		const { session } = await createReadySession();
		void session.finish();

		try {
			session.sendAudio(new Uint8Array([1]));
			assert.fail('sendAudio should have thrown');
		} catch (error) {
			assert.equal(
				(error as TranscriptionProviderError).code,
				TranscriptionErrorCode.sessionNotActive
			);
		}
	});

	test('should refuse audio after abort', async ({ assert }) => {
		const { session } = await createReadySession();
		session.abort();

		assert.throws(
			() => session.sendAudio(new Uint8Array([1])),
			/not accepting/
		);
	});
});

test.group('DeepgramTranscriptionSession keep-alive', () => {
	test('should send KeepAlive periodically once ready', async ({ assert }) => {
		const { socket } = await createReadySession(
			undefined,
			SHORT_TIMEOUTS_LONG()
		);

		await sleep(SHORT_INTERVAL_MS * 4);

		assert.isAtLeast(countKeepAlives(socket), 2);
	});

	test('should stop sending KeepAlive once finishing started', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession(
			undefined,
			SHORT_TIMEOUTS_LONG()
		);
		void session.finish();
		const countAtFinish = countKeepAlives(socket);

		await sleep(SHORT_INTERVAL_MS * 4);

		assert.equal(countKeepAlives(socket), countAtFinish);
	});

	test('should stop sending KeepAlive after abort', async ({ assert }) => {
		const { socket, session } = await createReadySession(
			undefined,
			SHORT_TIMEOUTS_LONG()
		);
		session.abort();
		const countAtAbort = countKeepAlives(socket);

		await sleep(SHORT_INTERVAL_MS * 4);

		assert.equal(countKeepAlives(socket), countAtAbort);
	});
});

function SHORT_TIMEOUTS_LONG(): DeepgramTimeouts {
	return { ...LONG_TIMEOUTS, keepAliveIntervalMs: SHORT_INTERVAL_MS };
}

test.group('DeepgramTranscriptionSession transcripts', () => {
	test('should emit finals with a leading space once text was committed', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const events = captureEvents(session);

		socket.receive(buildResults('Bonjour', true));
		socket.receive(buildResults('tout le monde.', true));

		assert.deepEqual(events, [
			{ type: 'final', text: 'Bonjour' },
			{ type: 'final', text: ' tout le monde.' },
		]);
	});

	test('should emit a partial with the same spacing rule and clear it on the final', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const events = captureEvents(session);

		socket.receive(buildResults('Bonjour', true));
		socket.receive(buildResults('tout', false));
		socket.receive(buildResults('tout le monde', true));

		assert.deepEqual(events, [
			{ type: 'final', text: 'Bonjour' },
			{ type: 'partial', text: ' tout' },
			{ type: 'partial', text: '' },
			{ type: 'final', text: ' tout le monde' },
		]);
	});

	test('should clear a shown partial when an empty final arrives', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const events = captureEvents(session);

		socket.receive(buildResults('bonj', false));
		socket.receive(buildResults('', true));

		assert.deepEqual(events, [
			{ type: 'partial', text: 'bonj' },
			{ type: 'partial', text: '' },
		]);
	});

	test('should clear a shown partial when an empty interim arrives', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const events = captureEvents(session);

		socket.receive(buildResults('bonj', false));
		socket.receive(buildResults('', false));

		assert.deepEqual(events, [
			{ type: 'partial', text: 'bonj' },
			{ type: 'partial', text: '' },
		]);
	});

	test('should emit nothing for empty or whitespace-only transcripts when no partial is shown', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const events = captureEvents(session);

		socket.receive(buildResults('', true));
		socket.receive(buildResults('   ', true));
		socket.receive(buildResults(' \n', false));

		assert.deepEqual(events, []);
	});

	test('should ignore results received before the session is ready', ({
		assert,
	}) => {
		const { socket, session } = createSession();
		const events = captureEvents(session);

		socket.receive(buildResults('too early', true));

		assert.deepEqual(events, []);
	});
});

test.group('DeepgramTranscriptionSession finish', () => {
	test('should send CloseStream and resolve with the full text on Metadata', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		socket.receive(buildResults('Bonjour', true));
		socket.receive(buildResults('tout le monde.', true));

		const finishing = session.finish();
		socket.receive(buildResults('Merci.', true));
		socket.receive({ type: 'Metadata' });

		assert.equal(await finishing, 'Bonjour tout le monde. Merci.');
		assert.deepEqual(socket.sent.at(-1), { type: 'CloseStream' });
		assert.equal(socket.closeCount, 1);
	});

	test('should send CloseStream once when finish is called twice', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();

		const first = session.finish();
		const second = session.finish();
		socket.receive({ type: 'Metadata' });

		assert.strictEqual(first, second);
		await first;
		assert.equal(
			socket.sent.filter(({ type }) => type === 'CloseStream').length,
			1
		);
	});

	test('should resolve with the committed text and warn with code and reason when closed before Metadata', async ({
		assert,
	}) => {
		const { socket, session, lines } = await createReadySession();
		socket.receive(buildResults(SECRET_TEXT, true));

		const finishing = session.finish();
		socket.simulateClose(1011, 'NET-0001');

		assert.equal(await finishing, SECRET_TEXT);
		assert.lengthOf(lines, 1);
		assert.include(lines[0], '1011');
		assert.include(lines[0], 'NET-0001');
		assert.notInclude(lines[0], SECRET_TEXT);
	});

	test('should resolve with the committed text when an error precedes the close', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);
		socket.receive(buildResults('Bonjour', true));

		const finishing = session.finish();
		socket.simulateError();
		socket.simulateClose(1006, '');

		assert.equal(await finishing, 'Bonjour');
		assert.lengthOf(errors, 0);
	});

	test('should reject with finishTimeout when Metadata never comes', async ({
		assert,
	}) => {
		const { session } = await createReadySession(undefined, {
			...SHORT_TIMEOUTS,
			readyMs: 5000,
			keepAliveIntervalMs: 5000,
		});

		const error = await session.finish().catch((caught) => caught);

		assert.equal(error.code, TranscriptionErrorCode.finishTimeout);
	});

	test('should reject finish with sessionNotActive before the session is ready', async ({
		assert,
	}) => {
		const { session } = createSession();

		const error = await session.finish().catch((caught) => caught);

		assert.equal(error.code, TranscriptionErrorCode.sessionNotActive);
	});
});

test.group('DeepgramTranscriptionSession failures', () => {
	test('should emit connectionClosed when the socket closes while streaming', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);

		socket.simulateClose(1011, 'NET-0001');

		assert.equal(errors[0]?.code, TranscriptionErrorCode.connectionClosed);
	});

	test('should emit a single connectionClosed when the socket errors then closes while streaming', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);

		socket.simulateError();
		socket.simulateClose();

		assert.lengthOf(errors, 1);
		assert.equal(errors[0]?.code, TranscriptionErrorCode.connectionClosed);
	});

	test('should emit providerRejected on an Error message without echoing its message', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);

		socket.receive({
			type: 'Error',
			variant: 'SchemaError',
			description: `invalid value ${SECRET_TERM}`,
			message: `{"keyterms":["${SECRET_TERM}"]}`,
		});

		assert.equal(errors[0]?.code, TranscriptionErrorCode.providerRejected);
		assert.include(errors[0]?.message ?? '', 'SchemaError');
		assert.notInclude(errors[0]?.message ?? '', SECRET_TERM);
	});

	test('should reject a pending finish with the same error as the emitted one', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();
		const errors = captureErrors(session);
		const finishing = session.finish();

		socket.receive({ type: 'Error', variant: 'boom' });

		await assert.rejects(() => finishing, /boom/);
		assert.lengthOf(errors, 1);
	});

	test('should emit sessionAborted state only once when aborted twice', async ({
		assert,
	}) => {
		const { socket, session } = await createReadySession();

		session.abort();
		session.abort();

		assert.equal(socket.closeCount, 1);
	});

	test('should reject a finish started after abort with sessionAborted', async ({
		assert,
	}) => {
		const { session } = await createReadySession();
		session.abort();

		const error = await session.finish().catch((caught) => caught);

		assert.equal(error.code, TranscriptionErrorCode.sessionAborted);
	});

	test('should never log the transcript text', async ({ assert }) => {
		const { socket, session, lines } = await createReadySession();
		socket.receive(buildResults(SECRET_TEXT, false));
		socket.receive(buildResults(SECRET_TEXT, true));
		const finishing = session.finish();
		socket.simulateClose(1000, 'bye');
		await finishing;

		assert.isTrue(lines.every((line) => !line.includes(SECRET_TEXT)));
	});
});
