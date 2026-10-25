import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';

test.group('LogoutController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return 404 for GET /logout since only POST is registered', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/logout').loginAs(user);

		response.assertStatus(404);
	});

	test('should not log the user out when the CSRF token is missing', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client.post('/logout').loginAs(user).redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage('error');
	});

	test('should log the user out and redirect to the login page when the CSRF token is valid', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/logout')
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should redirect a guest to the login page when posting to /logout', async ({
		client,
	}) => {
		const response = await client.post('/logout').withCsrfToken().redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
