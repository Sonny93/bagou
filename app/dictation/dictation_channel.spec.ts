import app from '@adonisjs/core/services/app';
import { test } from '@japa/runner';
import socketService from '@rlanz/socket/services/main';
import type { MiddlewareContext } from '@rlanz/socket/types';

import DictationChannel from '#app/dictation/dictation_channel';
import { UserFactory } from '#database/factories/user_factory';
import { createFakeChannelSocket } from '#tests/helpers/fake_channel_socket';
import { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import { swapTranscriptionProvider } from '#tests/helpers/swap_transcription_provider';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type User from '#users/user';

const DICTATION_ID = '7f9c1f5e-3b0a-4c43-9c66-2d6a53e8f1aa';
const CHANNEL_NAME = `dictation/${DICTATION_ID}`;
const VALID_CHUNK = Buffer.from(new Uint8Array([1, 0, 2, 0])).toString(
	'base64'
);

async function createChannel() {
	const channel = await app.container.make(DictationChannel);
	channel.$setContext(socketService, CHANNEL_NAME, {
		dictationId: DICTATION_ID,
	});
	return channel;
}

async function joinChannel() {
	const user = await UserFactory.make();
	const socket = createFakeChannelSocket(user);
	const channel = await createChannel();
	return {
		send: (event: string, data?: unknown) =>
			channel.$handleMessage(socket, event, data),
		leave: () => channel.$handleLeave(socket, DICTATION_ID),
	};
}

async function runMiddlewares(user: User | undefined, dictationId: string) {
	const channel = await createChannel();
	const context: MiddlewareContext<User> = {
		socket: createFakeChannelSocket(user),
		channel: `dictation/${dictationId}`,
		params: { dictationId },
		setPresenceData: () => undefined,
	};
	return channel.$runMiddlewares(context);
}

test.group('DictationChannel', (group) => {
	let session: FakeTranscriptionSession;
	let provider: FakeTranscriptionProvider;

	group.each.setup(() => {
		session = new FakeTranscriptionSession('Bonjour le monde');
		provider = new FakeTranscriptionProvider(session);
		const restoreProvider = swapTranscriptionProvider(provider);
		return () => {
			restoreProvider();
			socketService.restore();
		};
	});

	test('should refuse a socket without an authenticated user', async ({
		assert,
	}) => {
		await assert.rejects(
			() => runMiddlewares(undefined, DICTATION_ID),
			/Unauthorized/
		);
	});

	test('should refuse a dictation id that is not a uuid', async ({
		assert,
	}) => {
		const user = await UserFactory.make();

		await assert.rejects(
			() => runMiddlewares(user, 'not-a-uuid'),
			/identifiant de dictée est invalide/
		);
	});

	test('should accept an authenticated user and a uuid dictation id', async ({
		assert,
	}) => {
		const user = await UserFactory.make();

		await assert.doesNotReject(() => runMiddlewares(user, DICTATION_ID));
	});

	test('should relay transcripts to the dictation channel only and acknowledge the final text on stop', async ({
		assert,
	}) => {
		const fake = socketService.fake();
		const { send } = await joinChannel();

		await send('dictation:start');
		await send('dictation:audio', { chunk: VALID_CHUNK });
		session.simulatePartial(' le mon');
		session.simulateFinal('Bonjour');
		const acknowledgement = await send('dictation:stop');

		assert.deepEqual(acknowledgement, { text: 'Bonjour le monde' });
		assert.deepEqual([...(session.sentAudio[0] ?? [])], [1, 0, 2, 0]);
		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:partial', {
			data: { text: ' le mon' },
		});
		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:final', {
			data: { text: 'Bonjour' },
		});
		fake.assertCount(2);
		fake.assertCount(2, { target: 'channel', channel: CHANNEL_NAME });
	});

	test('should broadcast a safe French error when the provider fails', async ({
		assert,
	}) => {
		const fake = socketService.fake();
		const { send } = await joinChannel();
		await send('dictation:start');

		session.simulateError(
			new TranscriptionProviderError(
				TranscriptionErrorCode.providerRejected,
				'internal detail'
			)
		);

		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:error', {
			data: {
				code: TranscriptionErrorCode.providerRejected,
				message: 'Le service de transcription a refusé la dictée.',
			},
		});
		assert.notInclude(JSON.stringify(fake.emissions), 'internal detail');
	});

	test('should reject an invalid audio chunk without sending anything to the provider', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		await send('dictation:start');

		await assert.rejects(
			() => send('dictation:audio', { chunk: 'not base64 !' }),
			/segment audio est invalide/
		);
		assert.lengthOf(session.sentAudio, 0);
	});

	test('should reject starting again while a dictation is active', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		await send('dictation:start');

		await assert.rejects(
			() => send('dictation:start'),
			/dictée est déjà en cours/
		);
		assert.lengthOf(provider.openedWith, 1);
	});

	test('should reject audio and stop before the dictation started', async ({
		assert,
	}) => {
		const { send } = await joinChannel();

		await assert.rejects(
			() => send('dictation:audio', { chunk: VALID_CHUNK }),
			/Aucune dictée/
		);
		await assert.rejects(() => send('dictation:stop'), /Aucune dictée/);
	});

	test('should acknowledge a provider start failure with the safe message of its code', async ({
		assert,
	}) => {
		const failingProvider = new FakeTranscriptionProvider(
			session,
			new TranscriptionProviderError(
				TranscriptionErrorCode.connectionFailed,
				'dns failure for api.mistral.ai'
			)
		);
		const restoreProvider = swapTranscriptionProvider(failingProvider);
		const { send } = await joinChannel();

		await assert.rejects(
			() => send('dictation:start'),
			'Impossible de joindre le service de transcription.'
		);
		restoreProvider();
	});

	test('should acknowledge an unexpected start failure with a generic unavailable error', async ({
		assert,
	}) => {
		const failingProvider = new FakeTranscriptionProvider(
			session,
			new Error('boom')
		);
		const restoreProvider = swapTranscriptionProvider(failingProvider);
		const { send } = await joinChannel();

		await assert.rejects(
			() => send('dictation:start'),
			'La dictée est momentanément indisponible'
		);
		restoreProvider();
	});

	test('should abort the provider session when the dictation is cancelled', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		await send('dictation:start');

		await send('dictation:cancel');

		assert.equal(session.abortCount, 1);
	});

	test('should abort the provider session when the socket leaves the channel', async ({
		assert,
	}) => {
		const { send, leave } = await joinChannel();
		await send('dictation:start');

		await leave();

		assert.equal(session.abortCount, 1);
	});
});
