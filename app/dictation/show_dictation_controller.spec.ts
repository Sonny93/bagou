import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import dictationConfig from '#config/dictation';
import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { createCorrectionService } from '#tests/helpers/create_correction_service';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const SECONDS_PER_MINUTE = 60;
const USED_MINUTES = 20;

test.group('ShowDictationController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render the dictation page when visiting the home route', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client.get('/').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('dictation/show_dictation');
		response.assertInertiaPropsContains({
			remainingMinutes: dictationConfig.dailyQuotaMinutes,
		});
	});

	test('should expose the minutes left today when part of the quota was used', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const quotaService = await app.container.make(DictationQuotaService);
		await quotaService.record(
			user.id,
			USED_MINUTES * SECONDS_PER_MINUTE * PCM_AUDIO_FORMAT.bytesPerSecond
		);

		const response = await client.get('/').loginAs(user).withInertia();

		assert.equal(
			response.inertiaProps.remainingMinutes,
			dictationConfig.dailyQuotaMinutes - USED_MINUTES
		);
	});

	test('should expose the cleanup models and the saved cleanup quality', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: user.id,
			cleanupQuality: 'precise',
		}).create();

		const response = await client.get('/').loginAs(user).withInertia();

		assert.deepEqual(response.inertiaProps.cleanupQualities, [
			{ value: 'standard', modelName: 'Claude Haiku 5.5' },
			{ value: 'precise', modelName: 'Claude Sonnet 5.5' },
		]);
		assert.equal(response.inertiaProps.cleanupQuality, 'precise');
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should expose the stored corrections, newest first', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const corrections = createCorrectionService();
		await corrections.add(user.id, { heard: 'cloud', written: 'Claude' });
		const vox = await corrections.add(user.id, {
			heard: 'vox',
			written: 'Voxtral',
		});

		const response = await client.get('/').loginAs(user).withInertia();

		assert.deepEqual(response.inertiaProps.corrections[0], {
			id: vox.id,
			heard: 'vox',
			written: 'Voxtral',
		});
		assert.lengthOf(response.inertiaProps.corrections, 2);
	});
});
