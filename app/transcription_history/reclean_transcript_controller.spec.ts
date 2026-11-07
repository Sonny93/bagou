import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { swapTextCleaner } from '#tests/helpers/swap_text_cleaner';
import TextCleanupTimeoutException from '#text_cleanup/text_cleanup_timeout_exception';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import Transcript from '#transcription_history/transcript';
import UserSetting from '#user_settings/user_setting';

const CLEANUP_REQUESTS_PER_MINUTE = 10;

test.group('RecleanTranscriptController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 401 when the visitor is a guest', async ({ client }) => {
		const response = await client
			.post('/history/1/reclean')
			.header('Accept', 'application/json')
			.json({ cleanupQuality: 'precise' })
			.withCsrfToken();

		response.assertStatus(401);
	});

	test('should return the raw text cleaned with the given quality and store nothing', async ({
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
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			rawText: 'euh bonjour',
			cleanedText: 'Bonjour.',
		}).create();

		const response = await client
			.post(`/history/${transcript.id}/reclean`)
			.header('Accept', 'application/json')
			.json({ cleanupQuality: 'precise' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		response.assertBody({ cleanedText: 'EUH BONJOUR' });
		assert.equal(textCleaner.receivedPreferences[0]?.quality, 'precise');
		assert.equal(
			(await Transcript.findOrFail(transcript.id)).cleanedText,
			'Bonjour.'
		);
		const saved = await UserSetting.findByOrFail('userId', user.id);
		assert.equal(saved.cleanupQuality, 'standard');
	});

	test('should answer 404 when the entry belongs to another user', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const foreign = await TranscriptFactory.with('user').create();

		const response = await client
			.post(`/history/${foreign.id}/reclean`)
			.header('Accept', 'application/json')
			.json({ cleanupQuality: 'standard' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(404);
	});

	test('should reject a cleanup quality that is {reason}')
		.with([
			{ reason: 'missing', body: {} },
			{ reason: 'unknown', body: { cleanupQuality: 'ultra' } },
		])
		.run(async ({ client }, { body }) => {
			const user = await UserFactory.create();
			const transcript = await TranscriptFactory.merge({
				userId: user.id,
			}).create();

			const response = await client
				.post(`/history/${transcript.id}/reclean`)
				.header('Accept', 'application/json')
				.json(body)
				.loginAs(user)
				.withCsrfToken();

			response.assertStatus(422);
		});

	test('should pass the stable code of a cleanup failure through', async ({
		client,
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
		}).create();

		const response = await client
			.post(`/history/${transcript.id}/reclean`)
			.header('Accept', 'application/json')
			.json({ cleanupQuality: 'standard' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(503);
		response.assertBodyContains({ code: 'E_TEXT_CLEANUP_UNAVAILABLE' });
	});

	test('should pass the stable code of a cleanup timeout through', async ({
		client,
		cleanup,
	}) => {
		cleanup(
			swapTextCleaner(new FakeTextCleaner(new TextCleanupTimeoutException()))
		);
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
		}).create();

		const response = await client
			.post(`/history/${transcript.id}/reclean`)
			.header('Accept', 'application/json')
			.json({ cleanupQuality: 'standard' })
			.loginAs(user)
			.withCsrfToken();

		response.assertBodyContains({ code: 'E_TEXT_CLEANUP_TIMEOUT' });
	});

	test('should answer 429 once the user spent the cleanups of the minute', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
		}).create();
		const reclean = () =>
			client
				.post(`/history/${transcript.id}/reclean`)
				.header('Accept', 'application/json')
				.json({ cleanupQuality: 'standard' })
				.loginAs(user)
				.withCsrfToken();
		for (let attempt = 0; attempt < CLEANUP_REQUESTS_PER_MINUTE; attempt += 1) {
			await reclean();
		}

		const response = await reclean();

		response.assertStatus(429);
	});
});
