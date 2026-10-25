import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import User from '#users/user';
import { UserService } from '#users/user_service';

test.group('UserService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should find no owner when no user exists', async ({ assert }) => {
		const service = await app.container.make(UserService);

		assert.isNull(await service.findOwner());
	});

	test('should create the owner on first call and reuse it afterwards', async ({
		assert,
	}) => {
		const service = await app.container.make(UserService);

		const firstOwner = await service.findOrCreateOwner();
		const secondOwner = await service.findOrCreateOwner();

		assert.equal(secondOwner.id, firstOwner.id);
		assert.equal((await User.all()).length, 1);
	});

	test('should return the existing user as owner', async ({ assert }) => {
		const existingUser = await UserFactory.create();
		const service = await app.container.make(UserService);

		const owner = await service.findOrCreateOwner();

		assert.equal(owner.id, existingUser.id);
		assert.equal((await service.findOwner())?.id, existingUser.id);
	});
});
