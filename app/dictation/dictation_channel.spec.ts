import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import socketService from '@rlanz/socket/services/main';
import type { MiddlewareContext } from '@rlanz/socket/types';
import { setTimeout as sleep } from 'node:timers/promises';

import DictationChannel from '#app/dictation/dictation_channel';
import { UserFactory } from '#database/factories/user_factory';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { createFakeChannelSocket } from '#tests/helpers/fake_channel_socket';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import { SlowTranscriptionProvider } from '#tests/helpers/slow_transcription_provider';
import { swapTextCleaner } from '#tests/helpers/swap_text_cleaner';
import { swapTranscriptionProvider } from '#tests/helpers/swap_transcription_provider';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import Transcript from '#transcription_history/transcript';
import type User from '#users/user';

const DICTATION_ID = '7f9c1f5e-3b0a-4c43-9c66-2d6a53e8f1aa';
const DRAFT_CONTEXT = {
	draftId: '3f0a1c7e-9d54-4b6a-8e21-5c7d9a0b4f12',
	textBefore: 'Avant.',
	textAfter: '',
};
const PREVIEW_SETTINGS = {
	dictationLanguage: 'fr',
	vocabulary: ['Adonis'],
	cleanupInstructions: '',
};
const CHANNEL_NAME = `dictation/${DICTATION_ID}`;
const START_REQUESTS_PER_MINUTE = 20;
const DAILY_QUOTA_BYTES = 60 * 60 * 32_000;
const VALID_CHUNK = Buffer.from(new Uint8Array([1, 0, 2, 0])).toString(
	'base64'
);

const settleCancellation = (): Promise<void> => sleep(50);
const settleOpening = (): Promise<void> => sleep(0);
const settleCompletion = (): Promise<void> => sleep(50);

