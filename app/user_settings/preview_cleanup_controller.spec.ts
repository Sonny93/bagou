import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { swapTextCleaner } from '#tests/helpers/swap_text_cleaner';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import Transcript from '#transcription_history/transcript';
import UserSetting from '#user_settings/user_setting';

const CLEANUP_REQUESTS_PER_MINUTE = 10;
const VALID_BODY = {
	text: '  euh bonjour  ',
	dictationLanguage: 'fr',
	vocabulary: ['Adonis'],
	cleanupInstructions: 'Use bullet points',
};

test.group('PreviewCleanupController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 401 when the visitor is a guest', async ({ client }) => {
		const response = await client
			.post('/settings/preview')
			.header('Accept', 'application/json')
			.json(VALID_BODY)
			.withCsrfToken();

		response.assertStatus(401);
	});

	test('should answer the cleaned text, cleaned with the body preferences and the trimmed text, and write nothing', async ({
		client,
		assert,
		cleanup,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();

		const response = await client
			.post('/settings/preview')
			.header('Accept', 'application/json')
			.json(VALID_BODY)
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		response.assertBody({ cleanedText: 'EUH BONJOUR' });
		assert.deepEqual(textCleaner.cleaned, ['euh bonjour']);
		assert.deepEqual(textCleaner.receivedPreferences, [
			{
				language: 'fr',
				vocabulary: ['Adonis'],
				instructions: 'Use bullet points',
			},
		]);
		assert.lengthOf(await UserSetting.query().where('userId', user.id), 0);
		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should accept empty cleanup instructions and an empty vocabulary', async ({
		client,
		assert,
		cleanup,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();

		const response = await client
			.post('/settings/preview')
			.header('Accept', 'application/json')
			.json({ ...VALID_BODY, vocabulary: [], cleanupInstructions: '' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		assert.deepEqual(textCleaner.receivedPreferences, [
			{ language: 'fr', vocabulary: [], instructions: '' },
		]);
	});

	test('should answer 422 with the failed rule and clean nothing when the text is blank', async ({
		client,
		assert,
		cleanup,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();

		const response = await client
			.post('/settings/preview')
			.header('Accept', 'application/json')
			.json({ ...VALID_BODY, text: '   ' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		response.assertBodyContains({
			errors: [{ field: 'text', rule: 'required' }],
		});
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should answer 422 when the language is not offered', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();

		const response = await client
			.post('/settings/preview')
			.header('Accept', 'application/json')
			.json({ ...VALID_BODY, dictationLanguage: 'de' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		response.assertBodyContains({
			errors: [{ field: 'dictationLanguage', rule: 'enum' }],
		});
	});

	test('should answer the stable cleanup error code when the cleanup is unavailable', async ({
		client,
		cleanup,
	}) => {
		cleanup(
			swapTextCleaner(
				new FakeTextCleaner(new TextCleanupUnavailableException())
			)
		);
		const user = await UserFactory.create();

		const response = await client
			.post('/settings/preview')
			.header('Accept', 'application/json')
			.json(VALID_BODY)
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(503);
		response.assertBodyContains({ code: 'E_TEXT_CLEANUP_UNAVAILABLE' });
	});

	test('should answer 429 once the user spent the cleanups of the minute', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const preview = () =>
			client
				.post('/settings/preview')
				.json(VALID_BODY)
				.loginAs(user)
				.withCsrfToken();
		for (let attempt = 0; attempt < CLEANUP_REQUESTS_PER_MINUTE; attempt += 1) {
			await preview();
		}

		const response = await preview();

		response.assertStatus(429);
	});
});
