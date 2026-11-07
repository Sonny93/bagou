import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import correctionSuggestionsConfig from '#config/correction_suggestions';
import CorrectionSuggestion, {
	CORRECTION_SUGGESTION_STATUS,
} from '#correction_suggestions/correction_suggestion';
import { UserFactory } from '#database/factories/user_factory';

const PAIR = { heard: 'Vox Tral', written: 'Voxtral' };

test.group('DismissSuggestionsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 401 when the visitor is a guest', async ({
		client,
		assert,
	}) => {
		const response = await client
			.post('/correction-suggestions/dismissals')
			.header('Accept', 'application/json')
			.json({ pairs: [PAIR] })
			.withCsrfToken();

		response.assertStatus(401);
		assert.lengthOf(await CorrectionSuggestion.all(), 0);
	});

	test('should answer 204 and store the pairs as dismissed for the user only', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const other = await UserFactory.create();

		const response = await client
			.post('/correction-suggestions/dismissals')
			.header('Accept', 'application/json')
			.json({ pairs: [PAIR] })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		const stored = await CorrectionSuggestion.all();
		assert.lengthOf(stored, 1);
		assert.equal(stored[0]?.userId, user.id);
		assert.equal(stored[0]?.status, CORRECTION_SUGGESTION_STATUS.dismissed);
		assert.lengthOf(
			await CorrectionSuggestion.query().where('userId', other.id),
			0
		);
	});

	test('should answer 422 on pairs when the list is empty', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/correction-suggestions/dismissals')
			.header('Accept', 'application/json')
			.json({ pairs: [] })
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
			{ length: correctionSuggestionsConfig.maxDismissalsPerRequest + 1 },
			(_, index) => ({ heard: `heard ${index}`, written: `written ${index}` })
		);

		const response = await client
			.post('/correction-suggestions/dismissals')
			.header('Accept', 'application/json')
			.json({ pairs })
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
			.post('/correction-suggestions/dismissals')
			.header('Accept', 'application/json')
			.json({ pairs: [{ heard: 'x'.repeat(101), written: 'Voxtral' }] })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		assert.deepInclude(response.body().errors[0], {
			field: 'pairs.0.heard',
			rule: 'maxLength',
		});
	});
});
