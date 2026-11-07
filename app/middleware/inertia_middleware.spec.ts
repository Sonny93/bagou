import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { WhatsNewService } from '#changelog/whats_new_service';
import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';

const CURRENT_VERSION = '1.2.0';
const OLDER_VERSION = '0.0.1';

test.group('InertiaMiddleware', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => {
		app.container.swap(
			WhatsNewService,
			() => new WhatsNewService(CURRENT_VERSION)
		);
		return () => app.container.restore(WhatsNewService);
	});

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

	test('should share an unseen current version with a user who never saw one', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/passkeys').loginAs(user).withInertia();

		assert.deepEqual(response.inertiaProps.whatsNew, {
			currentVersion: CURRENT_VERSION,
			hasUnseen: true,
		});
	});

	test('should share an unseen current version with a user who saw an older one', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.merge({
			lastSeenVersion: OLDER_VERSION,
		}).create();

		const response = await client.get('/passkeys').loginAs(user).withInertia();

		assert.isTrue(response.inertiaProps.whatsNew.hasUnseen);
	});

	test('should share a seen current version with a user who saw it', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.merge({
			lastSeenVersion: CURRENT_VERSION,
		}).create();

		const response = await client.get('/passkeys').loginAs(user).withInertia();

		assert.isFalse(response.inertiaProps.whatsNew.hasUnseen);
	});

	test('should share a null what is new with a guest', async ({
		client,
		assert,
	}) => {
		const response = await client.get('/login').withInertia();

		assert.isNull(response.inertiaProps.whatsNew);
	});
});
