import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import socketService from '@rlanz/socket/services/main';
import type { MiddlewareContext } from '@rlanz/socket/types';

import DictationChannel from '#app/dictation/dictation_channel';
import { UserFactory } from '#database/factories/user_factory';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { createFakeChannelSocket } from '#tests/helpers/fake_channel_socket';
import { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import { swapTranscriptionProvider } from '#tests/helpers/swap_transcription_provider';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type User from '#users/user';

const DICTATION_ID = '7f9c1f5e-3b0a-4c43-9c66-2d6a53e8f1aa';
const CHANNEL_NAME = `dictation/${DICTATION_ID}`;
const START_REQUESTS_PER_MINUTE = 20;
const DAILY_QUOTA_BYTES = 60 * 60 * 32_000;
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
	const user = await UserFactory.create();
	const socket = createFakeChannelSocket(user);
	const channel = await createChannel();
	return {
		user,
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

	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
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

	test('should reject starting without opening the provider when the daily quota is spent', async ({
		assert,
	}) => {
		const { send, user } = await joinChannel();
		const quotaService = await app.container.make(DictationQuotaService);
		await quotaService.record(user.id, DAILY_QUOTA_BYTES);

		await assert.rejects(
			() => send('dictation:start'),
			'Quota quotidien de dictée atteint, réessaie demain'
		);
		assert.lengthOf(provider.openedWith, 0);
	});

	test('should reject starting once the start rate limit is exceeded', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		for (let attempt = 0; attempt < START_REQUESTS_PER_MINUTE; attempt += 1) {
			await send('dictation:start');
			await send('dictation:cancel');
		}

		await assert.rejects(
			() => send('dictation:start'),
			'Trop de dictées lancées, patiente une minute'
		);
		assert.lengthOf(provider.openedWith, START_REQUESTS_PER_MINUTE);
	});

	test('should count the start rate limit per user', async ({ assert }) => {
		const first = await joinChannel();
		for (let attempt = 0; attempt < START_REQUESTS_PER_MINUTE; attempt += 1) {
			await first.send('dictation:start');
			await first.send('dictation:cancel');
		}
		const second = await joinChannel();

		await assert.doesNotReject(() => second.send('dictation:start'));
	});

	test('should accept exactly one of two starts sent without waiting for the first', async ({
		assert,
	}) => {
		const { send } = await joinChannel();

		const outcomes = await Promise.allSettled([
			send('dictation:start'),
			send('dictation:start'),
		]);

		assert.deepEqual(
			outcomes.map(({ status }) => status),
			['fulfilled', 'rejected']
		);
		const [, secondOutcome] = outcomes;
		assert.equal(secondOutcome?.status, 'rejected');
		if (secondOutcome?.status === 'rejected') {
			assert.match(String(secondOutcome.reason), /dictée est déjà en cours/);
		}
		assert.lengthOf(provider.openedWith, 1);
	});
});
