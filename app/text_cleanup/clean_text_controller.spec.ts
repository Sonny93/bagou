import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { swapTextCleaner } from '#tests/helpers/swap_text_cleaner';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';

const CLEANUP_URL = '/dictation/cleanup';
const TOO_LONG_TEXT_LENGTH = 20_001;

test.group('CleanTextController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should refuse a visitor who is not logged in', async ({ client }) => {
		const response = await client
			.post(CLEANUP_URL)
			.withCsrfToken()
			.json({ text: 'bonjour' })
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should return the cleaned text', async ({
		client,
		cleanup,
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();

		const response = await client
			.post(CLEANUP_URL)
			.withCsrfToken()
			.loginAs(user)
			.json({ text: '  euh bonjour  ' });

		response.assertStatus(200);
		assert.deepEqual(response.body(), { text: 'EUH BONJOUR' });
		assert.deepEqual(textCleaner.cleaned, ['euh bonjour']);
	});

	test('should return an empty text without calling the cleaner when the text is empty', async ({
		client,
		cleanup,
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();

		const response = await client
			.post(CLEANUP_URL)
			.withCsrfToken()
			.loginAs(user)
			.json({ text: '' });

		response.assertStatus(200);
		assert.deepEqual(response.body(), { text: '' });
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should reject a text that is not a string or too long')
		.with([{ text: 42 }, { text: 'a'.repeat(TOO_LONG_TEXT_LENGTH) }, {}])
		.run(async ({ client, cleanup }, payload) => {
			cleanup(swapTextCleaner(new FakeTextCleaner()));
			const user = await UserFactory.create();

			const response = await client
				.post(CLEANUP_URL)
				.header('Accept', 'application/json')
				.withCsrfToken()
				.loginAs(user)
				.json(payload);

			response.assertStatus(422);
		});

	test('should answer 503 with a safe message when the cleaner fails', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(
			swapTextCleaner(
				new FakeTextCleaner(new TextCleanupUnavailableException())
			)
		);
		const user = await UserFactory.create();

		const response = await client
			.post(CLEANUP_URL)
			.header('Accept', 'application/json')
			.withCsrfToken()
			.loginAs(user)
			.json({ text: 'bonjour' });

		response.assertStatus(503);
		assert.include(
			JSON.stringify(response.body()),
			'Le nettoyage du texte est indisponible'
		);
	});
});
