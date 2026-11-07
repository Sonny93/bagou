import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import Correction from '#corrections/correction';
import { CorrectionFactory } from '#database/factories/correction_factory';
import { UserFactory } from '#database/factories/user_factory';

test.group('DeleteCorrectionController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 401 when the visitor is a guest', async ({
		client,
		assert,
	}) => {
		const owner = await UserFactory.create();
		const correction = await CorrectionFactory.merge({
			userId: owner.id,
		}).create();

		const response = await client
			.delete(`/corrections/${correction.id}`)
			.header('Accept', 'application/json')
			.withCsrfToken();

		response.assertStatus(401);
		assert.lengthOf(await Correction.all(), 1);
	});

	test('should delete the pair and answer 204', async ({ client, assert }) => {
		const user = await UserFactory.create();
		const correction = await CorrectionFactory.merge({
			userId: user.id,
		}).create();

		const response = await client
			.delete(`/corrections/${correction.id}`)
			.header('Accept', 'application/json')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.lengthOf(await Correction.all(), 0);
	});

	test('should answer 204 when the pair is already gone', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.delete('/corrections/999999')
			.header('Accept', 'application/json')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
	});

	test('should answer 204 and keep the pair when it belongs to another user', async ({
		client,
		assert,
	}) => {
		const owner = await UserFactory.create();
		const stranger = await UserFactory.create();
		const correction = await CorrectionFactory.merge({
			userId: owner.id,
		}).create();

		const response = await client
			.delete(`/corrections/${correction.id}`)
			.header('Accept', 'application/json')
			.loginAs(stranger)
			.withCsrfToken();

		response.assertStatus(204);
		assert.lengthOf(await Correction.query().where('userId', owner.id), 1);
	});
});
