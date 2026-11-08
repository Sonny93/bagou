import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { CorrectionSuggestionFactory } from '#database/factories/correction_suggestion_factory';
import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';
import { createCorrectionService } from '#tests/helpers/create_correction_service';

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
			cleanupQuality: 'precise',
			cleanupInstructions: 'Use bullet points',
		}).create();

		const response = await client.get('/settings').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('user_settings/show_settings');
		assert.deepEqual(response.inertiaProps.settings, {
			dictationLanguage: 'fr',
			interfaceLanguage: 'system',
			vocabulary: ['Adonis'],
			cleanupQuality: 'precise',
			cleanupInstructions: 'Use bullet points',
		});
		assert.deepEqual(response.inertiaProps.limits, {
			maxVocabularyTerms: 100,
			maxTermLength: 100,
			maxInstructionsLength: 2000,
			maxCorrections: 500,
			maxCorrectionSideLength: 100,
			maxSampleTextLength: 100_000,
		});
		assert.deepEqual(response.inertiaProps.options, {
			dictationLanguages: ['fr', 'en'],
			interfaceLanguages: ['system', 'en', 'fr'],
			cleanupQualities: [
				{ value: 'standard', modelName: 'Claude Haiku 5.5' },
				{ value: 'precise', modelName: 'Claude Sonnet 5.5' },
			],
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
		assert.equal(response.inertiaProps.settings.cleanupQuality, 'standard');
	});

	test('should render the corrections, newest first, with none beyond the speech limit', async ({
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

		const response = await client.get('/settings').loginAs(user).withInertia();

		assert.equal(response.inertiaProps.corrections[0]?.id, vox.id);
		assert.deepEqual(
			response.inertiaProps.corrections.map(
				({ heard, written }: { heard: string; written: string }) => ({
					heard,
					written,
				})
			),
			[
				{ heard: 'vox', written: 'Voxtral' },
				{ heard: 'cloud', written: 'Claude' },
			]
		);
		assert.equal(response.inertiaProps.correctionsBeyondSpeechLimit, 0);
	});

	test('should count the corrected words that do not reach speech recognition against the saved vocabulary', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await UserSettingFactory.merge({
			userId: user.id,
			vocabulary: Array.from({ length: 99 }, (_, index) => `term ${index}`),
		}).create();
		const corrections = createCorrectionService();
		await corrections.add(user.id, { heard: 'a', written: 'Alpha' });
		await corrections.add(user.id, { heard: 'b', written: 'Bravo' });
		await corrections.add(user.id, { heard: 'c', written: 'Charlie' });

		const response = await client.get('/settings').loginAs(user).withInertia();

		assert.equal(response.inertiaProps.correctionsBeyondSpeechLimit, 2);
	});

	test('should render the pending suggestions of the user and not the ones of another user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const otherUser = await UserFactory.create();
		await CorrectionSuggestionFactory.merge({
			userId: user.id,
			heard: 'vox tral',
			written: 'Voxtral',
		}).create();
		await CorrectionSuggestionFactory.merge({
			userId: otherUser.id,
			heard: 'cloud',
			written: 'Claude',
		}).create();

		const response = await client.get('/settings').loginAs(user).withInertia();

		assert.deepEqual(
			response.inertiaProps.pendingSuggestions.map(
				({ heard, written }: { heard: string; written: string }) => ({
					heard,
					written,
				})
			),
			[{ heard: 'vox tral', written: 'Voxtral' }]
		);
	});
});
