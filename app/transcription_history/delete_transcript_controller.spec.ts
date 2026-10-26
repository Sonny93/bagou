import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import Transcript from '#transcription_history/transcript';

test.group('DeleteTranscriptController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should delete the transcript of the user and redirect back', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
		}).create();

		const response = await client
			.delete(`/history/${transcript.id}`)
			.header('Referer', '/history?q=a')
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/history?q=a');
		assert.isNull(await Transcript.find(transcript.id));
	});

	test('should return 404 and keep the transcript when it belongs to another user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const foreign = await TranscriptFactory.with('user').create();

		const response = await client
			.delete(`/history/${foreign.id}`)
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(404);
		assert.isNotNull(await Transcript.find(foreign.id));
	});

	test('should return 404 when the id is not a number', async ({ client }) => {
		const user = await UserFactory.create();

		const response = await client
			.delete('/history/not-a-number')
			.header('Accept', 'application/json')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(404);
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.delete('/history/1')
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
