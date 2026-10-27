import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import userSettingsConfig from '#config/user_settings';
import { DICTATION_LANGUAGES } from '#shared/dictation_language';
import { INTERFACE_LANGUAGES } from '#user_settings/interface_language';
import { UserSettingsService } from '#user_settings/user_settings_service';
import UserSettingsTransformer from '#user_settings/user_settings_transformer';

@inject()
export default class ShowSettingsController {
	constructor(private readonly userSettingsService: UserSettingsService) {}

	async render({ auth, inertia }: HttpContext) {
		const settings = await this.userSettingsService.get(
			auth.getUserOrFail().id
		);
		return inertia.render('user_settings/show_settings', {
			settings: UserSettingsTransformer.transform(settings),
			limits: {
				maxVocabularyTerms: userSettingsConfig.maxVocabularyTerms,
				maxTermLength: userSettingsConfig.maxTermLength,
				maxInstructionsLength: userSettingsConfig.maxInstructionsLength,
			},
			options: {
				dictationLanguages: [...DICTATION_LANGUAGES],
				interfaceLanguages: [...INTERFACE_LANGUAGES],
			},
		});
	}
}
