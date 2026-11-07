import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { WhatsNewService } from '#changelog/whats_new_service';
import { UserFactory } from '#database/factories/user_factory';
import User from '#users/user';

const CURRENT_VERSION = '1.2.0';
const OLDER_VERSION = '0.0.1';
const NEWER_VERSION = '999.0.0';

test.group('MarkChangelogSeenController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => {
		app.container.swap(
			WhatsNewService,
			() => new WhatsNewService(CURRENT_VERSION)
		);
		return () => app.container.restore(WhatsNewService);
	});

	test('should store the current version when the user never saw one', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/changelog/seen')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.equal(
			(await User.findOrFail(user.id)).lastSeenVersion,
			CURRENT_VERSION
		);
	});

	test('should store the current version when the stored one is older', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.merge({
			lastSeenVersion: OLDER_VERSION,
		}).create();

		const response = await client
			.post('/changelog/seen')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.equal(
			(await User.findOrFail(user.id)).lastSeenVersion,
			CURRENT_VERSION
		);
	});

	test('should keep the stored version when it is newer than the current one', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.merge({
			lastSeenVersion: NEWER_VERSION,
		}).create();

		const response = await client
			.post('/changelog/seen')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(204);
		assert.equal(
			(await User.findOrFail(user.id)).lastSeenVersion,
			NEWER_VERSION
		);
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.post('/changelog/seen')
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
