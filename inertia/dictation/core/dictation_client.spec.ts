import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	COMPLETION_TIMEOUT_MS,
	DictationClient,
	MAX_BUFFERED_FRAMES,
	READY_TIMEOUT_MS,
} from './dictation_client';
import type { DictationClientListener } from './dictation_client';
import type { DictationClientError } from './dictation_client_error';
import { FakeDictationTransport } from './fake_dictation_transport';

const DICTATION_ID = 'dictation-1';
const FRAME = new Uint8Array([1, 0, 2, 0]);
const DRAFT_CONTEXT = {
	draftId: 'draft-1',
	textBefore: 'Avant.',
	textAfter: 'Après.',
};
const DRAFT_REQUEST = { kind: 'draft', context: DRAFT_CONTEXT } as const;
const PREVIEW_REQUEST = {
	kind: 'preview',
	settings: {
		dictationLanguage: 'fr',
		vocabulary: ['Adonis'],
		cleanupInstructions: 'Use bullet points',
	},
} as const;
const FRAME_BASE64 = 'AQACAA==';

function createClient(transport = new FakeDictationTransport()) {
	const partials: string[] = [];
	const finals: string[] = [];
	const finisheds: string[] = [];
	const errors: DictationClientError[] = [];
	const listener: DictationClientListener = {
		onPartial: (text) => partials.push(text),
		onFinal: (text) => finals.push(text),
		onFinished: (text) => finisheds.push(text),
		onError: (error) => errors.push(error),
	};
	const client = new DictationClient(transport, listener, () => DICTATION_ID);
	return { client, transport, partials, finals, finisheds, errors };
}

