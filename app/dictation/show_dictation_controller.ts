import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { CorrectionSuggestionService } from '#correction_suggestions/correction_suggestion_service';
import CorrectionSuggestionTransformer from '#correction_suggestions/correction_suggestion_transformer';
import { CorrectionService } from '#corrections/correction_service';
import CorrectionTransformer from '#corrections/correction_transformer';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { toCleanupQualityOptions } from '#text_cleanup/cleanup_quality_options';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import { UserSettingsService } from '#user_settings/user_settings_service';

@inject()
export default class ShowDictationController {
	constructor(
		private readonly quotaService: DictationQuotaService,
		private readonly textCleaner: TextCleaner,
		private readonly userSettingsService: UserSettingsService,
		private readonly correctionService: CorrectionService,
		private readonly correctionSuggestionService: CorrectionSuggestionService
	) {}

	async render({ auth, inertia }: HttpContext) {
		const { id: userId } = auth.getUserOrFail();
		const settings = await this.userSettingsService.get(userId);
		const remainingMinutes =
			await this.quotaService.getRemainingMinutes(userId);
		const corrections = await this.correctionService.list(userId);
		const pendingSuggestions =
			await this.correctionSuggestionService.listPending(userId);
		const dismissedSuggestions =
			await this.correctionSuggestionService.listDismissedPairs(userId);
		return inertia.render('dictation/show_dictation', {
			remainingMinutes,
			cleanupQualities: toCleanupQualityOptions(this.textCleaner.modelNames),
			cleanupQuality: settings.cleanupQuality,
			corrections: CorrectionTransformer.transform(corrections),
			pendingSuggestions:
				CorrectionSuggestionTransformer.transform(pendingSuggestions),
			dismissedSuggestions,
		});
	}
}
