import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import User from '#users/user';

test.group('ShowChangelogController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/changelog').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should render the changelog page with the version the user last saw', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.merge({ lastSeenVersion: '1.0.1' }).create();

		const response = await client.get('/changelog').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('changelog/show_changelog');
		assert.equal(response.inertiaProps.previousSeenVersion, '1.0.1');
	});

	test('should render a null previous version and store nothing when the user never saw a version', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/changelog').loginAs(user).withInertia();

		assert.isNull(response.inertiaProps.previousSeenVersion);
		assert.isNull((await User.findOrFail(user.id)).lastSeenVersion);
	});
});
