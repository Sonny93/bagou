import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import correctionSuggestionsConfig from '#config/correction_suggestions';
import userSettingsConfig from '#config/user_settings';
import CorrectionSuggestion from '#correction_suggestions/correction_suggestion';
import { CorrectionSuggestionFactory } from '#database/factories/correction_suggestion_factory';
import { UserFactory } from '#database/factories/user_factory';

const DRAFT_ID = '3f1c2b64-5a0e-4a53-8d62-0c6f6d1d8a11';
const PAIR = { heard: 'Vox Tral', written: 'Voxtral' };

test.group('PushSuggestionsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 401 when the visitor is a guest', async ({
		client,
		assert,
	}) => {
		const response = await client
			.post('/correction-suggestions')
			.header('Accept', 'application/json')
			.json({ draftId: DRAFT_ID, pairs: [PAIR] })
			.withCsrfToken();

		response.assertStatus(401);
		assert.lengthOf(await CorrectionSuggestion.all(), 0);
	});

	test('should store the pairs and answer the pending suggestions', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/correction-suggestions')
			.header('Accept', 'application/json')
			.json({
				draftId: DRAFT_ID,
				pairs: [{ heard: ' Vox Tral ', written: 'Voxtral' }],
			})
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		const [stored] = await CorrectionSuggestion.query().where(
			'userId',
			user.id
		);
		assert.deepEqual(response.body(), {
			pending: [
				{
					id: stored?.id,
					heard: 'Vox Tral',
					written: 'Voxtral',
					createdAt: stored?.createdAt.toJSDate().toISOString(),
				},
			],
		});
	});

	test('should never answer the suggestions of another user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const other = await UserFactory.create();
		await CorrectionSuggestionFactory.merge({ userId: other.id }).create();

		const response = await client
			.post('/correction-suggestions')
			.header('Accept', 'application/json')
			.json({ draftId: DRAFT_ID, pairs: [PAIR] })
			.loginAs(user)
			.withCsrfToken();

		assert.lengthOf(response.body().pending, 1);
		assert.equal(response.body().pending[0].heard, 'Vox Tral');
	});

	test('should answer 422 on pairs when the list is empty', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/correction-suggestions')
			.header('Accept', 'application/json')
			.json({ draftId: DRAFT_ID, pairs: [] })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		assert.deepInclude(response.body().errors[0], {
			field: 'pairs',
			rule: 'array.minLength',
		});
	});

	test('should answer 422 on pairs when there are too many', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const pairs = Array.from(
			{ length: correctionSuggestionsConfig.maxPairsPerPush + 1 },
			(_, index) => ({ heard: `heard ${index}`, written: `written ${index}` })
		);

		const response = await client
			.post('/correction-suggestions')
			.header('Accept', 'application/json')
			.json({ draftId: DRAFT_ID, pairs })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		assert.deepInclude(response.body().errors[0], {
			field: 'pairs',
			rule: 'array.maxLength',
		});
		assert.lengthOf(await CorrectionSuggestion.all(), 0);
	});

	test('should answer 422 on the side when a word is too long', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/correction-suggestions')
			.header('Accept', 'application/json')
			.json({
				draftId: DRAFT_ID,
				pairs: [
					{
						heard: 'x'.repeat(userSettingsConfig.maxCorrectionSideLength + 1),
						written: 'Voxtral',
					},
				],
			})
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		assert.deepInclude(response.body().errors[0], {
			field: 'pairs.0.heard',
			rule: 'maxLength',
		});
	});

	test('should answer 422 on draftId when it is not a uuid', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/correction-suggestions')
			.header('Accept', 'application/json')
			.json({ draftId: 'not-a-uuid', pairs: [PAIR] })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		assert.deepInclude(response.body().errors[0], {
			field: 'draftId',
			rule: 'uuid',
		});
	});
});
