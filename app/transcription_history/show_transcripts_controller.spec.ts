import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';

test.group('ShowTranscriptsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/history').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should render only the transcripts of the user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: user.id,
			rawText: 'brut',
			cleanedText: 'Propre.',
		}).create();
		await TranscriptFactory.with('user').create();

		const response = await client.get('/history').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('transcription_history/show_transcripts');
		const { data } = response.inertiaProps.transcripts;
		assert.lengthOf(data, 1);
		assert.deepEqual(Object.keys(data[0]).sort(), [
			'cleanedText',
			'createdAt',
			'id',
			'rawText',
		]);
		assert.equal(response.inertiaProps.query, '');
	});

	test('should give the count of all the transcripts of the user, whatever the search', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Une dictée sur Adonis.',
		}).create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Les courses du soir.',
		}).create();
		await TranscriptFactory.with('user').create();

		const response = await client
			.get('/history')
			.qs({ q: 'adonis' })
			.loginAs(user)
			.withInertia();

		assert.equal(response.inertiaProps.transcriptCount, 2);
	});

	test('should filter by the q param and echo it back', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Une dictée sur Adonis.',
		}).create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Les courses du soir.',
		}).create();

		const response = await client
			.get('/history')
			.qs({ q: 'adonis' })
			.loginAs(user)
			.withInertia();

		const { data } = response.inertiaProps.transcripts;
		assert.lengthOf(data, 1);
		assert.equal(data[0].cleanedText, 'Une dictée sur Adonis.');
		assert.equal(response.inertiaProps.query, 'adonis');
	});

	test('should reject a query that is too long', async ({ client }) => {
		const user = await UserFactory.create();

		const response = await client
			.get('/history')
			.qs({ q: 'a'.repeat(201) })
			.header('Accept', 'application/json')
			.loginAs(user);

		response.assertStatus(422);
	});
});
