import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { swapTextCleaner } from '#tests/helpers/swap_text_cleaner';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import Transcript from '#transcription_history/transcript';

const CLEANUP_REQUESTS_PER_MINUTE = 10;

test.group('CleanTranscriptController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should clean the uncleaned transcript of the user and redirect back', async ({
		client,
		assert,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			rawText: 'euh bonjour',
			cleanedText: null,
		}).create();

		const response = await client
			.post(`/history/${transcript.id}/clean`)
			.header('Referer', '/history?q=euh')
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/history?q=euh');
		await transcript.refresh();
		assert.equal(transcript.cleanedText, 'EUH BONJOUR');
	});

	test('should return 404 and keep the transcript uncleaned when it belongs to another user', async ({
		client,
		assert,
		cleanup,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();
		const foreign = await TranscriptFactory.with('user')
			.merge({ cleanedText: null })
			.create();

		const response = await client
			.post(`/history/${foreign.id}/clean`)
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(404);
		assert.lengthOf(textCleaner.cleaned, 0);
		assert.isNull((await Transcript.findOrFail(foreign.id)).cleanedText);
	});

	test('should not clean again a transcript that is already cleaned', async ({
		client,
		assert,
		cleanup,
	}) => {
		const textCleaner = new FakeTextCleaner();
		cleanup(swapTextCleaner(textCleaner));
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Déjà propre.',
		}).create();

		const response = await client
			.post(`/history/${transcript.id}/clean`)
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		assert.lengthOf(textCleaner.cleaned, 0);
		await transcript.refresh();
		assert.equal(transcript.cleanedText, 'Déjà propre.');
	});

	test('should flash the error and keep the transcript uncleaned when the cleanup is unavailable', async ({
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
			cleanedText: null,
		}).create();

		const response = await client
			.post(`/history/${transcript.id}/clean`)
			.header('Referer', '/history')
			.loginAs(user)
			.withCsrfToken()
			.withSession({})
			.redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage('inputErrorsBag', {
			clean: 'Le nettoyage du texte est indisponible',
		});
		await transcript.refresh();
		assert.isNull(transcript.cleanedText);
	});

	test('should answer 429 once the user spent the cleanups of the minute', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapTextCleaner(new FakeTextCleaner()));
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Propre.',
		}).create();
		const clean = () =>
			client
				.post(`/history/${transcript.id}/clean`)
				.header('Accept', 'application/json')
				.loginAs(user)
				.withCsrfToken()
				.redirects(0);
		for (let attempt = 0; attempt < CLEANUP_REQUESTS_PER_MINUTE; attempt += 1) {
			await clean();
		}

		const response = await clean();

		response.assertStatus(429);
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.post('/history/1/clean')
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
