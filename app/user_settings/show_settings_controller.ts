import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import userSettingsConfig from '#config/user_settings';
import { CorrectionSuggestionService } from '#correction_suggestions/correction_suggestion_service';
import CorrectionSuggestionTransformer from '#correction_suggestions/correction_suggestion_transformer';
import { CorrectionService } from '#corrections/correction_service';
import CorrectionTransformer from '#corrections/correction_transformer';
import { MAX_DRAFT_TEXT_LENGTH } from '#dictation/validators/start_dictation_validator';
import { DICTATION_LANGUAGES } from '#shared/dictation_language';
import { toCleanupQualityOptions } from '#text_cleanup/cleanup_quality_options';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import { INTERFACE_LANGUAGES } from '#user_settings/interface_language';
import { UserSettingsService } from '#user_settings/user_settings_service';
import UserSettingsTransformer from '#user_settings/user_settings_transformer';

@inject()
export default class ShowSettingsController {
	constructor(
		private readonly userSettingsService: UserSettingsService,
		private readonly textCleaner: TextCleaner,
		private readonly correctionService: CorrectionService,
		private readonly correctionSuggestionService: CorrectionSuggestionService
	) {}

	async render({ auth, inertia }: HttpContext) {
		const { id: userId } = auth.getUserOrFail();
		const settings = await this.userSettingsService.get(userId);
		const corrections = await this.correctionService.list(userId);
		const pendingSuggestions =
			await this.correctionSuggestionService.listPending(userId);
		const correctionsBeyondSpeechLimit =
			this.correctionService.countBeyondSpeechLimit(
				settings.vocabulary,
				corrections
			);
		return inertia.render('user_settings/show_settings', {
			settings: UserSettingsTransformer.transform(settings),
			corrections: CorrectionTransformer.transform(corrections),
			pendingSuggestions:
				CorrectionSuggestionTransformer.transform(pendingSuggestions),
			correctionsBeyondSpeechLimit,
			limits: {
				maxVocabularyTerms: userSettingsConfig.maxVocabularyTerms,
				maxTermLength: userSettingsConfig.maxTermLength,
				maxInstructionsLength: userSettingsConfig.maxInstructionsLength,
				maxCorrections: userSettingsConfig.maxCorrections,
				maxCorrectionSideLength: userSettingsConfig.maxCorrectionSideLength,
				maxSampleTextLength: MAX_DRAFT_TEXT_LENGTH,
			},
			options: {
				dictationLanguages: [...DICTATION_LANGUAGES],
				interfaceLanguages: [...INTERFACE_LANGUAGES],
				cleanupQualities: toCleanupQualityOptions(this.textCleaner.modelNames),
			},
		});
	}
}
