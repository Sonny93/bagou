import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';
import { MAX_DRAFT_TEXT_LENGTH } from '#dictation/validators/start_dictation_validator';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { swapTextCleaner } from '#tests/helpers/swap_text_cleaner';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import Transcript from '#transcription_history/transcript';
import UserSetting from '#user_settings/user_setting';

const DRAFT_ID = '3f0a1c7e-9d54-4b6a-8e21-5c7d9a0b4f12';
const UNKNOWN_DRAFT_ID = '9b2e4d68-1f3a-4c5b-8d7e-6a0f2c4e8b13';
const CLEANUP_REQUESTS_PER_MINUTE = 10;

test.group('CleanDraftController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 401 when the visitor is a guest', async ({ client }) => {
		const response = await client
			.post(`/history/drafts/${DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour' })
			.withCsrfToken();

		response.assertStatus(401);
	});

	test('should clean the text, store it in the entry of the draft and return it', async ({
		client,
		assert,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
			cleanedText: null,
		}).create();

		const response = await client
			.post(`/history/drafts/${DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: '  euh bonjour  ' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		response.assertBody({ cleanedText: 'EUH BONJOUR' });
		assert.equal(
			(await Transcript.findOrFail(transcript.id)).cleanedText,
			'EUH BONJOUR'
		);
	});

	test('should clean with the given quality and keep the saved setting when a quality is given', async ({
		client,
		assert,
		cleanup,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: user.id,
			cleanupQuality: 'standard',
		}).create();

		const response = await client
			.post(`/history/drafts/${DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour', cleanupQuality: 'precise' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		assert.equal(textCleaner.receivedPreferences[0]?.quality, 'precise');
		const saved = await UserSetting.findByOrFail('userId', user.id);
		assert.equal(saved.cleanupQuality, 'standard');
	});

	test('should clean with the saved quality when no quality is given', async ({
		client,
		assert,
		cleanup,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: user.id,
			cleanupQuality: 'precise',
		}).create();

		await client
			.post(`/history/drafts/${DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour' })
			.loginAs(user)
			.withCsrfToken();

		assert.equal(textCleaner.receivedPreferences[0]?.quality, 'precise');
	});

	test('should reject a cleanup quality that is unknown', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post(`/history/drafts/${DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour', cleanupQuality: 'ultra' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
	});

	test('should return the cleaned text and create no entry when the draft is unknown', async ({
		client,
		assert,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
			cleanedText: 'Avant.',
		}).create();

		const response = await client
			.post(`/history/drafts/${UNKNOWN_DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		response.assertBody({ cleanedText: 'EUH BONJOUR' });
		assert.lengthOf(await Transcript.query().where('userId', user.id), 1);
		assert.equal(
			(await Transcript.findOrFail(transcript.id)).cleanedText,
			'Avant.'
		);
	});

	test('should not touch the entry of the same draft id of another user', async ({
		client,
		assert,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const foreign = await TranscriptFactory.merge({
			draftId: DRAFT_ID,
			cleanedText: 'Autre.',
		})
			.with('user')
			.create();

		const response = await client
			.post(`/history/drafts/${DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		assert.equal(
			(await Transcript.findOrFail(foreign.id)).cleanedText,
			'Autre.'
		);
	});

	test('should answer 503 with the stable code and store nothing when the cleanup is unavailable', async ({
		client,
		assert,
		cleanup,
	}) => {
		cleanup(
			swapTextCleaner(
				new FakeTextCleaner(new TextCleanupUnavailableException())
			)
		);
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
			cleanedText: null,
		}).create();

		const response = await client
			.post(`/history/drafts/${DRAFT_ID}/clean`)
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(503);
		response.assertBodyContains({ code: 'E_TEXT_CLEANUP_UNAVAILABLE' });
		assert.isNull((await Transcript.findOrFail(transcript.id)).cleanedText);
	});

	test('should reject a draft id that is not a uuid', async ({ client }) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/history/drafts/not-a-uuid/clean')
			.header('Accept', 'application/json')
			.json({ text: 'euh bonjour' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
	});

	test('should reject a text that is {reason}')
		.with([
			{ reason: 'missing', body: {} },
			{ reason: 'blank', body: { text: '   ' } },
			{
				reason: 'too long',
				body: { text: 'a'.repeat(MAX_DRAFT_TEXT_LENGTH + 1) },
			},
		])
		.run(async ({ client }, { body }) => {
			const user = await UserFactory.create();

			const response = await client
				.post(`/history/drafts/${DRAFT_ID}/clean`)
				.header('Accept', 'application/json')
				.json(body)
				.loginAs(user)
				.withCsrfToken();

			response.assertStatus(422);
		});

	test('should answer 429 once the user spent the cleanups of the minute', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const clean = () =>
			client
				.post(`/history/drafts/${DRAFT_ID}/clean`)
				.header('Accept', 'application/json')
				.json({ text: 'euh bonjour' })
				.loginAs(user)
				.withCsrfToken();
		for (let attempt = 0; attempt < CLEANUP_REQUESTS_PER_MINUTE; attempt += 1) {
			await clean();
		}

		const response = await clean();

		response.assertStatus(429);
	});
});
