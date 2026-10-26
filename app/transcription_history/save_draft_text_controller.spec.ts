import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import Transcript from '#transcription_history/transcript';

const DRAFT_ID = '3f0a1c7e-9d54-4b6a-8e21-5c7d9a0b4f12';
const UNKNOWN_DRAFT_ID = '9b2e4d68-1f3a-4c5b-8d7e-6a0f2c4e8b13';

test.group('SaveDraftTextController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should store the draft text in the entry of the draft of the user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
			cleanedText: 'Bonjour.',
		}).create();

		const response = await client
			.put(`/history/drafts/${DRAFT_ID}`)
			.json({ text: 'Bonjour à tous.' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.equal(
			(await Transcript.findOrFail(transcript.id)).cleanedText,
			'Bonjour à tous.'
		);
	});

	test('should clear the cleaned text when the draft text is blank', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
		}).create();

		const response = await client
			.put(`/history/drafts/${DRAFT_ID}`)
			.json({ text: '' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.isNull((await Transcript.findOrFail(transcript.id)).cleanedText);
	});

	test('should do nothing when the draft has no entry', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
			cleanedText: 'Bonjour.',
		}).create();

		const response = await client
			.put(`/history/drafts/${UNKNOWN_DRAFT_ID}`)
			.json({ text: 'Tapé à la main.' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.lengthOf(await Transcript.query().where('userId', user.id), 1);
		assert.equal(
			(await Transcript.findOrFail(transcript.id)).cleanedText,
			'Bonjour.'
		);
	});

	test('should not touch the entry of the same draft id of another user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const foreign = await TranscriptFactory.merge({
			draftId: DRAFT_ID,
			cleanedText: 'Autre.',
		})
			.with('user')
			.create();

		const response = await client
			.put(`/history/drafts/${DRAFT_ID}`)
			.json({ text: 'Modifié.' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.equal(
			(await Transcript.findOrFail(foreign.id)).cleanedText,
			'Autre.'
		);
	});

	test('should reject a draft id that is not a uuid', async ({ client }) => {
		const user = await UserFactory.create();

		const response = await client
			.put('/history/drafts/not-a-uuid')
			.header('Accept', 'application/json')
			.json({ text: 'Bonjour.' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
	});

	test('should reject a payload without a text', async ({ client }) => {
		const user = await UserFactory.create();

		const response = await client
			.put(`/history/drafts/${DRAFT_ID}`)
			.header('Accept', 'application/json')
			.json({})
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.put(`/history/drafts/${DRAFT_ID}`)
			.json({ text: 'Bonjour.' })
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
