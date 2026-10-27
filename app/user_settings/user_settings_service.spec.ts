import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';
import UserSetting from '#user_settings/user_setting';
import { UserSettingsService } from '#user_settings/user_settings_service';

test.group('UserSettingsService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return the defaults when the user never saved settings', async ({
		assert,
	}) => {
		const user = await UserFactory.create();

		const settings = await new UserSettingsService().get(user.id);

		assert.deepEqual(settings, {
			dictationLanguage: 'en',
			interfaceLanguage: 'system',
			vocabulary: [],
			cleanupInstructions: '',
		});
	});

	test('should return the saved settings of the user', async ({ assert }) => {
		const user = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: user.id,
			dictationLanguage: 'fr',
			interfaceLanguage: 'en',
			vocabulary: ['Adonis', 'Voxtral'],
			cleanupInstructions: 'Use bullet points',
		}).create();

		const settings = await new UserSettingsService().get(user.id);

		assert.deepEqual(settings, {
			dictationLanguage: 'fr',
			interfaceLanguage: 'en',
			vocabulary: ['Adonis', 'Voxtral'],
			cleanupInstructions: 'Use bullet points',
		});
	});

	test('should create the settings on the first update and replace them on the next one', async ({
		assert,
	}) => {
		const user = await UserFactory.create();
		const service = new UserSettingsService();

		await service.update(user.id, {
			dictationLanguage: 'fr',
			interfaceLanguage: 'fr',
			vocabulary: ['Adonis'],
			cleanupInstructions: 'First',
		});
		await service.update(user.id, {
			dictationLanguage: 'en',
			interfaceLanguage: 'system',
			vocabulary: [],
			cleanupInstructions: '',
		});

		assert.lengthOf(await UserSetting.query().where('userId', user.id), 1);
		assert.deepEqual(await service.get(user.id), {
			dictationLanguage: 'en',
			interfaceLanguage: 'system',
			vocabulary: [],
			cleanupInstructions: '',
		});
	});

	test('should deduplicate the vocabulary while keeping its order', async ({
		assert,
	}) => {
		const user = await UserFactory.create();
		const service = new UserSettingsService();

		await service.update(user.id, {
			dictationLanguage: 'en',
			interfaceLanguage: 'system',
			vocabulary: ['Adonis', 'Voxtral', 'Adonis'],
			cleanupInstructions: '',
		});

		assert.deepEqual((await service.get(user.id)).vocabulary, [
			'Adonis',
			'Voxtral',
		]);
	});

	test('should not touch the settings of another user', async ({ assert }) => {
		const user = await UserFactory.create();
		const other = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: other.id,
			cleanupInstructions: 'Mine',
		}).create();

		await new UserSettingsService().update(user.id, {
			dictationLanguage: 'fr',
			interfaceLanguage: 'system',
			vocabulary: [],
			cleanupInstructions: 'Yours',
		});

		const settings = await new UserSettingsService().get(other.id);
		assert.equal(settings.cleanupInstructions, 'Mine');
	});
});
