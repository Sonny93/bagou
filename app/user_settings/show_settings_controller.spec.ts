import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';

test.group('ShowSettingsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/settings').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should render the saved settings with the limits and the options', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: user.id,
			dictationLanguage: 'fr',
			vocabulary: ['Adonis'],
			cleanupInstructions: 'Use bullet points',
		}).create();

		const response = await client.get('/settings').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('user_settings/show_settings');
		assert.deepEqual(response.inertiaProps.settings, {
			dictationLanguage: 'fr',
			interfaceLanguage: 'system',
			vocabulary: ['Adonis'],
			cleanupInstructions: 'Use bullet points',
		});
		assert.deepEqual(response.inertiaProps.limits, {
			maxVocabularyTerms: 100,
			maxTermLength: 100,
			maxInstructionsLength: 2000,
		});
		assert.deepEqual(response.inertiaProps.options, {
			dictationLanguages: ['fr', 'en'],
			interfaceLanguages: ['system', 'en', 'fr'],
		});
	});

	test('should render the defaults when the user never saved settings', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/settings').loginAs(user).withInertia();

		assert.equal(response.inertiaProps.settings.dictationLanguage, 'en');
		assert.deepEqual(response.inertiaProps.settings.vocabulary, []);
	});
});
