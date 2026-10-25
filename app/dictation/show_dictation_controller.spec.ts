import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';

test.group('ShowDictationController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render the dictation page when visiting the home route', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('dictation/show_dictation');
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
