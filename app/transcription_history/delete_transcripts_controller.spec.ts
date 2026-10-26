import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import Transcript from '#transcription_history/transcript';

test.group('DeleteTranscriptsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should delete all the transcripts of the user only and redirect back', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await TranscriptFactory.merge({ userId: user.id }).createMany(2);
		const foreign = await TranscriptFactory.with('user').create();

		const response = await client
			.delete('/history')
			.header('Referer', '/history')
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/history');
		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
		assert.isNotNull(await Transcript.find(foreign.id));
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.delete('/history')
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
