import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';

test.group('ShowLoginController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/login').withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('passkeys/show_login');
	});

	test('should redirect to the dictation page when the user is already logged in', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/login').loginAs(user).redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/');
	});
});