describe('DictationClient', () => {
	it('should connect, join the dictation channel and start it', async () => {
		const { client, transport } = createClient();

		await client.start(DRAFT_REQUEST);

		expect(transport.joinedId).toBe(DICTATION_ID);
		expect(transport.calls).toEqual(['connect', 'start']);
	});

	it('should hand the draft context to the server when starting', async () => {
		const { client, transport } = createClient();

		await client.start(DRAFT_REQUEST);

		expect(transport.startRequest).toEqual(DRAFT_REQUEST);
	});

	it('should hand the preview settings to the server when starting a preview', async () => {
		const { client, transport } = createClient();

		await client.start(PREVIEW_REQUEST);

		expect(transport.startRequest).toEqual(PREVIEW_REQUEST);
	});

	it('should send audio as base64 once started', async () => {
		const { client, transport } = createClient();
		await client.start(DRAFT_REQUEST);

		client.sendAudio(FRAME);

		expect(transport.sentAudio).toEqual([FRAME_BASE64]);
	});

	it('should buffer audio produced while starting and send it in order after the ack', async () => {
		const transport = new FakeDictationTransport();
		transport.holdStart = true;
		const { client } = createClient(transport);

		const starting = client.start(DRAFT_REQUEST);
		await Promise.resolve();
		client.sendAudio(FRAME);
		client.sendAudio(new Uint8Array([3, 0]));
		expect(transport.sentAudio).toEqual([]);
		await flushTimers();
		transport.releaseStart();
		await starting;

		expect(transport.sentAudio).toEqual([FRAME_BASE64, 'AwA=']);
	});

	it('should relay partial and final transcripts to the listener', async () => {
		const { client, transport, partials, finals } = createClient();
		await client.start(DRAFT_REQUEST);

		transport.listener?.onFinal('Bonjour');
		transport.listener?.onPartial(' le mo');

		expect(finals).toEqual(['Bonjour']);
		expect(partials).toEqual([' le mo']);
	});

	it('should relay the finished text to the listener', async () => {
		const { client, transport, finisheds } = createClient();
		await client.start(DRAFT_REQUEST);

		transport.listener?.onFinished('texte brut');

		expect(finisheds).toEqual(['texte brut']);
	});

	it('should ignore the finished text once the dictation ended', async () => {
		const { client, transport, finisheds } = createClient();
		await client.start(DRAFT_REQUEST);
		client.cancel();

		transport.listener?.onFinished('texte brut');

		expect(finisheds).toEqual([]);
	});

	it('should resolve the acknowledged transcript on stop and disconnect', async () => {
		const { client, transport } = createClient();
		await client.start(DRAFT_REQUEST);

		const transcript = await client.stop();

		expect(transcript).toEqual({
			rawText: 'texte final',
			cleanedDraft: 'Texte final.',
		});
		expect(transport.calls.at(-1)).toBe('disconnect');
	});

	it('should send a cancel to the server and disconnect when cancelled', async () => {
		const { client, transport } = createClient();
		await client.start(DRAFT_REQUEST);

		client.cancel();
		client.cancel();

		expect(transport.calls.filter((call) => call === 'cancel')).toHaveLength(1);
		expect(
			transport.calls.filter((call) => call === 'disconnect')
		).toHaveLength(1);
	});

	it('should report a provider error from the server and end the dictation', async () => {
		const { client, transport, errors } = createClient();
		await client.start(DRAFT_REQUEST);

		transport.listener?.onProviderError('E_TRANSCRIPTION_CONNECTION_CLOSED');
		client.sendAudio(FRAME);

		expect(errors).toHaveLength(1);
		expect(errors[0]).toMatchObject({
			code: 'provider_error',
			serverCode: 'E_TRANSCRIPTION_CONNECTION_CLOSED',
		});
		expect(transport.sentAudio).toEqual([]);
	});

	it('should fail with an error instead of resuming when the connection is lost', async () => {
		const { client, transport, errors } = createClient();
		await client.start(DRAFT_REQUEST);

		transport.simulateConnectionLost();

		expect(errors.map(({ code }) => code)).toEqual(['connection_lost']);
		await expect(client.stop()).rejects.toMatchObject({ code: 'rejected' });
	});

	it('should reject start with connection_failed when the socket cannot connect', async () => {
		const transport = new FakeDictationTransport();
		transport.connectError = new Error('refused');
		const { client } = createClient(transport);

		await expect(client.start(DRAFT_REQUEST)).rejects.toMatchObject({
			code: 'connection_failed',
		});
		expect(transport.calls).toContain('disconnect');
	});

	it('should reject start with the server code when the dictation is refused', async () => {
		const transport = new FakeDictationTransport();
		transport.startError = new Error('E_DICTATION_UNAVAILABLE');
		const { client } = createClient(transport);

		await expect(client.start(DRAFT_REQUEST)).rejects.toMatchObject({
			code: 'rejected',
			serverCode: 'E_DICTATION_UNAVAILABLE',
		});
	});

	it('should rethrow the start rejection, not connection_lost, when the server rejects the start', async () => {
		const transport = new FakeDictationTransport();
		transport.startError = new Error('E_DICTATION_RATE_LIMITED');
		const { client, errors } = createClient(transport);

		await expect(client.start(DRAFT_REQUEST)).rejects.toMatchObject({
			code: 'rejected',
			serverCode: 'E_DICTATION_RATE_LIMITED',
		});
		expect(errors).toEqual([]);
	});

	it('should reject start when too much audio piles up before the start is acknowledged', async () => {
		const transport = new FakeDictationTransport();
		transport.holdStart = true;
		const { client, errors } = createClient(transport);

		const starting = client.start(DRAFT_REQUEST);
		const outcome = starting.catch((error: unknown) => error);
		await flushTimers();
		for (let index = 0; index <= MAX_BUFFERED_FRAMES; index += 1)
			client.sendAudio(FRAME);
		transport.releaseStart();

		expect(await outcome).toMatchObject({
			code: 'connection_failed',
		});
		expect(errors).toEqual([]);
	});

	describe('waiting for the server outcome', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should not resolve start before the server announces the session ready', async () => {
			const transport = new FakeDictationTransport();
			transport.isReadySilent = true;
			const { client } = createClient(transport);
			let isStarted = false;

			const starting = client.start(DRAFT_REQUEST).then(() => {
				isStarted = true;
			});
			await vi.advanceTimersByTimeAsync(READY_TIMEOUT_MS - 1);
			expect(isStarted).toBe(false);
			transport.listener?.onReady();
			await starting;

			expect(isStarted).toBe(true);
		});

		it('should reject start with start_timed_out and disconnect when the session never gets ready', async () => {
			const transport = new FakeDictationTransport();
			transport.isReadySilent = true;
			const { client, errors } = createClient(transport);

			const starting = client.start(DRAFT_REQUEST);
			const outcome = starting.catch((error: unknown) => error);
			await vi.advanceTimersByTimeAsync(READY_TIMEOUT_MS);

			expect(await outcome).toMatchObject({
				code: 'start_timed_out',
			});
			expect(transport.calls.at(-1)).toBe('disconnect');
			expect(errors).toEqual([]);
		});

		it('should reject start with the provider error and not notify the listener when it fails while opening', async () => {
			const transport = new FakeDictationTransport();
			transport.isReadySilent = true;
			const { client, errors } = createClient(transport);

			const starting = client.start(DRAFT_REQUEST);
			const outcome = starting.catch((error: unknown) => error);
			await vi.advanceTimersByTimeAsync(10);
			transport.listener?.onProviderError('E_TRANSCRIPTION_CONNECTION_FAILED');

			expect(await outcome).toMatchObject({
				code: 'provider_error',
				serverCode: 'E_TRANSCRIPTION_CONNECTION_FAILED',
			});
			expect(errors).toEqual([]);
		});

		it('should reject start with connection_lost and not notify the listener when the connection drops while opening', async () => {
			const transport = new FakeDictationTransport();
			transport.isReadySilent = true;
			const { client, errors } = createClient(transport);

			const starting = client.start(DRAFT_REQUEST);
			const outcome = starting.catch((error: unknown) => error);
			await vi.advanceTimersByTimeAsync(10);
			transport.simulateConnectionLost();

			expect(await outcome).toMatchObject({
				code: 'connection_lost',
			});
			expect(errors).toEqual([]);
		});

		it('should resolve start without error when cancelled while waiting for ready', async () => {
			const transport = new FakeDictationTransport();
			transport.isReadySilent = true;
			const { client, errors } = createClient(transport);

			const starting = client.start(DRAFT_REQUEST);
			await vi.advanceTimersByTimeAsync(10);
			client.cancel();

			await expect(starting).resolves.toBeUndefined();
			await vi.advanceTimersByTimeAsync(READY_TIMEOUT_MS);
			expect(errors).toEqual([]);
		});

		it('should not resolve stop before the completed transcript arrives', async () => {
			const transport = new FakeDictationTransport();
			transport.isCompletionSilent = true;
			const { client } = createClient(transport);
			await client.start(DRAFT_REQUEST);
			const completed = { rawText: 'brut', cleanedDraft: 'Propre.' };
			let transcript: unknown;

			const stopping = client.stop().then((value) => {
				transcript = value;
			});
			await vi.advanceTimersByTimeAsync(COMPLETION_TIMEOUT_MS - 1);
			expect(transcript).toBeUndefined();
			transport.listener?.onCompleted(completed);
			await stopping;

			expect(transcript).toEqual(completed);
			expect(transport.calls.at(-1)).toBe('disconnect');
		});

		it('should reject stop with completion_timed_out and disconnect when the transcript never arrives', async () => {
			const transport = new FakeDictationTransport();
			transport.isCompletionSilent = true;
			const { client, errors } = createClient(transport);
			await client.start(DRAFT_REQUEST);

			const stopping = client.stop();
			const outcome = stopping.catch((error: unknown) => error);
			await vi.advanceTimersByTimeAsync(COMPLETION_TIMEOUT_MS);

			expect(await outcome).toMatchObject({
				code: 'completion_timed_out',
			});
			expect(transport.calls.at(-1)).toBe('disconnect');
			expect(errors).toEqual([]);
		});

		it('should reject stop with the provider error and not notify the listener when it fails while completing', async () => {
			const transport = new FakeDictationTransport();
			transport.isCompletionSilent = true;
			const { client, errors } = createClient(transport);
			await client.start(DRAFT_REQUEST);

			const stopping = client.stop();
			const outcome = stopping.catch((error: unknown) => error);
			await vi.advanceTimersByTimeAsync(10);
			transport.listener?.onProviderError('E_DICTATION_UNAVAILABLE');

			expect(await outcome).toMatchObject({
				code: 'provider_error',
				serverCode: 'E_DICTATION_UNAVAILABLE',
			});
			expect(errors).toEqual([]);
		});

		it('should reject stop with connection_lost and not notify the listener when the connection drops while completing', async () => {
			const transport = new FakeDictationTransport();
			transport.isCompletionSilent = true;
			const { client, errors } = createClient(transport);
			await client.start(DRAFT_REQUEST);

			const stopping = client.stop();
			const outcome = stopping.catch((error: unknown) => error);
			await vi.advanceTimersByTimeAsync(10);
			transport.simulateConnectionLost();

			expect(await outcome).toMatchObject({
				code: 'connection_lost',
			});
			expect(errors).toEqual([]);
		});

		it('should reject stop when the server refuses the stop', async () => {
			const transport = new FakeDictationTransport();
			transport.stopError = new Error('E_DICTATION_NOT_ACTIVE');
			const { client } = createClient(transport);
			await client.start(DRAFT_REQUEST);

			await expect(client.stop()).rejects.toMatchObject({
				code: 'rejected',
				serverCode: 'E_DICTATION_NOT_ACTIVE',
			});
		});
	});
});

const flushTimers = (): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, 0));
