import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { UserSettingsService } from '#user_settings/user_settings_service';

const VALID_BODY = {
	dictationLanguage: 'fr',
	interfaceLanguage: 'en',
	vocabulary: ['Adonis', 'Adonis', 'Voxtral'],
	cleanupInstructions: 'Use bullet points',
};

test.group('UpdateSettingsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.put('/settings')
			.json(VALID_BODY)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should save the deduplicated settings and redirect back', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.put('/settings')
			.header('Referer', '/settings')
			.json(VALID_BODY)
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/settings');
		assert.deepEqual(await new UserSettingsService().get(user.id), {
			dictationLanguage: 'fr',
			interfaceLanguage: 'en',
			vocabulary: ['Adonis', 'Voxtral'],
			cleanupInstructions: 'Use bullet points',
		});
	});

	test('should save empty cleanup instructions', async ({ client, assert }) => {
		const user = await UserFactory.create();

		await client
			.put('/settings')
			.json({ ...VALID_BODY, cleanupInstructions: '' })
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		const settings = await new UserSettingsService().get(user.id);
		assert.equal(settings.cleanupInstructions, '');
	});

	test('should answer 422 with the failed rules and save nothing when the body is invalid', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.put('/settings')
			.header('Accept', 'application/json')
			.json({ ...VALID_BODY, dictationLanguage: 'de' })
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(422);
		response.assertBodyContains({
			errors: [{ field: 'dictationLanguage', rule: 'enum', message: 'enum' }],
		});
		assert.equal(
			(await new UserSettingsService().get(user.id)).dictationLanguage,
			'en'
		);
	});
});
