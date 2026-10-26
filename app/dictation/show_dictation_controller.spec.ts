import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';

test.group('ShowDictationController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render the dictation page when visiting the home route', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('dictation/show_dictation');
		response.assertInertiaPropsContains({ remainingMinutes: 60 });
	});

	test('should expose the minutes left today when part of the quota was used', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const quotaService = await app.container.make(DictationQuotaService);
		await quotaService.record(user.id, 20 * 60 * 32_000);

		const response = await client.get('/').loginAs(user).withInertia();

		assert.equal(response.inertiaProps.remainingMinutes, 40);
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
