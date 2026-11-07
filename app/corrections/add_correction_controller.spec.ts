import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import Correction from '#corrections/correction';
import { UserFactory } from '#database/factories/user_factory';

test.group('AddCorrectionController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 401 when the visitor is a guest', async ({
		client,
		assert,
	}) => {
		const response = await client
			.post('/corrections')
			.header('Accept', 'application/json')
			.json({ heard: 'cloud', written: 'Claude' })
			.withCsrfToken();

		response.assertStatus(401);
		assert.lengthOf(await Correction.all(), 0);
	});

	test('should store the pair and answer its id, heard and written words', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/corrections')
			.header('Accept', 'application/json')
			.json({ heard: ' cloud ', written: 'Claude' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		const [stored] = await Correction.query().where('userId', user.id);
		assert.deepEqual(response.body(), {
			id: stored?.id,
			heard: 'cloud',
			written: 'Claude',
		});
	});

	test('should answer the same pair when it is added twice', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const addPair = () =>
			client
				.post('/corrections')
				.header('Accept', 'application/json')
				.json({ heard: 'cloud', written: 'Claude' })
				.loginAs(user)
				.withCsrfToken();

		const first = await addPair();
		const second = await addPair();

		second.assertStatus(200);
		assert.equal(second.body().id, first.body().id);
		assert.lengthOf(await Correction.query().where('userId', user.id), 1);
	});

	test('should answer 422 with the failed rule and store nothing when the sides are identical', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/corrections')
			.header('Accept', 'application/json')
			.json({ heard: 'Claude', written: 'Claude' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		assert.deepInclude(response.body().errors[0], {
			field: 'written',
			rule: 'notSameAs',
		});
		assert.lengthOf(await Correction.all(), 0);
	});

	test('should answer 422 with E_CORRECTIONS_FULL when the user reached the cap', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await Correction.createMany(
			Array.from({ length: 500 }, (_, index) => ({
				userId: user.id,
				heard: `heard ${index}`,
				written: `written ${index}`,
			}))
		);

		const response = await client
			.post('/corrections')
			.header('Accept', 'application/json')
			.json({ heard: 'cloud', written: 'Claude' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		assert.equal(response.body().code, 'E_CORRECTIONS_FULL');
	});
});
