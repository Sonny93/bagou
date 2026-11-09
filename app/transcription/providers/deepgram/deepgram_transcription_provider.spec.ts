import { test } from '@japa/runner';

import { FakeRealtimeSocket } from '#tests/helpers/fake_realtime_socket';
import {
	DEEPGRAM_MODEL,
	DeepgramTranscriptionProvider,
} from '#transcription/providers/deepgram/deepgram_transcription_provider';

const API_KEY = 'test-api-key';
const NO_OP_LOGGER = { warn: () => undefined };

function createProvider() {
	const socket = new FakeRealtimeSocket();
	const connections: { url: string; headers: Record<string, string> }[] = [];
	const provider = new DeepgramTranscriptionProvider(
		API_KEY,
		(url, headers) => {
			connections.push({ url, headers: { ...headers } });
			return socket;
		},
		NO_OP_LOGGER
	);
	return { provider, socket, connections };
}

test.group('DeepgramTranscriptionProvider', () => {
	test('should connect with the pinned model, the audio format and privacy options', async ({
		assert,
	}) => {
		const { provider, socket, connections } = createProvider();

		const opening = provider.open({ language: 'fr' });
		socket.simulateOpen();
		await opening;

		const url = new URL(connections[0]?.url ?? '');
		assert.equal(url.origin, 'wss://api.deepgram.com');
		assert.equal(url.pathname, '/v1/listen');
		assert.deepEqual(Object.fromEntries(url.searchParams), {
			model: DEEPGRAM_MODEL,
			language: 'fr',
			encoding: 'linear16',
			sample_rate: '16000',
			channels: '1',
			interim_results: 'true',
			smart_format: 'true',
			mip_opt_out: 'true',
		});
	});

	test('should authenticate with the API key as a token', async ({
		assert,
	}) => {
		const { provider, socket, connections } = createProvider();

		const opening = provider.open({ language: 'en' });
		socket.simulateOpen();
		await opening;

		assert.equal(connections[0]?.headers.Authorization, `Token ${API_KEY}`);
	});

	test('should keep the vocabulary out of the URL', async ({ assert }) => {
		const { provider, socket, connections } = createProvider();

		const opening = provider.open({ language: 'fr', vocabulary: ['Zyphorra'] });
		socket.simulateOpen();
		socket.receive({ type: 'ConfigureSuccess' });
		await opening;

		assert.notInclude(connections[0]?.url ?? '', 'Zyphorra');
		assert.notInclude((connections[0]?.url ?? '').toLowerCase(), 'keyterm');
	});

	test('should resolve with a session only once the socket is open', async ({
		assert,
	}) => {
		const { provider, socket } = createProvider();
		let isOpen = false;

		const opening = provider.open({ language: 'fr' }).then((session) => {
			isOpen = true;
			return session;
		});
		await Promise.resolve();
		assert.isFalse(isOpen);
		socket.simulateOpen();

		assert.isDefined(await opening);
	});

	test('should reject opening when the connection closes before it is open', async ({
		assert,
	}) => {
		const { provider, socket } = createProvider();

		const opening = provider.open({ language: 'fr' });
		socket.simulateClose(1006, '');

		await assert.rejects(() => opening, /lost/);
	});
});
