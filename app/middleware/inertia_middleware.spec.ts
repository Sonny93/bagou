import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';

test.group('InertiaMiddleware', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should share the interface language of the authenticated user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: user.id,
			interfaceLanguage: 'fr',
		}).create();

		const response = await client.get('/passkeys').loginAs(user).withInertia();

		assert.equal(response.inertiaProps.interfaceLanguage, 'fr');
	});

	test('should share the default interface language when the user never saved settings', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/passkeys').loginAs(user).withInertia();

		assert.equal(response.inertiaProps.interfaceLanguage, 'system');
	});

	test('should share a null interface language with a guest', async ({
		client,
		assert,
	}) => {
		const response = await client.get('/login').withInertia();

		assert.isNull(response.inertiaProps.interfaceLanguage);
	});
});
