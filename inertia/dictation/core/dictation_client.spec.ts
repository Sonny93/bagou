import { describe, expect, it } from 'vitest';

import { DictationClient, MAX_BUFFERED_FRAMES } from './dictation_client';
import type { DictationClientListener } from './dictation_client';
import type { DictationClientError } from './dictation_client_error';
import { FakeDictationTransport } from './fake_dictation_transport';

const DICTATION_ID = 'dictation-1';
const FRAME = new Uint8Array([1, 0, 2, 0]);
const FRAME_BASE64 = 'AQACAA==';

function createClient(transport = new FakeDictationTransport()) {
	const partials: string[] = [];
	const finals: string[] = [];
	const errors: DictationClientError[] = [];
	const listener: DictationClientListener = {
		onPartial: (text) => partials.push(text),
		onFinal: (text) => finals.push(text),
		onError: (error) => errors.push(error),
	};
	const client = new DictationClient(transport, listener, () => DICTATION_ID);
	return { client, transport, partials, finals, errors };
}

describe('DictationClient', () => {
	it('should connect, join the dictation channel and start it', async () => {
		const { client, transport } = createClient();

		await client.start();

		expect(transport.joinedId).toBe(DICTATION_ID);
		expect(transport.calls).toEqual(['connect', 'start']);
	});

	it('should send audio as base64 once started', async () => {
		const { client, transport } = createClient();
		await client.start();

		client.sendAudio(FRAME);

		expect(transport.sentAudio).toEqual([FRAME_BASE64]);
	});

	it('should buffer audio produced while starting and send it in order after the ack', async () => {
		const transport = new FakeDictationTransport();
		transport.holdStart = true;
		const { client } = createClient(transport);

		const starting = client.start();
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
		await client.start();

		transport.listener?.onFinal('Bonjour');
		transport.listener?.onPartial(' le mo');

		expect(finals).toEqual(['Bonjour']);
		expect(partials).toEqual([' le mo']);
	});

	it('should resolve the acknowledged text on stop and disconnect', async () => {
		const { client, transport } = createClient();
		await client.start();

		const text = await client.stop();

		expect(text).toBe('texte final');
		expect(transport.calls.at(-1)).toBe('disconnect');
	});

	it('should send a cancel to the server and disconnect when cancelled', async () => {
		const { client, transport } = createClient();
		await client.start();

		client.cancel();
		client.cancel();

		expect(transport.calls.filter((call) => call === 'cancel')).toHaveLength(1);
		expect(
			transport.calls.filter((call) => call === 'disconnect')
		).toHaveLength(1);
	});

	it('should report a provider error from the server and end the dictation', async () => {
		const { client, transport, errors } = createClient();
		await client.start();

		transport.listener?.onProviderError('Le service a échoué');
		client.sendAudio(FRAME);

		expect(errors).toHaveLength(1);
		expect(errors[0]).toMatchObject({
			code: 'provider_error',
			message: 'Le service a échoué',
		});
		expect(transport.sentAudio).toEqual([]);
	});

	it('should fail with an error instead of resuming when the connection is lost', async () => {
		const { client, transport, errors } = createClient();
		await client.start();

		transport.simulateConnectionLost();

		expect(errors.map(({ code }) => code)).toEqual(['connection_lost']);
		await expect(client.stop()).rejects.toMatchObject({ code: 'rejected' });
	});

	it('should reject start with connection_failed when the socket cannot connect', async () => {
		const transport = new FakeDictationTransport();
		transport.connectError = new Error('refused');
		const { client } = createClient(transport);

		await expect(client.start()).rejects.toMatchObject({
			code: 'connection_failed',
		});
		expect(transport.calls).toContain('disconnect');
	});

	it('should reject start with the server message when the dictation is refused', async () => {
		const transport = new FakeDictationTransport();
		transport.startError = new Error(
			'La dictée est momentanément indisponible'
		);
		const { client } = createClient(transport);

		await expect(client.start()).rejects.toMatchObject({
			code: 'rejected',
			message: 'La dictée est momentanément indisponible',
		});
	});

	it('should rethrow the start rejection, not connection_lost, when the server rejects the start', async () => {
		const transport = new FakeDictationTransport();
		transport.startError = new Error('Impossible de joindre le service');
		const { client, errors } = createClient(transport);

		await expect(client.start()).rejects.toMatchObject({
			code: 'rejected',
			message: 'Impossible de joindre le service',
		});
		expect(errors).toEqual([]);
	});

	it('should fail when too much audio piles up before the start is acknowledged', async () => {
		const transport = new FakeDictationTransport();
		transport.holdStart = true;
		const { client, errors } = createClient(transport);

		const starting = client.start();
		await flushTimers();
		for (let index = 0; index <= MAX_BUFFERED_FRAMES; index += 1)
			client.sendAudio(FRAME);
		transport.releaseStart();
		await starting;

		expect(errors.map(({ code }) => code)).toEqual(['connection_failed']);
	});
});

const flushTimers = (): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, 0));
