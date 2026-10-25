import { test } from '@japa/runner';

import { FakeRealtimeSocket } from '#tests/helpers/fake_realtime_socket';
import {
	MISTRAL_REALTIME_MODEL,
	MistralTranscriptionProvider,
} from '#transcription/providers/mistral/mistral_transcription_provider';

const API_KEY = 'test-api-key';

function createProvider() {
	const socket = new FakeRealtimeSocket();
	const connections: { url: string; headers: Record<string, string> }[] = [];
	const provider = new MistralTranscriptionProvider(API_KEY, (url, headers) => {
		connections.push({ url, headers: { ...headers } });
		return socket;
	});
	return { provider, socket, connections };
}

test.group('MistralTranscriptionProvider', () => {
	test('should connect to the pinned realtime model with the API key as bearer token', async ({
		assert,
	}) => {
		const { provider, socket, connections } = createProvider();

		const opening = provider.open({ language: 'fr' });
		socket.receive({ type: 'session.created' });
		socket.receive({ type: 'session.updated' });
		await opening;

		const url = new URL(connections[0]?.url ?? '');
		assert.equal(url.origin, 'wss://api.mistral.ai');
		assert.equal(url.pathname, '/v1/audio/transcriptions/realtime');
		assert.equal(url.searchParams.get('model'), MISTRAL_REALTIME_MODEL);
		assert.equal(connections[0]?.headers.Authorization, `Bearer ${API_KEY}`);
	});

	test('should resolve with a session only once the provider confirmed the configuration', async ({
		assert,
	}) => {
		const { provider, socket } = createProvider();
		let isOpen = false;

		const opening = provider.open({ language: 'fr' }).then((session) => {
			isOpen = true;
			return session;
		});
		socket.receive({ type: 'session.created' });
		await Promise.resolve();
		assert.isFalse(isOpen);
		socket.receive({ type: 'session.updated' });

		assert.isDefined(await opening);
	});

	test('should reject opening when the provider refuses the configuration', async ({
		assert,
	}) => {
		const { provider, socket } = createProvider();

		const opening = provider.open({ language: 'fr' });
		socket.receive({ type: 'session.created' });
		socket.receive({ type: 'error', error: { message: 'bad language' } });

		await assert.rejects(() => opening, /bad language/);
	});
});