const settleAfter: Readonly<Record<string, () => Promise<void>>> = {
	'dictation:start': settleOpening,
	'dictation:preview': settleOpening,
	'dictation:stop': settleCompletion,
};

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
		send: async (event: string, data?: unknown) => {
			const acknowledgement = await channel.$handleMessage(socket, event, data);
			await settleAfter[event]?.();
			return acknowledgement;
		},
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
		const restoreTextCleaner = swapTextCleaner(new FakeTextCleaner());
		return () => {
			restoreProvider();
			restoreTextCleaner();
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
			/E_INVALID_DICTATION_ID/
		);
	});

	test('should accept an authenticated user and a uuid dictation id', async ({
		assert,
	}) => {
		const user = await UserFactory.make();

		await assert.doesNotReject(() => runMiddlewares(user, DICTATION_ID));
	});

	test('should reject starting with an invalid draft context without opening the provider', async ({
		assert,
	}) => {
		const { send } = await joinChannel();

		await assert.rejects(
			() => send('dictation:start', { draftId: 'nope' }),
			/E_INVALID_DRAFT_CONTEXT/
		);
		assert.lengthOf(provider.openedWith, 0);
	});

	test('should relay transcripts to the dictation channel only and broadcast the completed transcript on stop', async ({
		assert,
	}) => {
		const fake = socketService.fake();
		const { send } = await joinChannel();

		await send('dictation:start', DRAFT_CONTEXT);
		await send('dictation:audio', { chunk: VALID_CHUNK });
		session.simulatePartial(' le mon');
		session.simulateFinal('Bonjour');
		const acknowledgement = await send('dictation:stop');

		assert.isUndefined(acknowledgement);
		assert.deepEqual([...(session.sentAudio[0] ?? [])], [1, 0, 2, 0]);
		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:partial', {
			data: { text: ' le mon' },
		});
		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:final', {
			data: { text: 'Bonjour' },
		});
		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:finished', {
			data: { text: 'Bonjour le monde' },
		});
		fake.assertEmittedTo(CHANNEL_NAME, 'dictation:completed', {
			data: {
				rawText: 'Bonjour le monde',
				cleanedDraft: 'AVANT. BONJOUR LE MONDE',
			},
		});
		fake.assertCount(5);
		fake.assertCount(5, { target: 'channel', channel: CHANNEL_NAME });
	});

	test('should broadcast a null cleaned text on stop when the cleanup is unavailable', async () => {
		const fake = socketService.fake();
		const restoreTextCleaner = swapTextCleaner(
			new FakeTextCleaner(new TextCleanupUnavailableException())
		);
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await send('dictation:stop');

		fake.assertEmittedTo(CHANNEL_NAME, 'dictation:completed', {
			data: { rawText: 'Bonjour le monde', cleanedDraft: null },
		});
		restoreTextCleaner();
	});

	test('should broadcast only the error code when the provider fails', async ({
		assert,
	}) => {
		const fake = socketService.fake();
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		session.simulateError(
			new TranscriptionProviderError(
				TranscriptionErrorCode.providerRejected,
				'internal detail'
			)
		);

		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:error', {
			data: {
				code: TranscriptionErrorCode.providerRejected,
			},
		});
		assert.notInclude(JSON.stringify(fake.emissions), 'internal detail');
	});

	test('should reject an invalid audio chunk without sending anything to the provider', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await assert.rejects(
			() => send('dictation:audio', { chunk: 'not base64 !' }),
			/E_INVALID_AUDIO_CHUNK/
		);
		assert.lengthOf(session.sentAudio, 0);
	});

	test('should reject starting again while a dictation is active', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await assert.rejects(
			() => send('dictation:start', DRAFT_CONTEXT),
			/E_DICTATION_ALREADY_ACTIVE/
		);
		assert.lengthOf(provider.openedWith, 1);
	});

	test('should reject audio and stop before the dictation started', async ({
		assert,
	}) => {
		const { send } = await joinChannel();

		await assert.rejects(
			() => send('dictation:audio', { chunk: VALID_CHUNK }),
			/E_DICTATION_NOT_ACTIVE/
		);
		await assert.rejects(
			() => send('dictation:stop'),
			/E_DICTATION_NOT_ACTIVE/
		);
	});

	test('should broadcast the provider error code when opening the provider session fails', async () => {
		const fake = socketService.fake();
		const failingProvider = new FakeTranscriptionProvider(
			session,
			new TranscriptionProviderError(
				TranscriptionErrorCode.connectionFailed,
				'dns failure for api.mistral.ai'
			)
		);
		const restoreProvider = swapTranscriptionProvider(failingProvider);
		const { send } = await joinChannel();

		await send('dictation:start', DRAFT_CONTEXT);

		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:error', {
			data: { code: TranscriptionErrorCode.connectionFailed },
		});
		restoreProvider();
	});

	test('should broadcast a generic unavailable error when opening the provider session fails unexpectedly', async () => {
		const fake = socketService.fake();
		const failingProvider = new FakeTranscriptionProvider(
			session,
			new Error('boom')
		);
		const restoreProvider = swapTranscriptionProvider(failingProvider);
		const { send } = await joinChannel();

		await send('dictation:start', DRAFT_CONTEXT);

		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:error', {
			data: { code: 'E_DICTATION_UNAVAILABLE' },
		});
		restoreProvider();
	});

	test('should broadcast ready once the provider session is open', async () => {
		const fake = socketService.fake();
		const { send } = await joinChannel();

		await send('dictation:start', DRAFT_CONTEXT);

		fake.assertEmittedTo(CHANNEL_NAME, 'dictation:ready', { data: {} });
	});

	test('should acknowledge the start before the provider session is open', async ({
		assert,
	}) => {
		const fake = socketService.fake();
		const slowProvider = new SlowTranscriptionProvider(session);
		const restoreProvider = swapTranscriptionProvider(slowProvider);
		const { send } = await joinChannel();

		await send('dictation:start', DRAFT_CONTEXT);
		assert.lengthOf(fake.emissions, 0);
		await assert.rejects(
			() => send('dictation:start', DRAFT_CONTEXT),
			/E_DICTATION_ALREADY_ACTIVE/
		);
		slowProvider.release();
		await settleOpening();

		fake.assertEmittedTo(CHANNEL_NAME, 'dictation:ready', { data: {} });
		restoreProvider();
	});

	test('should broadcast the provider error code when the completion fails', async () => {
		const fake = socketService.fake();
		const failingSession = new FakeTranscriptionSession();
		failingSession.finish = async () => {
			throw new TranscriptionProviderError(
				TranscriptionErrorCode.finishTimeout,
				'internal detail'
			);
		};
		const restoreProvider = swapTranscriptionProvider(
			new FakeTranscriptionProvider(failingSession)
		);
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await send('dictation:stop');

		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:error', {
			data: { code: TranscriptionErrorCode.finishTimeout },
		});
		restoreProvider();
	});

	test('should broadcast a generic unavailable error when the completion fails unexpectedly', async () => {
		const fake = socketService.fake();
		const failingSession = new FakeTranscriptionSession();
		failingSession.finish = async () => {
			throw new Error('boom');
		};
		const restoreProvider = swapTranscriptionProvider(
			new FakeTranscriptionProvider(failingSession)
		);
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await send('dictation:stop');

		fake.assertEmittedTo(CHANNEL_NAME, 'transcript:error', {
			data: { code: 'E_DICTATION_UNAVAILABLE' },
		});
		restoreProvider();
	});

	test('should finish the provider session then release it when the dictation is cancelled', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await send('dictation:cancel');
		await settleCancellation();

		assert.equal(session.finishCount, 1);
		assert.equal(session.abortCount, 1);
	});

	test('should keep the raw text without cleanup when the dictation is cancelled', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const restoreTextCleaner = swapTextCleaner(textCleaner);
		const { send, user } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await send('dictation:cancel');
		await settleCancellation();

		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'Bonjour le monde');
		assert.isNull(saved?.cleanedText);
		assert.lengthOf(textCleaner.cleaned, 0);
		restoreTextCleaner();
	});

	test('should finish the session and keep the raw text when the socket leaves the channel', async ({
		assert,
	}) => {
		const { send, leave, user } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await leave();
		await settleCancellation();

		assert.equal(session.finishCount, 1);
		assert.equal(session.abortCount, 1);
		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'Bonjour le monde');
		assert.isNull(saved?.cleanedText);
	});

	test('should reject starting without opening the provider when the daily quota is spent', async ({
		assert,
	}) => {
		const { send, user } = await joinChannel();
		const quotaService = await app.container.make(DictationQuotaService);
		await quotaService.record(user.id, DAILY_QUOTA_BYTES);

		await assert.rejects(
			() => send('dictation:start', DRAFT_CONTEXT),
			'E_DICTATION_QUOTA_EXCEEDED'
		);
		assert.lengthOf(provider.openedWith, 0);
	});

	test('should reject starting once the start rate limit is exceeded', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		for (let attempt = 0; attempt < START_REQUESTS_PER_MINUTE; attempt += 1) {
			await send('dictation:start', DRAFT_CONTEXT);
			await send('dictation:cancel');
		}

		await assert.rejects(
			() => send('dictation:start', DRAFT_CONTEXT),
			'E_DICTATION_RATE_LIMITED'
		);
		assert.lengthOf(provider.openedWith, START_REQUESTS_PER_MINUTE);
	});

	test('should count the start rate limit per user', async ({ assert }) => {
		const first = await joinChannel();
		for (let attempt = 0; attempt < START_REQUESTS_PER_MINUTE; attempt += 1) {
			await first.send('dictation:start', DRAFT_CONTEXT);
			await first.send('dictation:cancel');
		}
		const second = await joinChannel();

		await assert.doesNotReject(() =>
			second.send('dictation:start', DRAFT_CONTEXT)
		);
	});

	test('should accept exactly one of two starts sent without waiting for the first', async ({
		assert,
	}) => {
		const { send } = await joinChannel();

		const outcomes = await Promise.allSettled([
			send('dictation:start', DRAFT_CONTEXT),
			send('dictation:start', DRAFT_CONTEXT),
		]);

		assert.deepEqual(
			outcomes.map(({ status }) => status),
			['fulfilled', 'rejected']
		);
		const [, secondOutcome] = outcomes;
		assert.equal(secondOutcome?.status, 'rejected');
		if (secondOutcome?.status === 'rejected') {
			assert.match(String(secondOutcome.reason), /E_DICTATION_ALREADY_ACTIVE/);
		}
		assert.lengthOf(provider.openedWith, 1);
	});

	test('should reject a preview with invalid settings without opening the provider', async ({
		assert,
	}) => {
		const { send } = await joinChannel();

		await assert.rejects(
			() =>
				send('dictation:preview', {
					...PREVIEW_SETTINGS,
					dictationLanguage: 'de',
				}),
			/E_INVALID_PREVIEW_SETTINGS/
		);
		assert.lengthOf(provider.openedWith, 0);
	});

	test('should dictate with the given settings, clean only the segment and save nothing on a preview', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const restoreTextCleaner = swapTextCleaner(textCleaner);
		const { send, user } = await joinChannel();

		const fake = socketService.fake();

		await send('dictation:preview', PREVIEW_SETTINGS);
		await send('dictation:audio', { chunk: VALID_CHUNK });
		await send('dictation:stop');

		assert.deepEqual(provider.openedWith, [
			{ language: 'fr', vocabulary: ['Adonis'] },
		]);
		fake.assertEmittedTo(CHANNEL_NAME, 'dictation:completed', {
			data: { rawText: 'Bonjour le monde', cleanedDraft: 'BONJOUR LE MONDE' },
		});
		assert.deepEqual(textCleaner.receivedPreferences, [
			{ language: 'fr', vocabulary: ['Adonis'], instructions: '' },
		]);
		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
		restoreTextCleaner();
	});

	test('should broadcast a null cleaned text on a preview when the cleanup is unavailable', async () => {
		const fake = socketService.fake();
		const restoreTextCleaner = swapTextCleaner(
			new FakeTextCleaner(new TextCleanupUnavailableException())
		);
		const { send } = await joinChannel();
		await send('dictation:preview', PREVIEW_SETTINGS);

		await send('dictation:stop');

		fake.assertEmittedTo(CHANNEL_NAME, 'dictation:completed', {
			data: { rawText: 'Bonjour le monde', cleanedDraft: null },
		});
		restoreTextCleaner();
	});

	test('should keep nothing when a preview is cancelled', async ({
		assert,
	}) => {
		const { send, user } = await joinChannel();
		await send('dictation:preview', PREVIEW_SETTINGS);

		await send('dictation:cancel');
		await settleCancellation();

		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should reject a preview while a dictation is active', async ({
		assert,
	}) => {
		const { send } = await joinChannel();
		await send('dictation:start', DRAFT_CONTEXT);

		await assert.rejects(
			() => send('dictation:preview', PREVIEW_SETTINGS),
			/E_DICTATION_ALREADY_ACTIVE/
		);
	});

	test('should reject a preview without opening the provider when the daily quota is spent', async ({
		assert,
	}) => {
		const { send, user } = await joinChannel();
		const quotaService = await app.container.make(DictationQuotaService);
		await quotaService.record(user.id, DAILY_QUOTA_BYTES);

		await assert.rejects(
			() => send('dictation:preview', PREVIEW_SETTINGS),
			'E_DICTATION_QUOTA_EXCEEDED'
		);
		assert.lengthOf(provider.openedWith, 0);
	});
});
